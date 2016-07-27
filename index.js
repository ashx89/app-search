global.__search_base = __dirname;

var express = require('express');
var app = express();

app.get('/search/users', require('./controller/users'));

module.exports = app;
