global.__search_base = __dirname;

var express = require('express');
var app = express();

// app.get('/search/users', require('./controller/users'));
app.get('/search/:model', require('./controller/fetch'));

module.exports = app;
