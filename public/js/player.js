$( document ).ready(function(){
  SC.initialize({
    client_id: "d8eb7a8be0cc38d451a51d4d223ee84b",
    redirect_uri: "http://localhost:8080/",
  });
  pController = new Player.Controller;
  pController.bindListeners();
  pController.setupTypeAhead();
  globalCurrentSongUrl = ""
  guestAnimation();
});

timestampData = {}
Player = {}
Player.Controller = function() {
  this.currentSong = {}
  this.currentSongUri = {}
  _this = this

  this.setupTypeAhead = function() {
    $('.search-field').typeahead(
    {
      hint: false,
      highlight: true,
      minLength: 1 },
    {
      name: 'tracks',
      displayKey: 'title',
      source: function (query, process) {
        var fetch = function(query) {
          var fetchTracks = new $.Deferred();
          SC.get('/tracks', {q:query}, function(tracks) {
            fetchTracks.resolve(tracks)
          })
          return fetchTracks.promise();
        }
        var dataPromise = fetch(query);
        $('body').addClass('waiting')
        dataPromise.done(function(tracks){
          $('body').removeClass('waiting')
          process(tracks);
        });
      },
    }).bind("typeahead:selected", function(event, track, name) {
      SC.stream(track.stream_url, {
        id: "louderPlayer",
        onplay: function(){
          this.onPosition(1, _this.sendHostTimestamps)
        }},
        function(track){
          _this.currentSong = track
          _this.showPlayButton()
        }),
      socket.emit('hostPickedSong', {song: track.stream_url})
    });
  },

  this.bindListeners = function() {
    $("#connect-button").on('click', this.bufferGuestTrack)
    $('#play-button').on('click', this.playTrack)
    $('#pause-button').on('click', this.pauseTrack)
  }

  this.bufferGuestTrack = function () {
    socket.emit('userClickedConnect', {id: socket.io.engine.id, playing: true})
    $('#guest-playing').show()
    $('#connect-button').hide()
    SC.stream(globalCurrentSongUrl, function(sound){
      _this.currentSong = sound
      var hostTimeStamp = timestampData.timestamp
      var hostProgress = timestampData.songProgress
      var guestTimeStamp = Date.now()
      _this.currentSong.play()
      _this.currentSong.toggleMute()
      setTimeout(function() {
        var timeToPlay = (guestTimeStamp - hostTimeStamp + hostProgress)
      _this.currentSong.setPosition((timeToPlay+10000)).play()
      _this.currentSong.toggleMute()
    }, 10000)
      setInterval(function(){
        console.log(_this.currentSong.position)
      }, 100)
    })
  }
  this.sendHostTimestamps = function(){
    socket.emit('hostClickedPlay', {timestamp: Date.now(), songProgress: _this.currentSong.position})
  }
  this.playTrack = function() {
    debugger
    _this.currentSong.play();
    // setInterval(function(){console.log(_this.currentSong.position)}, 100)
    $('#play-button').hide()
    $('#pause-button').show()
    // socket.emit('hostPickedSong', {song: _this.currentSongUri})
  }
  this.pauseTrack = function() {
    console.log('this is in pauseTrack')
    _this.currentSong.pause()
    $('#pause-button').hide()
    $('#play-button').show()
  };

  //Show button and change height of player once song has been selected
  this.showPlayButton = function() {
    $('#player').animate({height: '14rem'}, 900, function(data) {
      $('#buttons').fadeIn(900);
    });
  }
}

  // D3 OBJECT --------------------------------------
  var guestAnimation = function() {
    var width = Math.max(2000, innerWidth),
    height = Math.max(2000, innerHeight);
    var i = 0;
    var svg = d3.select("#d3").append("svg")
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
  }
