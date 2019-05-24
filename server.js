var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var numUsers = 0;

let usernamesMap = {};

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/js/:filename', function(req, res) {
  res.sendFile(__dirname + '/js/' + req.params.filename);
});

io.on('connection', function(socket) {
  var addedUser = false;
  socket.on('add user', function(username) {
    usernamesMap[username] = socket.client.id;

    io.emit('chat message', "si è connesso l'utente: " + username);
    if (addedUser) return;

    // we store the username in the socket session for this client
    console.log(socket.client.id);
    socket.username = username;

    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });

  });

  socket.on('new pos', function(crd) {
    console.log("new pos", crd);
    io.emit('chat message', crd.lat);
    var freq = Math.random() * (800 - 300) + 300;
    io.emit('play sound', freq);
  });

  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
    // NOTE: to test, send message to user if write user ID
    if (msg.startsWith("\\to")) {
      username = msg.split(" ")[1]
      socket.broadcast.to(usernamesMap[username]).emit('chat message', 'for your eyes only: ' + msg);
    }
  });

});


http.listen(4444, function() {
  console.log('listening on 4444');
});
