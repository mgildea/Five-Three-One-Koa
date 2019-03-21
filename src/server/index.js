import Koa from "koa";
import koaBody from "koa-body";
import cors from "@koa/cors";
import programRoutes from "./routes/program";

const app = new Koa();

const PORT = process.env.PORT || 1337;

app.use(
  cors({
    origin: process.env.REACT_APP_URL || "http://localhost:3000"
  })
);

app.use(koaBody({ multipart: true }));

app.use(programRoutes.routes());

const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = server;
