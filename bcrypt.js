const bcrypt = require("bcrypt");

const saltRounds = 10;

const hashPassword = async (plainPassword) => {
    if (!plainPassword) return;
    return bcrypt.hash(plainPassword, saltRounds);
};

const comparePasswords = async (plainPassword, hashedPassword) => {
    if (!plainPassword || !hashedPassword) return;

    return bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
    hashPassword,
    comparePasswords,
};
