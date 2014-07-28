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
  // trackUrl = 'https://soundcloud.com/flosstradamus/flosstradamus-mosh-pit-original-mix';
  // $.get('http://api.soundcloud.com/resolve.json?url=' + trackUrl + '&client_id=d8eb7a8be0cc38d451a51d4d223ee84b',
  // function (song) {
  //   _this.currentSongUri = song.uri;
  // });

  this.bindListeners = function() {
    $("#connect-button").on('click', this.bufferGuestTrack)
    $('#play-button').on('click', this.playTrack)
    $('#pause-button').on('click', this.pauseTrack)
    $('#soundCloudURL').on('submit', this.loadSongFromURL)

  }

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
        // _this.currentSong.play()
        // setTimeout(function(){_this.currentSong.pause()}, 1000)
        var hostTimeStamp = timestampData.timestamp
        var hostProgress = timestampData.songProgress
        var guestTimeStamp = Date.now()
        soundManager.setPosition('louderPlayer', guestTimeStamp - hostTimeStamp
          + hostProgress + 400)
          console.log(_this.currentSong.position)
        setTimeout(function(){
          soundManager.setPosition('louderPlayer', guestTimeStamp - hostTimeStamp
          + hostProgress)
          _this.currentSong.play()
          console.log(_this.currentSong.position)
        }, 500)
        //grab host timestamp and host progress
        //grab guest timestamp
        //setPosition(host timestamp - guest timestamp + host progress)
        //play()

        // _this.currentSong.position = (timestampData.songProgress
        //   + (Date.now() - timestampData.timestamp) + 400)
        // debugger
        // setTimeout(function(){
        //   _this.currentSong.position = (timestampData.songProgress
        //   + (Date.now() - timestampData.timestamp))
        //   debugger
        //   _this.currentSong.play()},
        //   500)
      // _this.currentSong.pause()
    })
  }

  this.sendHostTimestamps = function(){
    socket.emit('hostClickedPlay',
      {timestamp: Date.now(), songProgress: _this.currentSong.position}
    )}

  this.playTrack = function() {

    console.log('this is in playTrack')
    _this.currentSong.play();
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

