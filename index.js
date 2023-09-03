const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const axios = require('axios');

const { PORT, QY_WECHAT_BOT_URL } = process.env;

const app = new Koa();
const router = new Router();
app.use(bodyParser());

const postData = async (url, data) => {
  const rsp = await axios.post(url, data)
  return rsp.data;
}
const parseMessage = (target, originalMessage) => {
  if (target === 'wechat') {
    const { status, commonAnnotations } = originalMessage;
    const content = status === 'firing' ? `🔥🔥🔥\n${ commonAnnotations.description }` : `😁😁😁 ${commonAnnotations.summary} Resolved!`
    return {
      msgtype: 'text',
      text: {
        content,
      },
    };
  }
}
router.post('/ch/:id/webhook', async (ctx) => {
  const { id } = ctx.params;
  if (id === 'test') {
    console.log({ body: ctx.request.body });
    ctx.status = 200;
    ctx.body = 'success';
    return;
  }
  if (id !== 'wechat') {
    ctx.status = 400;
    return;
  }
  try {
    await postData(QY_WECHAT_BOT_URL, parseMessage(id, ctx.request.body))
  } catch (error) {
    ctx.status = 502;
    ctx.body = error.message;
    return;
  }
  ctx.status = 200;
  ctx.body = 'success';
});

app.use(router.routes());
app.use(router.allowedMethods());

const port = PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});