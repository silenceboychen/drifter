const redis = require('redis');
const client = redis.createClient();
const client2 = redis.createClient();
const client3 = redis.createClient();

exports.throw = (bottle, callback) => {
  //先去2号库检查用户是否超过扔瓶次数限制
  client2.select(2, () => {
    client2.get(bottle.owner, (err, result) => {
      if(result >= 10) {
        return callback({code: 0, msg: "今天扔瓶子的机会已经用完啦~"});
      }
      //扔瓶次数加1
      client2.incr(bottle.owner, () => {
        /**
         * 检查是否是当天第一次扔瓶子
         * 若是，则设置记录该用户扔瓶次数的生存期为1天
         * 若不是。生存期不变
         */
        client2.ttl(bottle.owner, (err, ttl) => {
          if(ttl === -1) {
            client2.expire(bottle.owner, 86400);
          }
        });
      });
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
    });
  });
}

exports.pick = (info, callback) => {
  //先到3号库检查用户是否超过捡瓶次数限制
  client3.select(3, () => {
    client3.get(info.user, (err, result) => {
      if(result >= 10) {
        return callback({code: 0, msg: "今天捡瓶子的机会已经用完啦~"});
      }
      //捡瓶次数加1
      client3.incr(info.user, () => {
        /**
         * 检查是否当天第一次捡瓶子
         * 若是，则设置记录该用户捡瓶次数的生存期为1天
         * 若不是，生存期保持不变
         */
        client3.ttl(info.user, (err, ttl) => {
          if(ttl === -1) {
            client3.expire(info.user, 86400);
          }
        });
      });
      if(Math.random() <= 0.2) {
        return callback({code: 0, msg: "海星"});
      }
      let type = {all: Math.round(Math.random()), male: 0, female: 1};
      info.type = info.type || 'all';
      //根据请求的瓶子类型到不同的数据库中取
      client.select(type[info.type], () => {
        //随机返回一个漂流瓶id
        client.randomkey((err, bottleId) => {
          if(!bottleId) {
            return callback({code: 0, msg: "海星"});
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
    });
  });
}

exports.throwBack = (bottle, callback) => {
  let type = {male: 0, female: 1};
  let bottleId = Math.random().toString(16);
  client.select(type[bottle.type], () => {
    client.hmset(bottleId, bottle, (err, result) => {
      if(err) {
        return callback({code: 0, msg: "过会儿再试试吧！"});
      }
      callback({code: 1, msg: result});
      client.pexpire(bottleId, bottle.time + 86400000 - Date.now());
    });
  });
}