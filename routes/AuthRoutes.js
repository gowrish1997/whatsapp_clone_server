import { Router } from "express";
const router = Router();
import { checkUser } from "../controllers/AuthController.js";
import { onBoardUser } from "../controllers/AuthController.js";
import { getUser } from "../controllers/AuthController.js";
import { generateToken } from "../controllers/AuthController.js";

router.post("/check-user", checkUser);
router.post("/onBoard-user", onBoardUser);
router.get("/get-contacts", getUser);
router.get("/generate-token/:userId", generateToken);
export default router;
