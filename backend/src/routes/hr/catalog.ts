import { Router } from "express";
import { CatalogController } from "../../controllers/user";
import { auth } from "../../middlewares/auth";

const router = Router();

router.get("/job-form", auth, CatalogController.getJobCreationCatalog);

export default router;
