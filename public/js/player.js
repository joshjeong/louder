$( document ).ready(function(){
  SC.initialize({
    client_id: "d8eb7a8be0cc38d451a51d4d223ee84b",
    redirect_uri: "http://localhost:8080/",
  });
  pController = new Player.Controller
  pController.bindListeners()
  globalCurrentSongUrl = ""
  // setTimeout(function(){pController.playTrack()}, 3000);

  // D3 OBJECT --------------------------------------

  var width = Math.max(2000, innerWidth),
    height = Math.max(2000, innerHeight);

  var i = 0;

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .on("ontouchstart" in document ? "touchmove" : "mousemove", particle);

  function particle() {
    var m = d3.mouse(this);

    svg.insert("circle", "rect")
        .attr("cx", m[0])
        .attr("cy", m[1])
        .attr("r", 1e-6)
        .style("stroke", d3.hsl((i = (i + 1) % 360), 1, .5))
        .style("stroke-opacity", 1)
      .transition()
        .duration(2000)
        .ease(Math.sqrt)
        .attr("r", 100)
        .style("stroke-opacity", 1e-6)
        .remove();

    d3.event.preventDefault();
  }



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
        var hostTimeStamp = timestampData.timestamp
        var hostProgress = timestampData.songProgress
        var guestTimeStamp = Date.now()

        _this.currentSong.play()

        setTimeout(function() {
        var timeToPlay = (guestTimeStamp - hostTimeStamp + hostProgress)
        _this.currentSong.setPosition((timeToPlay+5100)).play()
        console.log('now it should jump')
        }, 5000)


        // console.log(_this.currentSong.position)
        // setInterval(function(){console.log(_this.currentSong.position)}, 100)
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

