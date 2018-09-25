const Router = require('koa-router');
const router = new Router();

const builder = require('../utils/builder');


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

    ctx.body = builder(ctx.days);
    ctx.status = 200;
});


module.exports = router;