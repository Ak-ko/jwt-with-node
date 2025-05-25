const deviceMiddleware = (req, res, next) => {
    const deviceId = req.headers["x-device-id"];
    const platform = req.headers["x-platform"];
    const userAgent = req.headers["user-agent"] || "Unknown";

    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    ip = ip.replace(/^::ffff:/, "");

    if (!deviceId || deviceId.length === 0) {
        return res
            .status(400)
            .json({ error: "Missing 'x-device-id' in request headers" });
    }

    if (!platform || platform.length === 0) {
        return res
            .status(400)
            .json({ error: "Missing 'x-platform' in request headers" });
    }

    req.deviceInfo = {
        deviceId,
        platform,
        ip,
        userAgent,
    };

    next();
};

module.exports = {
    deviceMiddleware,
};
