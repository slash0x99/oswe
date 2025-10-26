const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config({ path: './configs/.env' });
const { getTokenFromHeader } = require('./getTokenFromHeader');

const { JWT_SECRET_KEY, CSRF_SECRET_KEY } = process.env;

// generate CSRF token
function generateCSRFToken(req, res, next) {
  try {
    const token =req.cookies["accessToken"] || null

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    const userId = decoded.userId;

    const randomPart = crypto.randomBytes(16).toString('hex');
    const hmac = crypto
      .createHmac('sha256', CSRF_SECRET_KEY)
      .update(userId + randomPart)
      .digest('hex');

    const csrfToken = `${randomPart}.${hmac}`;
    res.cookie('mycsrfToken', csrfToken, {
      httpOnly: true,
      sameSite: 'Strict',
    });
    req.csrfToken = csrfToken;

    next();
  } catch (err) {
    return next();
  }
}

// validate CSRF token
function validateCSRFToken(req, res, next) {
  try {

    const token =req.cookies["accessToken"] || null

    if (!token) {
      return res.status(401).send('Missing authorization token');
    }


    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    const userId = decoded.userId;

    const csrfToken = req.cookies.mycsrfToken;
    const sentToken = req.body.csrfToken;

    if (!csrfToken || !sentToken) {
      return res.status(403).send('CSRF token missing');
    }

    const [randomPart, hmac] = csrfToken.split('.');
    const expectedHmac = crypto
      .createHmac('sha256', CSRF_SECRET_KEY)
      .update(userId + randomPart)
      .digest('hex');

    if (hmac === expectedHmac && sentToken === csrfToken) {
      next();
    } else {
      res.status(403).send('Invalid CSRF token');
    }
  } catch (err) {
    return res.status(401).send('CSRF validation failed');
  }
}

module.exports = {
  generateCSRFToken,
  validateCSRFToken,
};
