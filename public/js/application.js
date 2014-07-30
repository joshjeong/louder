timestampData = {}
var serverBaseUrl = document.domain;
socket = io.connect(serverBaseUrl);
// We'll save our session ID in a variable for later
var sessionId = '';
var songTime = 0
var currentSong = ""

socket.on('connect', emitNewUser)
socket.on('newConnection', newConnection )
// When the server emits a new connection message, it passes the participants array
// take the participants array and use the helper method to update the page
function emitNewUser(){
  sessionId = socket.io.engine.id;
  socket.emit('newUser', {id: sessionId, name: $('#name').val(), song: "", timestamp: 0, currentProgress: 0, playing: false});
}


function newConnection(data) {
    // checks to see if this client is the host, if so, show controlls & search
    if (sessionId == data.participants[0].id) {
      $('#player').show()
      $('#connect-button').hide()
      $('#wait-screen').hide()
      $('#guest-playing').hide()
    }
    // if client is a guest, check these conditions
    if (sessionId != data.participants[0].id) {
      // first, hide the player
      $('#player').hide()

      // second, set global song and timestamp info
      console.log ('when a new user comes in, this is the host data')
      console.log(data.participants[0])
      globalCurrentSongUrl = data.participants[0].song
      timestampData.timestamp = data.participants[0].timestamp
      timestampData.songProgress = data.participants[0].songProgress
      // now, check to see if host is playing
      if (data.participants[0].playing == false) {
        // if host isn't playing, show waiting screen
        // debugger
      $('#connect-button').hide()
      $('#wait-screen').show()
      setInterval(function(){
        $('#wait-screen').find('h3').css( "margin-top", function( index ) {
        return (Math.floor(Math.random()*300));})
        $('#wait-screen').find('h3').css( "margin-left", function( index ) {
        return (Math.floor(Math.random()*250));})
      }, 2000)
      $('#guest-playing').hide()
      }
        // if host is playing,
      else if (data.participants[0].playing == true) {
        if ($.grep(data.participants, function(e){ return e.id == sessionId})[0].playing == false) {
          $('#connect-button').show()
          $('#wait-screen').hide()
          $('#guest-playing').hide()
        }
        else {
          return
        }
      }
    }
  }

socket.on('songReadyForGuests', guestReadySong)

function guestReadySong(data) {
  globalCurrentSongUrl = data.participants[0].song
}

// socket.on('hostSentTimestamps', function(data){
socket.on('hostSentTimestamps', readyToConect)

function readyToConect(data){
  timestampData = data.participants[0]
  if (sessionId != data.participants[0].id) {
    $('#connect-button').show()
    $('#wait-screen').hide()
  }
}

// when the server emits an error message, log it to the console
socket.on('error', function(reason) {
  console.log('unable to connect to server sry bro', reason);
});

