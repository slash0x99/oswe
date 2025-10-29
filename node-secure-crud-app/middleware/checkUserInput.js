

function validateUserInput(input) {

    const blacklist = ['<', '>', '"', "'", '`', ';', '(', ')', '{', '}', '[', ']', '=', '+', '-', '/', '\\', '|', '&', '%', '$', '#', '@', '!', '~', '^'];

    if (typeof input !== 'string') {
        throw new Error('Input must be a string');
    }

    for (const char of blacklist) {
        if (input.includes(char)) {
            return {
                'status': 'error',
                'message': `Invalid character detected: ${char}`
            }
        }
    }

    return {
        'status': 'success',
    };
}


function sanitizeInput(input) {
    const blacklist = ['<', '>', '"', "'", '`', ';', '(', ')', '{', '}', '[', ']', '=', '+', '-', '/', '\\', '|', '&', '%', '$', '#', '@', '!', '~', '^'];

    blacklist.forEach(char => {
        const regex = new RegExp(`\\${char}`, 'g');
        input = input.replace(regex, '');
    });

    return input;
}

module.exports = { validateUserInput,sanitizeInput };