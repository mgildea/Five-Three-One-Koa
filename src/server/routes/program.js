const Router = require('koa-router');
const ProgramTemplate = require('../utils/templateBuilder');
const SpreadSheet = require('../utils/spreadsheetBuilder');


const router = new Router();

router.get('/', async (ctx) => {
    ctx.body = "test";
    ctx.status = 200;
});

router
.param('days', (id, ctx, next) => {
    ctx.days = parseInt(id) || 4;
    return next();
})
.get('/template/:days', async (ctx) => {

    ctx.body = template(ctx.days)
    ctx.status = 200;
})
.post('/program/:days', async (ctx) => {

    ctx.body = await SpreadSheet(ProgramTemplate(ctx.days));
    ctx.status = 200;
})

module.exports = router;