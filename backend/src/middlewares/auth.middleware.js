import { verifyToken } from "../utils/jwt.util.js";
import { errorResponse } from "../utils/response.util.js";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return errorResponse(res, "Access denied. No token provided.", 401);
    }

    const decoded = verifyToken(token);
    req.admin = decoded;
    next();
  } catch (error) {
    return errorResponse(res, "Invalid token", 401);
  }
};
