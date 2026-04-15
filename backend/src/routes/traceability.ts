import express from "express";
import { getTraceabilityByJob } from "../controllers/traceability";
//console.log("TRACEABILITY ROUTE FILE LOADED");
const router = express.Router();

router.get("/:jobId", (req, res, next) => {
  console.log("TRACEABILITY ROUTE HIT");
  next();
}, getTraceabilityByJob);

export default router;