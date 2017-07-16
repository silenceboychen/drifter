const express = require('express');
const redis = require('./models/redis');

const app = express();
app.use(express.bodyParser());

//扔一个漂流瓶