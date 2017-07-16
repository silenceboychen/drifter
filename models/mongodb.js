const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/drifter', {useMongoClient: true});

//定义漂流瓶模型。并设置数据库存储到bottles集合
let bottleModel = mongoose.model('Bottle', new mongoose.Schema({
  bottle: Array,
  message: Array
}, {
  collection: 'bottles'
}));

//将用户捡到的漂流瓶改变格式保存
exports.save = (picker, _bottle, callback) => {
  let bottle = {bottle: [], message: []};
  bottle.bottle.push(picker);
  bottle.message.push([_bottle.owner, _bottle.time, _bottle.content]);
  bottle = new bottleModel(bottle);
  bottle.save((err) => {
    callback(err);
  });
};

//获取用户捡到的所有漂流瓶
exports.getAll = (user, callback) => {
  bottleModel.find({"bottle": user}, (err, bottles) => {
    if(err) {
      return callback({code: 0, msg: "获取漂流瓶列表失败。。。"});
    }
    callback({code: 1, msg: bottles});
  });
};

//获取特定id的漂流瓶
exports.getOne = (_id, callback) => {
  bottleModel.findById(_id, (err, bottle) => {
    if(err) {
      return callback({code: 0, msg: "读取漂流瓶失败。。。"});
    }
    callback({code: 1, msg: bottle});
  });
};

//回复特定id的漂流瓶
exports.reply = (_id, reply, callback) => {
  reply.time = reply.time || Date.now();
  bottleModel.findById(_id, (err, _bottle) => {
    if(err) {
      return callback({code: 0, msg: "回复漂流瓶失败。。。"});
    }
    let newBottle = {};
    newBottle.bottle = _bottle.bottle;
    newBottle.message = _bottle.message;
    //如果捡瓶子的人第一次回复漂流瓶，则在bottle键添加漂流瓶主人，如果已经回复过漂流瓶，则不添加
    if(newBottle.bottle.length === 1) {
      newBottle.bottle.push(_bottle.message[0][0]);
    }
    //在message键添加一条回复信息
    newBottle.message.push([reply.user, reply.time, reply.content]);
    //更新数据库中该漂流瓶信息
    bottleModel.findByIdAndUpdate(_id, newBottle, (err, bottle) => {
      if(err) {
        return callback({code: 0, msg: "回复漂流瓶失败。。。"});
      }
      callback({code: 1, msg: bottle});
    });
  });
};

//删除特定id的漂流瓶
exports.delete = (_id, callback) => {
  bottleModel.findByIdAndRemove(_id, (err) => {
    if(err) {
      return callback({code: 0, msg: "删除漂流瓶失败。。。"});
    }
    callback({code: 1, msg: "删除成功！"});
  });
};