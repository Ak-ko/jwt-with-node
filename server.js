const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const env = require("dotenv");

const { users } = require("./database");

env.config();

app.use(
    cors({
        origin: "http://127.0.0.1:5500", // Replace with your frontend URL ( in this case, I use just a live-server )
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["*"],
        credentials: false,
    })
);
app.use(express.json());
app.use(morgan("dev"));

const port = 3000;

const {
    generateTokens,
    decryptRefreshToken,
    decryptAccessToken,
} = require("./token");
const { comparePasswords } = require("./bcrypt");
const { createSession, getSession } = require("./session");
const { deviceMiddleware } = require("./middleware");

app.get("/api/hello-world", (req, res) => {
    res.json({
        message: "Hello World!",
    });
});

app.post("/api/login", deviceMiddleware, async (req, res) => {
    const { username, password } = req.body;

    const foundUser = users.find((user) => user.username === username);

    if (!foundUser) {
        return res.status(401).json({
            message: "User not found with this username.",
        });
    }

    const isPasswordCorrect = comparePasswords(password, foundUser.password);

    if (!isPasswordCorrect) {
        return res.status(401).json({
            message: "Password is incorrect.",
        });
    }

    const jti = crypto.randomUUID();

    const { accessToken, refreshToken } = generateTokens(username, jti);

    await createSession(username, jti, refreshToken, {
        device: req.deviceInfo.deviceId,
        platform: req.deviceInfo.platform,
        ip: req.deviceInfo.ip,
        userAgent: req.deviceInfo.userAgent,
    });

    res.json({
        data: { accessToken, refreshToken },
    });
});

app.post("/api/register", deviceMiddleware, async (req, res) => {
    const { username, password } = req.body;

    const foundUser = users.find((user) => user.username === username);

    if (foundUser) {
        return res.status(401).json({
            message: "User already registered.",
        });
    }

    users.push({ username, password });

    const jti = crypto.randomUUID();

    const { accessToken, refreshToken } = generateTokens(username, jti);

    await createSession(username, jti, refreshToken, {
        device: req.deviceInfo.deviceId,
        platform: req.deviceInfo.platform,
        ip: req.deviceInfo.ip,
        userAgent: req.deviceInfo.userAgent,
    });

    res.json({
        data: { accessToken, refreshToken },
    });
});

app.post("/api/refresh-token", async (req, res, next) => {
    try {
        const refreshToken = req?.headers?.authorization?.split(" ")[1];

        if (!refreshToken) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const decodedRefreshToken = await decryptRefreshToken(refreshToken);
        if (!decodedRefreshToken) {
            return res.status(401).json({
                message: "Invalid Token or Expired",
            });
        }

        const { username, jti } = decodedRefreshToken;

        const foundSession = await getSession(username, jti, refreshToken);
        console.log("FOUND SESSION", foundSession);

        if (!foundSession) {
            return res.status(401).json({
                message: "Invalid Token or Expired",
            });
        }

        console.log("FOUND SESSION", { foundSession });

        const { refreshToken: _refreshToken, accessToken } = generateTokens(
            username,
            foundSession.payload.jti
        );

        res.json({
            data: { accessToken, refreshToken: _refreshToken },
        });
    } catch (e) {
        next(e);
    }
});

app.get("/api/me", async (req, res) => {
    const accessToken = req?.headers?.authorization?.split(" ")[1];

    if (!accessToken) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const decodeAccessToken = await decryptAccessToken(accessToken);

    if (!decodeAccessToken) {
        return res.status(401).json({
            message: "Unauthorized",
            user: null,
        });
    }

    const { username } = decodeAccessToken;

    res.json({
        user: {
            username: users.find((u) => u.username === username)?.username,
        },
    });
});

const { sessions } = require("./session");
const { sessionsCache } = require("./cache");

console.log("SESSIONS DB", { sessions });
console.log("SESSIONS CACHE", { sessionsCache });

app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
});
