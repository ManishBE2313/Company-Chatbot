import express from "express";
import { UserResponseController } from "../../controllers/survey/user_response";
import { anonymousTokenMiddleware } from "../../middlewares/survey/anonymousToken";

const router = express.Router();

// ✅ Apply middleware to all user routes
router.get(
  "/user/surveys",
  anonymousTokenMiddleware,
  UserResponseController.getUserSurveys
);

router.get(
  "/user/surveys/:surveyId",
  anonymousTokenMiddleware,
  UserResponseController.getSurvey
);

router.post(
  "/user/surveys/:surveyId/response",
  anonymousTokenMiddleware,
  UserResponseController.submitResponse
);

export default router;