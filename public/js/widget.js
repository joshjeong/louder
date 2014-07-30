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

    this.loadSongFromURL = function() {
      var trackUrl = _this.currentSongUri //$(event.target).find('input').eq(0).val();
      _this.changePlayerHeight();
      $.get('http://api.soundcloud.com/resolve.json?url=' + trackUrl + '&client_id=d8eb7a8be0cc38d451a51d4d223ee84b',
      function (song) {
        _this.currentSongUri = song.uri;
        _this.createWidget();
        socket.emit('hostPickedSong', {song: _this.currentSongUri});
        _this.bindHostWidgetListeners();
      });
    }

    this.bufferGuestTrack = function() {
      socket.emit('userClickedConnect', {id: socket.io.engine.id, playing: true});
      $('#guest-playing').show();
      $('#connect-button').hide();

      //create the widget
      _this.currentSongUri = globalCurrentSongUrl;
      _this.createWidget();
      _this.bindGuestWidgetListeners();
    }

    this.sendHostTimestamps = function(){
      _this.widget.getPosition(function(position){
        socket.emit('hostClickedPlay',
        {timestamp: Date.now(), songProgress: position});
      });
    }

    this.changePlayerHeight = function() {
      $('#player').animate({height: "20rem"}, 1000)
    }

    this.playTrack = function() {
      _this.widget.play();
      setInterval(
        function(){_this.widget.getPosition(function(position){
        })
      }, 100)
      $('#play-button').hide()
      $('#pause-button').show()
    }

    this.pauseTrack = function() {
      _this.widget.pause();
      $('#pause-button').hide();
      $('#play-button').show();
    }

    this.createWidget = function(){
      // //create widget by inserting it into the widget div. You will not see the widget as it is hidden.
      widgetFirstHalf = "<iframe id='sc-widget' src='http://w.soundcloud.com/player/?url="
      widgetSecondHalf = "&client_id=" + CLIENT_ID + "'></iframe>"
      $("div#widget").html(widgetFirstHalf + _this.currentSongUri + widgetSecondHalf)
      // //set widget variable to the widget
      _this.widget = SC.Widget(document.getElementById('sc-widget'));
      songInfo = _this.currentSongUri + ".json?client_id=" + CLIENT_ID
      SC.get(songInfo, function(track) {
        // songWaveform = track.waveform_url;
        $('#player').append("<img src = '" + track.waveform_url + "' class = 'waveform'/>")
        $('#player').append("<div class = 'title'>" + track.title + "</div>");
        });
    }

    this.bindHostWidgetListeners = function(){
      _this.widget.bind(SC.Widget.Events.READY, function(){
        _this.widget.bind(SC.Widget.Events.PLAY, function(relativePosition, loadProgress, currentPosition){
          setTimeout(function(){
            _this.sendHostTimestamps();
            _this.widget.unbind(SC.Widget.Events.PLAY_PROGRESS);
          }, 100)
        });
      });
    }

    //binds the listeners that will cause it to sync on the first play event.
    this.bindGuestWidgetListeners = function(){
      _this.widget.bind(SC.Widget.Events.READY, function(){
        _this.widget.bind(SC.Widget.Events.PLAY, function() {
          //seekTO is calculated on the spot to minimize delay, despite it not being dry. This could be placed in another function but it would not be as quick.
          _this.widget.seekTo(timestampData.songProgress + (new Date().getTime() - timestampData.timestamp)+1900);
          _this.widget.pause();
          setTimeout(function(){
            console.log("buffered")
            _this.widget.play();
            //prevent occasional buffer reset that causes it to start from the beginning of the song. We can use this to set it to the exact desired time.
            _this.widget.seekTo(timestampData.songProgress + (new Date().getTime() - timestampData.timestamp));
          }, 2000);
          _this.widget.unbind(SC.Widget.Events.PLAY);
        });
      });
    }

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
