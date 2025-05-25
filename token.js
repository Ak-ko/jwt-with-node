const jwt = require("jsonwebtoken");

const generateTokens = (username, jti) => {
    const accessToken = jwt.sign(
        { username },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "15m",
        }
    );

    const refreshToken = jwt.sign(
        { username, jti },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "1d",
        }
    );

    return {
        accessToken,
        refreshToken,
    };
};

const decryptAccessToken = async (token) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

const decryptRefreshToken = async (token) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

module.exports = {
    generateTokens,
    decryptAccessToken,
    decryptRefreshToken,
};
