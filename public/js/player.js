$( document ).ready(function(){
  SC.initialize({
    client_id: "d8eb7a8be0cc38d451a51d4d223ee84b",
    redirect_uri: "http://localhost:8080/",
  });
  pController = new Player.Controller
  pController.bindListeners()
  // setTimeout(function(){pController.playTrack()}, 3000);
})

Player = {}
Player.Controller = function() {
  this.currentSong = {}
  this.currentSongUri = {}
  _this = this
  trackUrl = 'https://soundcloud.com/flosstradamus/flosstradamus-mosh-pit-original-mix';
  $.get('http://api.soundcloud.com/resolve.json?url=' + trackUrl + '&client_id=d8eb7a8be0cc38d451a51d4d223ee84b',
  function (song) {
    _this.currentSongUri = song.uri;
  });

  this.bindListeners = function() {
    // $("#connect-button").on('click', this.playTrack)
    $('#play-button').on('click', this.playTrack)
    $('#pause-button').on('click', this.pauseTrack)
  }

  this.playTrack = function() {
    socket.emit('userClickedConnect', {data: 'none'})
    console.log('this is in playTrack')
    SC.stream(_this.currentSongUri, function(sound){
    _this.currentSong = sound
      console.log('pause')
      _this.currentSong.pause();
      console.log('play')
      _this.currentSong.play();
    });
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

