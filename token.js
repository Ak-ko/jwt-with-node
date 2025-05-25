const jwt = require("jsonwebtoken");

const generateTokens = (username, jti) => {
    const accessToken = jwt.sign(
        { username },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "5000ms",
        }
    );

    const refreshToken = jwt.sign(
        { username, jti },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "15m",
        }
    );

    return {
        accessToken,
        refreshToken,
    };
};

const decryptAccessToken = async (token) => {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return false;
        }
        return false;
    }
};

const decryptRefreshToken = async (token) => {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return false;
        }
        return false;
    }
};

module.exports = {
    generateTokens,
    decryptAccessToken,
    decryptRefreshToken,
};
