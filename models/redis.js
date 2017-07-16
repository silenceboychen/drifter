const redis = require('redis');
const client = redis.createClient();

exports.throw = (bottle, callback) => {
  bottle.time = bottle.time || Date.now();
  //为每个漂流瓶随机生成一个id
  let bottleId = Math.random().toString(16);
  let type = {male: 0, female: 1};
  //根据漂流瓶类型的不同讲漂流瓶保存到不同的数据库
  client.select(type[bottle.type], () => {
    client.hmset(bottleId, bottle, (err, result) => {
      if(err) {
        return callback({code: 0, msg: "过会儿再试试吧！"});
      }
      callback({code: 1, msg: result});
      //设置漂流瓶生存期为1天
      client.expire(bottleId, 86400);
    });
  });
}

exports.pick = (info, callback) => {
  let type = {all: Math.round(Math.random()), male: 0, female: 1};
  info.type = info.type || 'all';
  //根据请求的瓶子类型到不同的数据库中取
  client.select(type[info.type], () => {
    //随机返回一个漂流瓶id
    client.randomkey((err, bottleId) => {
      if(!bottleId) {
        return callback({code: 0, msg: "大海空空如也。。。"});
      }
      //根据漂流瓶id获取到完整的漂流瓶信息
      client.hgetall(bottleId, (err, bottle) => {
        if(err) {
          return callback({code: 0, msg: "漂流瓶破损了。。。"});
        }
        callback({code: 1, msg: bottle});
        client.del(bottleId);
      });
    });
  });
}