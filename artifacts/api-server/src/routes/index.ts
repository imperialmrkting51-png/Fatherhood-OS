import { Router, type IRouter } from "express";
import healthRouter from "./health";
import childrenRouter from "./children";
import activitiesRouter from "./activities";
import memoriesRouter from "./memories";
import dashboardRouter from "./dashboard";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(requireAuth);
router.use(childrenRouter);
router.use(activitiesRouter);
router.use(memoriesRouter);
router.use(dashboardRouter);

export default router;
