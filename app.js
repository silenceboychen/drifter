const express = require('express');
const bodyParser = require('body-parser');
const redis = require('./models/redis');

const app = express();
app.use(bodyParser.json());

//扔一个漂流瓶
//POST owner=XXX&type=xxx&content=xxx[&time=xxx]
app.post('/', (req, res) => {
  if(!(req.body.owner && req.body.type && req.body.content)) {
    if(req.body.type && (["male", "female"].indexOf(req.body.type) === -1)) {
      return res.json({code: 0, msg: "类型错误"});
    }
    return res.json({code: 0, msg: "信息不完整"});
  }
  redis.throw(req.body, (result) => {
    res.json(result);
  });
});

//捡一个漂流瓶
//GET /?user=xxx[&type=xxx]
app.get('/', (req, res) => {
  console.log(req.query);
  if(!req.query.user) {
    return res.json({code: 0, msg: "信息不完整"});
  }
  if(req.query.type && (["all", "male", "female"].indexOf(req.query.type) === -1)) {
    return res.json({code: 0, msg: "类型错误"});
  }
  redis.pick(req.query, (result) => {
    res.json(result);
  });
});

//扔回海里一个漂流瓶
//POST owner=xxx&type=xxx&content=xxx&time=xxx
app.post('/back', (req, res) => {
  redis.throwBack(req.body, (result) => {
    res.json(result);
  });
});

app.listen(3000, () => {
  console.log("listen port: 3000");
});