$( document ).ready(function(){
  SC.initialize({
    client_id: "d8eb7a8be0cc38d451a51d4d223ee84b",
    redirect_uri: "http://localhost:8080/",
  });
  pController = new Player.Controller
  pController.bindListeners()
  globalCurrentSongUrl = ""
  // setTimeout(function(){pController.playTrack()}, 3000);
})

Player = {}
Player.Controller = function() {
  this.currentSong = {}
  this.currentSongUri = {}
  _this = this

  //Bind the webpage's buttons to the cooresponding functions
  this.bindListeners = function() {
    $("#connect-button").on('click', this.bufferGuestTrack)
    $('#play-button').on('click', this.playTrack)
    $('#pause-button').on('click', this.pauseTrack)
    $('#soundCloudURL').on('submit', this.loadSongFromURL)
  }

  //loads the song for the host,
  this.loadSongFromURL = function(event) {
    event.preventDefault()
    var trackUrl = $(event.target).find('input').eq(0).val()
    console.log('this is the track url')
    console.log(trackUrl)
    $.get('http://api.soundcloud.com/resolve.json?url=' + trackUrl + '&client_id=d8eb7a8be0cc38d451a51d4d223ee84b',
    function (song) {
    _this.currentSongUri = song.uri;
    SC.stream(_this.currentSongUri, {
      id: "louderPlayer",
      onplay: function(){
      this.onPosition(1, _this.sendHostTimestamps)
    }},
    function(sound){
      _this.currentSong = sound
    })
    socket.emit('hostPickedSong', {song: _this.currentSongUri})
  });
  }

  this.bufferGuestTrack = function () {
    socket.emit('userClickedConnect', {data: 'none'})
      $('#guest-playing').show()
      $('#connect-button').hide()
      // send message to server to grab song time from host
      // new function, server sends time back to guest to play
      SC.stream(globalCurrentSongUrl, function(sound){
        _this.currentSong = sound
        var hostTimeStamp = timestampData.timestamp
        var hostProgress = timestampData.songProgress
        var guestTimeStamp = Date.now()

        _this.currentSong.play()

        setTimeout(function() {
        var timeToPlay = (guestTimeStamp - hostTimeStamp + hostProgress)
        _this.currentSong.setPosition((timeToPlay+5100)).play()
        console.log('now it should jump')
        }, 5000)
    })
  }

  this.sendHostTimestamps = function(){
    socket.emit('hostClickedPlay',
      {timestamp: Date.now(), songProgress: _this.currentSong.position}
    )}

  this.playTrack = function() {

    console.log('this is in playTrack')
    _this.currentSong.play();
    setInterval(function(){console.log(_this.currentSong.position)}, 100)
    $('#play-button').hide()
    $('#pause-button').show()

  }

  this.pauseTrack = function() {
    console.log('this is in pauseTrack')
    _this.currentSong.pause()
    $('#pause-button').hide()
    $('#play-button').show()
  };
}

