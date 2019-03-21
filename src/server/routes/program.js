import Router from "koa-router";
import { program } from "../controllers/program";

const router = new Router();

// router.get("/template", template);
router.post("/program", program);

module.exports = router;
