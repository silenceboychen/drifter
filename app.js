const express = require('express');
const bodyParser = require('body-parser');
const redis = require('./models/redis');
const mongodb = require('./models/mongodb');

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
  if(!req.query.user) {
    return res.json({code: 0, msg: "信息不完整"});
  }
  if(req.query.type && (["all", "male", "female"].indexOf(req.query.type) === -1)) {
    return res.json({code: 0, msg: "类型错误"});
  }
  redis.pick(req.query, (result) => {
    if(result.code === 1) {
      mongodb.save(req.query.user, result.msg, (err) => {
        if(err) {
          return res.json({code: 0, msg: "获取漂流瓶失败，请重试"});
        }
        // return res.json(result);
      });
    }
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

//获取一个用户所有的漂流瓶
app.get('/user/:user', (req, res) => {
  mongodb.getAll(req.params.user, (result) => {
    res.json(result);
  });
});

//获取特定id的漂流瓶
//GET /bottle/yjagsdkjashd
app.get('/bottle/:_id', (req, res) => {
  mongodb.getOne(req.params._id, (result) => {
    res.json(result);
  });
});

//回复特定id的漂流瓶
//POST user=xxx&content=xxx[&time=xxx]
app.post('/reply/:_id', (req, res) => {
  console.log(req.body);
  if(!(req.body.user && req.body.content)) {
    return res.json({code: 0, msg: "回复信息不完整！"});
  }
  mongodb.reply(req.params._id, req.body, (result) => {
    res.json(result);
  });
});

//删除特定id的瓶子
app.get('/delete/:_id', (req, res) => {
  mongodb.delete(req.params._id, (result) => {
    res.json(result);
  });
});

app.listen(3000, () => {
  console.log("listen port: 3000");
});