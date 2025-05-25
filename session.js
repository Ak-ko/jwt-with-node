const { storeCacheSession } = require("./cache");

const { sessions } = require("./database");

const storeSession = async (sessionData) => {
    sessions.push(sessionData);
};

const createSession = async (username, jti, refreshToken, metadata) => {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const sessionData = {
        username,
        jti,
        refreshToken,
        device: metadata.device || "unknown",
        ip: metadata.ip || "0.0.0.0",
        expiresAt,
    };

    await storeSession(sessionData);

    await storeCacheSession(username, jti, {
        refreshToken,
        device: sessionData.device,
        ip: sessionData.ip,
        createdAt: Date.now(),
        expiresAt: expiresAt.toISOString(),
    });
};

module.exports = {
    sessions,
    createSession,
};
