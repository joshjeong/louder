//      return db.collection("rooms").find({room_name: 'test-room'}).toArray(function(err, response){console.log})
//
/*
  Module dependencies:
  - Express
  - Http (to run Express)
  - Body parser (to parse JSON requests)
  - Underscore (because it's cool)
  - Socket.IO(Note: we need a web server to attach Socket.IO to)
*/

//db.rooms.find({room_name:"test-room"})
//return rooms.toArray(function(err, response){})

var express = require('express'),
    mongojs = require('mongojs'),
    Q = require("q"),
    app = express(),
    http = require('http').createServer(app),
    bodyParser = require('body-parser'),
    io = require('socket.io').listen(http),
    _ = require('underscore');

var participants = [];


///===================================
function Database() {
  self = this
  this.db = mongojs("louder");
  this.rooms = this.db.collection('rooms');
  this.goFetch = function() {
    var defer = Q.defer();
    this.rooms.find({room_name:"test-room"}, defer.makeNodeResolver());
    self.grabRooms(defer.promise);
  }
  this.grabRooms = function(promise) {
    promise.then(function(result) {
      return 1
    })
  }
}

db = new Database()

/* Server Config */
// Server's Port Number

app.set('port', process.env.PORT || 8080);

// Specify the views folder
app.set("views", __dirname + "/views");

// Set the view engine as Jade
app.set("view engine", "jade");

//Specify where static content is
app.use(express.static("public", __dirname + "/public"));

// Tells server to support JSON requests
app.use(bodyParser.json());

/* Server Routing */
// Root Route
app.get('/', function(request, response) {
  response.render("index", {participants: participants});
});

app.get('/rooms/:room_name', function(request, response) {
  // console.log('request', request.params)

  response.render("index", {participants: participants, room_name: request.params.room_name});
});

// Socket.IO events
io.on("connection", function(socket){
  // When a client/user connects, run this anonmymous function callback that:
  //  1) pushes a new user into the participants array defined on line 27
  //  2) emits a new connection message to all clients with the updated particpants array
  socket.on("newUser", function(data){
    // Adds user to particpants array
    participants.push({id: data.id, name: data.name});
    console.log('rooooooooom: ', data.room_name)
    socket.join(data.room_name)
    console.log('dbBlah: ', db.grabRooms())
    // relays the new array of users to all clients
    io.sockets.emit("newConnection", {participants: participants});
  });

  socket.on("userClickedConnect", function(data) {
    console.log('anything')
    console.log(data)
  })

  // When a client/user changes their name, run this anonymous function callback that:
  //  1) finds the user that changed their name within the particpants array, and updates their name
  //  2) emits a name changed message to all clients with that user's new ID and name
  socket.on("nameChange", function(data) {
    _.findWhere(participants, {id: socket.id}).name = data.name;
    io.sockets.emit("nameChanged", {id: data.id, name: data.name});
  });

  socket.on("newMessage", function(name, message){
    console.log("hello got to the server for new message")
    io.sockets.emit("incomingMessage", name, message)
  })

  // When a client/user disconnects, run this anonymous function callback that:
  //  1) deletes the disconnected user from the participants array
  //  2) emits a userDisconnected message to all clients with that user's ID
  socket.on("disconnect", function() {
    participants = _.without(participants,_.findWhere(participants, {id: socket.id}));
    io.sockets.emit("userDisconnected", {id: socket.id, sender:"system"});
  });

  socket.on("hostPlayedSound", function(data) {
    io.sockets.emit("guestPlaySong", {song: data.song, uri: data.uri, time: data.time})
  })

})

// Start the Server with above specs
http.listen(process.env.PORT || 8080, function() {
  console.log("Server up and running.");
});
