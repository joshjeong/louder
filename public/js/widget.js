timestampData = {}
globalCurrentSongUrl = ""

Player = {}
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
    var trackUrl = _this.currentSongUri
    PlayerView.changePlayerHeight();
    var soundCloudGetRoute = 'http://api.soundcloud.com/resolve.json?url=' + trackUrl + '&client_id=' + CLIENT_ID
    $.get(soundCloudGetRoute, this.injectWidget)
  }

  this.injectWidget = function (song) {
    _this.currentSongUri = song.uri;
    _this.createWidget();
    $(document).trigger("newSong", [_this.currentSongUri])
    _this.bindHostWidgetListeners();
  }

  this.bufferGuestTrack = function() {
    $(document).trigger("newGuest")
    PlayerView.showPlay();
    _this.currentSongUri = globalCurrentSongUrl;
    _this.createWidget();
    _this.bindGuestWidgetListeners();
  }

  this.sendHostTimestamps = function(){
    //SC player
    _this.widget.getPosition(function(position){
      $(document).trigger("sendHostClickedPlay",
       [Date.now(), position])
    });
  }

  //SC Player
  this.playTrack = function() {
    _this.widget.play();
    PlayerView.showPause();
  }

  //SC Player
  this.pauseTrack = function() {
    _this.widget.pause();
    PlayerView.showPlay();
  }

  this.createWidget = function(){
    PlayerView.showWidget();
    //managed in SC Player
    _this.widget = SC.Widget(document.getElementById('sc-widget'));
    //SCPlayer
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
  this.bindGuestWidgetListeners = function(){
    _this.widget.bind(SC.Widget.Events.READY, function(){
      _this.bindGuestPlay();
    });
  }

  //SC Player
  this.bindGuestPlay = function(){
    _this.widget.bind(SC.Widget.Events.PLAY, function() {
      _this.widget.pause();
      setTimeout(function(){
      _this.widget.seekTo(timestampData.songProgress + (new Date().getTime() - timestampData.timestamp));
      _this.widget.play();
      }, 5000);
      _this.widget.unbind(SC.Widget.Events.PLAY);
    });
  }

  // This is Val's job.
    this.fetchTracks = function(query) {
      var promise = new $.Deferred();
      PlayerView.indicateWaiting() // indicate waiting
      SC.get('/tracks', {q:query}, function(tracks) { promise.resolve(tracks) })
      return promise.promise();
    }

    this.setupTypeAhead = function() {
      $('.search-field').typeahead({hint: false, highlight: true, minLength: 1 },
      {
        name: 'tracks',
        displayKey: 'title',
        source: function (query, process) {
          _this.fetchTracks(query).done(function(tracks){
            PlayerView.doneWaiting()
            process(tracks);
          });
        },
      }).bind("typeahead:selected", function(event, track, name){
          _this.currentSongUri = track.uri
          _this.loadSongFromURL()
          $(this).val('')
          $('.loader').show()
        })
    };
    }

PlayerView = {}
PlayerView.showPlay= function(){
  $('#guest-playing').show();
  $('#pause-button').hide();
  $('#connect-button').hide();
}

PlayerView.changePlayerHeight = function() {
  $('#player').animate({height: "15rem"}, 1000)
}

PlayerView.showPause = function(){
  $('#play-button').hide()
  $('#pause-button').show()
}

PlayerView.showWidget = function(){
  if ($('body').hasClass('bg')) {
    var widgetFirstHalf = "<iframe id='sc-widget' src='http://w.soundcloud.com/player/?url=";
    var widgetSecondHalf = "&client_id=" + CLIENT_ID + "&auto_play=false&buying=false&liking=false&" +
    "download=false&sharing=false&show_artwork=false&show_comments=false&show_playcount=false&show_user"
    + "=false&hide_related=false&visual=false'></iframe>";
  }
  else {
    var widgetFirstHalf = "<iframe id='sc-widget' src='http://w.soundcloud.com/player/?url=";
    var widgetSecondHalf = "&client_id=cb9becb59cf3652d68a2142bf9ac316e&amp;auto_play=false&amp;buying=false&amp;" +
    "liking=false&amp;download=false&amp;sharing=false&amp;show_artwork=false&amp;show_comments=" +
    "false&amp;show_playcount=false&amp;show_user=false&amp;hide_related=false&amp;visual=true&amp"
    + ";start_track=0&amp;callback=true'></iframe>";
  }
  $("div#widget").html(widgetFirstHalf + _this.currentSongUri + widgetSecondHalf)
  $('.loader').fadeOut(1000);
  $("#widget").fadeIn(4000);
}


PlayerView.indicateWaiting = function(){
  $('body').addClass('waiting');
}

PlayerView.doneWaiting = function(){
  $('body').removeClass('waiting');
}


$( document ).ready(function(){
  SC.initialize({
    client_id: CLIENT_ID,
    redirect_uri: "http://localhost:8080/",
  });
  pController = new Player.Controller;
  pController.bindListeners();
  pController.setupTypeAhead();
  guestAnimation();
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
