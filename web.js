var express = require('express');
var server = express();

server.use(express.static(__dirname));

server.listen(process.env.PORT || 5000);
