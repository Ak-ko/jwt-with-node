const {
    storeCacheSession,
    getCacheSession,
    removeCachedSession,
} = require("./cache");

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

const getSession = async (username, jti, refreshToken) => {
    let cachedSessionData = await getCacheSession(username, jti);

    if (!cachedSessionData) {
        const dbSession = sessions.find((session) => {
            return session.username === username && session.jti === jti;
        });

        if (!dbSession || dbSession.refreshToken !== refreshToken) {
            return false;
        }

        if (dbSession.expiresAt < new Date()) {
            await removeCachedSession(username, jti);
            return false;
        }

        cachedSessionData = {
            refreshToken: dbSession.refreshToken,
            device: dbSession.device,
            ip: dbSession.ip,
            expiresAt: dbSession.expiresAt.toISOString(),
            createdAt: dbSession.createdAt.toISOString(),
        };

        await storeCacheSession(username, jti, cachedSessionData);
    }

    if (cachedSessionData.refreshToken !== refreshToken) {
        throw { message: "Invalid refresh token in cache" };
    }

    if (new Date(cachedSessionData.expiresAt) < new Date()) {
        await removeCachedSession(username, jti);
        throw { message: "Session expired" };
    }

    const payload = { username, jti };

    return { payload, session: cachedSessionData };
};

module.exports = {
    sessions,
    createSession,
    getSession,
};
