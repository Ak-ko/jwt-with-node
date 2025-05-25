const sessionsCache = [];

const storeCacheSession = async (username, jti, sessionData) => {
    sessionsCache.push({
        username,
        jti,
        sessionData,
    });
};

const getCacheSession = async (username, jti) => {
    const foundSession = sessionsCache.find(
        (session) => session.username === username && session.jti === jti
    );
    if (!foundSession) {
        return null;
    }
    return foundSession.sessionData;
};

const removeCachedSession = async (username, jti) => {
    const leftSessionsCache = sessionsCache.filter(
        (sc) => sc.username !== username && sc.jti !== jti
    );
    sessionsCache = leftSessionsCache;
};

module.exports = {
    storeCacheSession,
    getCacheSession,
    removeCachedSession,
};
