$(document).on('ready', init);

function init() {

var serverBaseUrl = document.domain;

/*
 On client init, try to connect to the socket.IO server.
 Note we don't specify a port since we set up our server
 to run on port 8080
*/
socket = io.connect(serverBaseUrl);

// We'll save our session ID in a variable for later
var sessionId = '';
var songTime = 0
var currentSong = ""

// Helper function to update the participants' list
function updateParticipants(participants) {
  $('#participants').html('');
  for (var i = 0; i < participants.length; i++) {
    $('#participants').append('<span id="' + participants[i].id + '">' +
      participants[i].name + ' ' + (participants[i].id === sessionId ? '(You)' : '') + '<br /></span>');
    }
  }

/*
When the client successfully connects to the server, an
event "connect" is emitted. Let's get the session ID and
log it.
*/
  socket.on('connect', function () {
    // Any use connects - first they get an ID
    sessionId = socket.io.engine.id;
    console.log('Connected ' + sessionId);
    // Sends ID & Name to server
    var room_name = location.pathname.split("/").pop();
    socket.emit('newUser', {id: sessionId, name: $('#name').val(), room_name: room_name });
  });

  $('#connect-button').on('click', function() {
    var room_name = location.pathname.split("/").pop();
    socket.emit('newUser', {id: sessionId, name: $('#name').val(), room_name: room_name });
  })

// When the server emits a new connection message, it passes the participants array
// take the participants array and use the helper method to update the page
socket.on('newConnection', function (data) {
      // update list of users on screen
    updateParticipants(data.participants);
    // checks to see if this client is the host, if so, show controlls & search
    if (sessionId == data.participants[0].id) {
      $('#player').show()
      $('#connect-button').hide()
    }
    if (sessionId != data.participants[0].id) {
      $('#player').hide()
      $('#connect-button').show()
    }

  });

// When the server emits a userDisconnected message, ity passes the id of the disconnected client
// this function removes that user from the list by updating the dom
socket.on('userDisconnected', function(data) {
  $('#', + data.id).remove();
});

// When the server emits a nameChanged message, it passes that users new id and name
// use this id to target the username list and update the correct name; append a (you) if necessary
socket.on('nameChanged', function(data) {
  $('#' + data.id).html(data.name + ' ' + (data.id === sessionId ? '(You)' : '') + '<br />');
});

// When the server emits an incomingMessage message, it passes the message and name
// use this info to add that message into the dom
socket.on('incomingMessage', function(name, message) {
   $('#messages').prepend('<b>' + name + '</b><br />' + message + '<hr />');
});

// when the server emits an error message, log it to the console
socket.on('error', function(reason) {
  console.log('unable to connect to server sry bro', reason);
});

socket.on('guestPlaySong', function(data){
  // setTimeout(function(){widget.pause()}, 3000);
  // setTimeout(function(){widget.play()}, 5000);
  console.log(data)
  console.log(data.song)
  console.log(data.uri)
  console.log(data.time)
})

// emission to server to indicate a new message
function sendMessage() {
  var outgoingMessage = $('#outgoingMessage').val();
  var name = $('#name').val();
  socket.emit("newMessage", name, outgoingMessage)
}

// If a user pressees enter (key 13) in the text area, call send message and clear the outgoing message box
function outgoingMessageKeyDown(event) {
    if (event.which == 13) {
      event.preventDefault();
      if ($('#outgoingMessage').val().trim().length <= 0) {
        return;
      }
      sendMessage();
      $('#outgoingMessage').val('');
    }
  }

// disable clicking outgoing message if there's no text in the box
function outgoingMessageKeyUp() {
  var outgoingMessageValue = $('#outgoingMessage').val();
    $('#send').attr('disabled', (outgoingMessageValue.trim()).length > 0 ? false : true);
}

// if the user changes their name, emit a name change event
function nameFocusOut() {
  var name = $('#name').val();
  socket.emit('nameChange', {id: sessionId, name: name});
}

// Setup listeners
$('#outgoingMessage').on('keydown', outgoingMessageKeyDown);
$('#outgoingMessage').on('keyup', outgoingMessageKeyUp);
$('#name').on('focusout', nameFocusOut);
$('#send').on('click', sendMessage);

// var widgetIframe = $('#sc-widget')[0]
// widget = SC.Widget(widgetIframe);



// widget.bind(SC.Widget.Events.PLAY, function() {
//     widget.getCurrentSound(function(currentSound) {
//       currentSong = currentSound
//       console.log('sound ' + currentSound.title + 'began to play');
//       widget.getPosition(hostBeganPlaying.bind(widget))
//     });
// })

function hostBeganPlaying(data){
    console.log(currentSong.title)
    console.log(data)
    socket.emit('hostPlayedSound', {song: currentSong.title, uri: currentSong.uri, time: data })
}



}

// var widgetIframe = document.getElementById('sc-widget'),
// widget = SC.Widget(widgetIframe);
