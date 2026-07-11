const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "jntua-labs-development-secret";

module.exports = (req, res, next) => {

    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({
            message: "Access Denied"
        });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer ") 
        ? authHeader.slice(7) 
        : authHeader;

    try {
        const verified = jwt.verify(
            token,
            JWT_SECRET
        );

        req.user = verified;

        next();

    } catch (err) {
        res.status(400).json({
            message: "Invalid Token"
        });
    }
};