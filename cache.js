const sessionsCache = [];

console.log({ sessionsCache });

const storeCacheSession = async (username, jti, sessionData) => {
    sessionsCache.push({
        username,
        jti,
        sessionData,
    });
};

module.exports = {
    storeCacheSession,
};
