

import { Router } from "express";

import { auth } from "../middlewares/auth";
import { ApplicationController } from "../controllers/application";
import { Scorecard } from "../config/database";
import { ScorecardController } from "../controllers/Scorecard";


const router = Router();

router.post("/create-scorecard", auth, ScorecardController.createScorecard);
export default router;
