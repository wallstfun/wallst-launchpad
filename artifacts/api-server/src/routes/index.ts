import { Router, type IRouter } from "express";
import healthRouter from "./health";
import launchpadRouter from "./launchpad";
import solPriceRouter from "./sol-price";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/launchpad", launchpadRouter);
router.use(solPriceRouter);

export default router;
