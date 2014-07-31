timestampData = {}
globalCurrentSongUrl = ""
CLIENT_ID = "d8eb7a8be0cc38d451a51d4d223ee84b"
Player = {}
Player.Controller = function() {
  this.widget = {}
  this.currentSongUri = {}
  _this = this;

  this.bindListeners = function() {
    $("#connect-button").on('click', this.bufferGuestTrack);
    $('#play-button').on('click', this.playTrack);
    $('#pause-button').on('click', this.pauseTrack);
    $('#soundCloudURL').on('submit', this.injectWidget);
  }

  // this.loadSongFromURL = function() {
  //   // var trackUrl = _this.currentSongUri
  //   // PlayerView.changePlayerHeight();
  //   // var soundCloudGetRoute = 'http://api.soundcloud.com/resolve.json?url=' + trackUrl + '&client_id=' + CLIENT_ID
  //   this.injectWidget()
  //   // $.get(soundCloudGetRoute, this.injectWidget)
  // }

  this.injectWidget = function () {

    // _this.currentSongUri = song.uri;
    _this.createWidget();
    $(document).trigger("newSong", [_this.currentSongUri])
  }

  this.bufferGuestTrack = function() {
    $(document).trigger("newGuest")
    PlayerView.showPlay();
    _this.currentSongUri = globalCurrentSongUrl;
    _this.createWidget();
    setTimeout(function() {
      $('.sc-play').click();
      console.log("TRIGGEREDEDEDE")
    },5000)
    _this.bindGuestPlay();
  }

  this.sendHostTimestamps = function(){
    //SC player
    var position = audioEngine.getPosition();
      $(document).trigger("sendHostClickedPlay", [Date.now(), position])
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

  //SC widget
  this.SCshowTrackTitle = function(){
    var songInfo = _this.currentSongUri + ".json?client_id=" + CLIENT_ID;

    SC.get(songInfo, function(track) {
      console.log(track)
      PlayerView.showTrackTitle(track.title);
    });
  }

  this.createWidget = function(){
    PlayerView.showWidget();
    $('.sc-player').remove();
    var track = "<a href='"+_this.currentSongUri+"' id='widdget' class='sc-player'></a>"
    $('.wrapper').append(track)
    var node = document.getElementById('widdget')
    _this.widget = $.scPlayer(undefined, node)
  }

  //SC Player
  // this.bindHostWidgetListeners = function(){
  //   // _this.widget.bind(SC.Widget.Events.READY, function(){
  //     console.log('bindHostWidgetListeners')
  //     _this.bindHostPlay();
  //   // });
  // }


  //SC Player
  this.bindHostPlay = function(){
    // _this.widget.bind(SC.Widget.Events.PLAY, function(){
      console.log('bindHostPlay')
      setTimeout(function(){
        _this.sendHostTimestamps();
    //     _this.widget.unbind(SC.Widget.Events.PLAY_PROGRESS);
      }, 100);
    // });
  }

  //SC Player
  // this.bindGuestWidgetListeners = function(){
  //   // _this.widget.bind(SC.Widget.Events.READY, function(){
  //     _this.bindGuestPlay();
  //   // });
  // }

  //SC Player
  this.bindGuestPlay = function(){
    // audioEngine.seek(1);
    // // _this.widget.bind(SC.Widget.Events.PLAY, function() {
    //   audioEngine.seek(timestampData.songProgress + (new Date().getTime() - timestampData.timestamp)+1900, _this.currentSongUri);
    //   audioEngine.pause();
    //   setTimeout(function(){
    //     audioEngine.play();
    //     audioEngine.seek(timestampData.songProgress + (new Date().getTime() - timestampData.timestamp));
    //   }, 2000);
    //   _this.widget.unbind(SC.Widget.Events.PLAY);
    // });
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
          _this.injectWidget()
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
  // var widgetFirstHalf = "<iframe id='sc-widget' src='http://w.soundcloud.com/player/?url=";
  // var widgetSecondHalf = "&client_id=" + CLIENT_ID + "'></iframe>";

  $('#button').show();
  // $("div#widget").html(widgetFirstHalf + _this.currentSongUri + widgetSecondHalf);
}

PlayerView.showTrackTitle = function(title){
  $('#player').append("<div class = 'title'>" + title + "</div>");
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
