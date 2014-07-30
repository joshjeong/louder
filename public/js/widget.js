timestampData = {}
globalCurrentSongUrl = ""

CLIENT_ID = "d8eb7a8be0cc38d451a51d4d223ee84b"
$( document ).ready(function(){
  SC.initialize({
    client_id: CLIENT_ID,
    redirect_uri: "http://localhost:8080/",
  });
  Player = {}

  guestAnimation();
  Player.Controller = function() {
    this.widget = {}
    this.currentSongUri = {}
    _this = this;

    this.bindListeners = function() {
      $("#connect-button").on('click', this.bufferGuestTrack);
      $('#play-button').on('click', this.playTrack);
      $('#pause-button').on('click', this.pauseTrack);
      $('#soundCloudURL').on('submit', this.loadSongFromURL);
    }

    //Socket
    this.emitCurrentSong = function(song){
      socket.emit('hostPickedSong', {song: song});
    }

    //Socket
    this.emitGuestConnect = function(){
      socket.emit('userClickedConnect', {id: socket.io.engine.id, playing: true});
    }

    this.loadSongFromURL = function() {
      var trackUrl = _this.currentSongUri
      _this.changePlayerHeight();
      $.get('http://api.soundcloud.com/resolve.json?url=' + trackUrl + '&client_id=d8eb7a8be0cc38d451a51d4d223ee84b',
      function (song) {
        _this.currentSongUri = song.uri;

        //SC player
        _this.createWidget();
        //Socket manager
        _this.emitCurrentSong(this.currentSongUri);
        //SC player
        _this.bindHostWidgetListeners();
      });
    }

    //View
    this.showPlay = function() {
      $('#guest-playing').show();
      $('#pause-button').hide();
      $('#connect-button').hide();
    }

    this.bufferGuestTrack = function() {
      //Socket
      _this.emitGuestConnect();

      //View
      _this.showPlay();

      _this.currentSongUri = globalCurrentSongUrl;

      //View
      _this.createWidget();
      _this.bindGuestWidgetListeners();
    }

    this.generateTimestamps = function(){
      var songProgress = ""
      var timestamp = ""
      _this.widget.getPosition(function(position){
        songProgress = position;
        timestamp = Date.now();
      });
      return {songProgress: songProgress, timestamp: timestamp}
    }

    //Socket
    this.emitTimestamps = function(timestamp, songProgress){
      socket.emit('hostClickedPlay',
      {timestamp: timestamp, songProgress: songProgress});
    }

    this.sendHostTimestamps = function(){
      //SC player
      var timestamps = generateTimestamps();

      //Socket
      _this.emitTimestamps(timestamps.timestamp, timestamps.songProgress)
    }

    //View
    this.changePlayerHeight = function() {
      $('#player').animate({height: "15rem"}, 1000)
    }

    //View
    this.showPause = function(){
      $('#play-button').hide()
      $('#pause-button').show()
    }

    //SC Player
    this.playTrack = function() {
      _this.widget.play();

      //View
      _this.showPause();
    }

    //SC Player
    this.pauseTrack = function() {
      _this.widget.pause();

      //View
      _this.showPlay();
    }

    //View
    this.showWidget = function(){
      var widgetFirstHalf = "<iframe id='sc-widget' src='http://w.soundcloud.com/player/?url=";
      var widgetSecondHalf = "&client_id=" + CLIENT_ID + "'></iframe>";
      $('#button').show();
      $("div#widget").html(widgetFirstHalf + _this.currentSongUri + widgetSecondHalf);
    }

    //SC widget
    this.SCshowTrackTitle = function(){
      var songInfo = _this.currentSongUri + ".json?client_id=" + CLIENT_ID;

      SC.get(songInfo, function(track) {
        console.log(track)
        _this.showTrackTitle(track.title);
      });
    }

    this.createWidget = function(){
      //View
      _this.showWidget();

      //managed in SC Player
      _this.widget = SC.Widget(document.getElementById('sc-widget'));

      //SCPlayer
      _this.SCshowTrackTitle()
    }

    //View
    this.showTrackTitle = function(title){
      $('#player').append("<div class = 'title'>" + title + "</div>");
    }

    //SC Player
    this.bindHostWidgetListeners = function(){
      _this.widget.bind(SC.Widget.Events.READY, function(){
        _this.bindHostPlay();
      });
    }

    //SC Player
    this.bindHostPlay = function(){
      _this.widget.bind(SC.Widget.Events.PLAY, function(){
        setTimeout(function(){
          _this.sendHostTimestamps();
          _this.widget.unbind(SC.Widget.Events.PLAY_PROGRESS);
        }, 100);
      });
    }

    //SC Player
    this.bindGuestWidgetListeners = function(){
      _this.widget.bind(SC.Widget.Events.READY, function(){
        _this.bindGuestPlay();
      });
    }

    //SC Player
    this.bindGuestPlay = function(){
      _this.widget.bind(SC.Widget.Events.PLAY, function() {
        _this.widget.seekTo(timestampData.songProgress + (new Date().getTime() - timestampData.timestamp)+1900);
        _this.widget.pause();
        setTimeout(function(){
          _this.widget.play();
          _this.widget.seekTo(timestampData.songProgress + (new Date().getTime() - timestampData.timestamp));
        }, 2000);
        _this.widget.unbind(SC.Widget.Events.PLAY);
      });
    }

    // This is Val's job.
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
      }).bind("typeahead:selected", function(event, track, name){
          _this.currentSongUri = track.uri
          _this.loadSongFromURL()
        })
    };
  }

  pController = new Player.Controller;
  pController.bindListeners();
  pController.setupTypeAhead();
});

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
