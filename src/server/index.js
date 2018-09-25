const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");

const programRoutes = require("./routes/program");

const app = new Koa();
const PORT = 1337;

app.use(cors());


app.use(bodyParser());

app.use(programRoutes.routes());


const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = server;
