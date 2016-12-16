var app = require('express')();
var server = require('http').createServer(app);
var path = require('path');
var io = require('socket.io').listen(server);
//var io = require('socket.io-client');
//var userName = 'rtobon';

app.get('/client', function(req, res){
  res.sendFile(path.join(__dirname, '../../../src/views/client', 'client.html'));
//  res.sendFile('../src/views/client/client.html');
});

server.listen(8000, function(){
  console.log('listening on *:8000');
});

