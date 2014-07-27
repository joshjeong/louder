/*
  Module dependencies:
  - Express
  - Http (to run Express)
  - Body parser (to parse JSON requests)
  - Underscore (because it's cool)
  - Socket.IO(Note: we need a web server to attach Socket.IO to)
*/

var express = require('express'),
    app = express(),
    http = require('http').createServer(app),
    bodyParser = require('body-parser'),
    io = require('socket.io').listen(http),
    _ = require('underscore');

/*
  The list of participants in our chatroom.
  The format of each participant will be:
  {
    id: "sessionId",
    name: "participantName"
  }
*/
var participants = [];

var rooms = ['foo', 'bar'];

/* Server Config */

// Server's IP Address
// app.set('ipaddr', "127.0.0.1");

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

// Create a new Chat Message
// app.post("/message", function(request, response) {
//   // store message and sender name in variables
//   var message = request.body.message;
//   var name = request.body.name;
//   // check if message is valid and kick it out if not
//   if (_.isUndefined(message) || _.isEmpty(message.trim())) {
//     return response.json(400, {error: "Message is invalid"});
//   }
//   // send this message to the rest of the clients to update
//   io.sockets.emit("incomingMessage", {message: message, name: name});
//   // respond to sender client with a 200 success
//   response.json(200, {message: "Message received"});
// });

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
