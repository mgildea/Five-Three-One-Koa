const Router = require('koa-router');
const ProgramTemplate = require('../utils/templateBuilder');
const SpreadSheet = require('../utils/spreadsheetBuilder');


const router = new Router();

router
    .get('/template', async (ctx) => {

        ctx.body = ProgramTemplate(ctx.request.body.daysPerWeek, ctx.request.body.movements)
        ctx.status = 200;
    })
    .post('/program', async (ctx) => {

        const {daysPerWeek, movements, name} = ctx.request.body;
        ctx.body = await SpreadSheet(ProgramTemplate(daysPerWeek, movements), name);
        ctx.status = 200;
    })

module.exports = router;