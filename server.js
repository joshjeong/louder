/*
  Module dependencies:
  - Express
  - Http (to run Express)
  - Body parser (to parse JSON requests)
  - Underscore
  - Socket.IO(Note: we need a web server to attach Socket.IO to)
*/

var express = require('express'),
    app = express(),
    http = require('http').createServer(app),
    bodyParser = require('body-parser'),
    io = require('socket.io').listen(http),
    _ = require('underscore');


var participants = [];

/* Server Config */


// Set to accept Heroku's dynamic port assignemnt, or 8080 on localhost
app.set('port', process.env.PORT || 8080);

// Specify the views folder
app.set("views", __dirname + "/views");

// Set the view engine as Jade
app.set("view engine", "jade");

// Specify where static content is
app.use(express.static("public", __dirname + "/public"));

// Tells server to support JSON requests
app.use(bodyParser.json());

/* Server Routing */
// Root Route
app.get('/', function(request, response) {

  var isHost = io.eio.clientsCount === 1
  //Render a view called 'index'
  response.render("index", {isHost: isHost});

});

// Socket.IO events
io.on("connection", function(socket){
  // When a client/user connects, store in particiapnts[] and notify clients
  socket.on("newUser", function(data){
    participants.push({id: data.id, name: data.name, song: data.song, timestamp: data.timestamp, currentProgress: data.currentProgress, playing: data.playing});
    io.sockets.emit("newConnection", {participants: participants});
  });

  socket.on("hostPickedSong", function(data) {
    participants[0].song = data.song
    io.sockets.emit('songReadyForGuests', {participants: participants})
  })

  socket.on("hostClickedPlay", function(data){
    participants[0].timestamp = data.timestamp
    participants[0].songProgress = data.songProgress
    participants[0].playing = true
    io.sockets.emit("hostSentTimestamps", {participants: participants})
  })

  socket.on("userClickedConnect", function(data) {
    console.log('hopefully this logs the current users playing state')
    _.findWhere(participants, {id: data.id}).playing = true
  })

  // When a client changes their name, update participants[] and notify clients
  socket.on("nameChange", function(data) {
    _.findWhere(participants, {id: socket.id}).name = data.name;
    io.sockets.emit("nameChanged", {id: data.id, name: data.name});
  });

  socket.on("newMessage", function(name, message){
    console.log("hello got to the server for new message")
    io.sockets.emit("incomingMessage", name, message)
  })

  // When a client/user disconnects, delete from participants[] & notify clients
  socket.on("disconnect", function() {
    participants = _.without(participants,_.findWhere(participants, {id: socket.id}));
    io.sockets.emit("userDisconnected", {id: socket.id, sender:"system"});
  });

  socket.on("hostPlayedSound", function(data) {
    io.sockets.emit("guestPlaySong", {song: data.song, uri: data.uri, time: data.time})
  })

})

// Set to accept Heroku's dynamic port assignemnt, or 8080 on localhost
http.listen(process.env.PORT || 8080, function() {
  console.log("Server up and running.");
});
