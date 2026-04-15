import { Router } from "express";
import { SurveyController } from "../../controllers/survey/create_survey";

const router = Router();

router.post("/", SurveyController.createSurvey);
router.get("/", SurveyController.getAllSurveys);
router.get("/:id", SurveyController.getSurveyById);
router.patch("/:id", SurveyController.updateSurvey);
export default router;