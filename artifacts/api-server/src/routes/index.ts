import { Router, type IRouter } from "express";
import healthRouter from "./health";
import launchpadRouter from "./launchpad";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/launchpad", launchpadRouter);

export default router;
