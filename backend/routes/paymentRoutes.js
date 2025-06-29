import express from "express";
import { submitPayment } from "../controllers/paymentController.js";
import { verifyUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/submit", verifyUser, submitPayment);

export default router;
