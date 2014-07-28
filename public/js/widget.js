timestampData = {}
globalCurrentSongUrl = ""
$( document ).ready(function(){
  // var widgetIframe = document.getElementById('sc-widget'),
  //     widget       = SC.Widget(widgetIframe);

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

    this.loadSongFromURL = function(event) {
      event.preventDefault();
      var trackUrl = $(event.target).find('input').eq(0).val();
      console.log('this is the track url');
      console.log(trackUrl);
      $.get('http://api.soundcloud.com/resolve.json?url=' + trackUrl + '&client_id=d8eb7a8be0cc38d451a51d4d223ee84b',
      function (song) {
        _this.currentSongUri = song.uri;
        //--------TODO-----------
        //Create widget and insert into document
        //Bind host widget listeners
        //-----------------------
        _this.createWidget();
        socket.emit('hostPickedSong', {song: _this.currentSongUri});
        _this.bindHostWidgetListeners();
      });
    }

    this.bufferGuestTrack = function() {
      socket.emit('userClickedConnect', {data: 'none'});
      $('#guest-playing').show();
      $('#connect-button').hide();

      //create the widget
      _this.currentSongUri = globalCurrentSongUrl;
      _this.createWidget();
      _this.bindGuestWidgetListeners();
      _this.widget.play();
    }

    this.sendHostTimestamps = function(){
      var currentPosition;
      _this.widget.getPosition(function(position){
        console.log("postion: " + position)
        currentPosition = position
      });
      socket.emit('hostClickedPlay',
      {timestamp: Date.now(), songProgress: currentPosition});
    }

    this.playTrack = function() {
      console.log('this is in playTrack')
      _this.widget.play();
      setInterval(
        function(){_this.widget.getPosition(function(position){
          console.log(position)
        })
      }, 100)
      $('#play-button').hide()
      $('#pause-button').show()
    }

    this.pauseTrack = function() {
      console.log('this is in pauseTrack');
      _this.widget.pause();
      $('#pause-button').hide();
      $('#play-button').show();
    }

    this.createWidget = function(){
      //create widget by inserting it into the widget div. You will not see the widget as it is hidden.
      console.log(_this.currentSongUri)
      widgetFirstHalf = "<iframe id='sc-widget' src='http://w.soundcloud.com/player/?url="
      widgetSecondHalf = "&client_id=d8eb7a8be0cc38d451a51d4d223ee84b'></iframe>"
      $("div#widget").html(widgetFirstHalf + _this.currentSongUri + widgetSecondHalf)

      //set widget variable to the widget
      _this.widget = SC.Widget(document.getElementById('sc-widget'));
    }

    this.bindHostWidgetListeners = function(){
      _this.widget.bind(SC.Widget.Events.READY, function(){
        _this.widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(){
            console.log("sending timestamps")
            _this.sendHostTimestamps();
            _this.widget.unbind(SC.Widget.Events.PLAY_PROGRESS);
        });
      });
    }

    //binds the listeners that will cause it to sync on the first play event.
    this.bindGuestWidgetListeners = function(){
      _this.widget.bind(SC.Widget.Events.READY, function(){
        _this.widget.bind(SC.Widget.Events.PLAY, function() {
          _this.widget.seekTo(timestampData.songProgress + (new Date().getTime()/1000 - timestampData.timestamp) + 400);
          _this.widget.pause();
          setTimeout(function(){
            _this.widget.play();
            //prevent occasional buffer reset that causes it to start from the beginning of the song. We can use this to set it to the exact desired time.
            _this.widget.seekTo(timestampData.songProgress + (new Date().getTime()*1 - timestampData.timestamp));
          }, 500);
          _this.widget.unbind(SC.Widget.Events.PLAY);
        });
      });
    }
  }

  pController = new Player.Controller
  pController.bindListeners()
  globalCurrentSongUrl = ""
});