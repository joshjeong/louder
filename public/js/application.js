$(document).ready(function(){
  View.hideAll()
})


timestampData = {}
var serverBaseUrl = document.domain;
socket = io.connect(serverBaseUrl);
// We'll save our session ID in a variable for later
var sessionId = '';
var songTime = 0
var currentSong = ""

function Client(){
  this.sessionId = ''
  this.CurrentSongUrl = ''
}

Client.prototype = {
  isHost: function(data){
    return sessionId == data.participants[0].id
  }
}


socket.on('connect', emitNewUser)

function emitNewUser(){
  sessionId = socket.io.engine.id;
  socket.emit('newUser', {id: sessionId, name: $('#name').val(), song: "", timestamp: 0, currentProgress: 0, playing: false});
}

socket.on('newConnection', newConnection )

function newConnection(data) {
  if (Helper.isHost(data)) {
    View.hideAll()
    View.showPlayer()
  } else {
    View.hideAll()
    View.changeView(data)
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

socket.on('error', function(reason) {
  console.log('unable to connect to server sry bro', reason);
});



Helper = {}
//change to client soon
Helper.isHost = function(data){
  console.log("Is host ", sessionId == data.participants[0].id)
  return sessionId == data.participants[0].id
}
Helper.isHostPlaying = function(data){
  return data.participants[0].playing
}




View = {}

View.changeView = function(data){
  globalCurrentSongUrl = data.participants[0].song
  timestampData.timestamp = data.participants[0].timestamp
  timestampData.songProgress = data.participants[0].songProgress
  var isClientPlaying = $.grep(data.participants, function(e){ return e.id == sessionId})[0].playing
  if (!Helper.isHostPlaying(data)) {
    View.showWaitScreen()
  }else if(Helper.isHostPlaying(data) && !isClientPlaying){
    $('#connect-button').show()
    $('#wait-screen').hide()
    $('#guest-playing').hide()
  }
}

View.showPlayer = function(){
  if(!$('#player').is(":visible")) {
    $('#player').show()
  }
}

View.showWaitScreen= function(){
  if(!$('#wait-screen').is(":visible")) {
    $('#wait-screen').show()
    View.waitTextAnimator()
  }
}

View.hideAll= function(){
  $('#connect-button').hide()
  $('#wait-screen').hide()
  $('#guest-playing').hide()
  $('#player').hide()
}

View.waitTextAnimator = function(){
  setInterval(function(){
  $('#wait-screen').find('h3').css( "margin-top", function( index ) {
    return (Math.floor(Math.random()*300));})
  $('#wait-screen').find('h3').css( "margin-left", function( index ) {
    return (Math.floor(Math.random()*250));})
  }, 2000)
}
