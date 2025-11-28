import express from "express";
import { getMilitaryNews } from "../controllers/news.controller.js";

const router = express.Router();

// Public route - everyone can access military news
router.get("/", getMilitaryNews);

export default router;
