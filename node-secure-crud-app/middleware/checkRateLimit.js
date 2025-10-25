const User = require('../models/userModels')
const RateLimitCheck = require('../models/rateLimitCheckModels')
const { sequelize } = require('../configs/mysql');

async function checkLoginLimit(username) {
  return await sequelize.transaction(async (t) => {
    const user = await User.findOne({
      where: { username },
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    
    if (!user){
      console.log('User not found for rate limit check');
      return null;
    }
    
    let rateLimit = await RateLimitCheck.findOne({
      where: { userId: user.id },
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    
    if (!rateLimit) {
      rateLimit = await RateLimitCheck.create({
        userId: user.id,
        tries: 1,
        blockExpireDate: new Date(Date.now() + 10 * 60 * 1000)
      }, { transaction: t });
    } else {
      if (rateLimit.tries < 5) {
        // increment() metodundan istifadə et - atomik əməliyyat
        await rateLimit.increment('tries', { 
          by: 1, 
          transaction: t 
        });
        // yenilənmiş dəyəri yüklə
        await rateLimit.reload({ transaction: t });
      }
    }
    
    return rateLimit;
  });
}






module.exports=checkLoginLimit