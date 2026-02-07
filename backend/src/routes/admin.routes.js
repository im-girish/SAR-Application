import express from "express";
// import { adminSignup } from "../controllers/admin.controller.js";
import { adminSignup, adminLogin } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/signup", adminSignup);
router.post("/login", adminLogin);

export default router;
