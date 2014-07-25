$( document ).ready(function() {
var pView = new Player.View
var pController = new Player.Controller(pView)
pController.bindListeners();
})

Player = {}

Player.Controller = function(view) {
  this.view = view

  var widgetIframe = this.view.getWidget()
  widget = SC.Widget(widgetIframe);
};




// CODE WE DIDNT WRITE
//   widget.bind(SC.Widget.Events.READY, function() {
//     console.log('the player is ready')
//     getForm: function() {
//       return $('#new-content')
//     }
//     widget.bind(SC.Widget.Events.PLAY, function() {
//       console.log('this should fire off when we press play')
//         widget.getCurrentSound(function(currentSound) {
//         });
//       });
//       widget.getVolume(function(volume) {
//         console.log('current volume value is ' + volume);
//       });
//       widget.setVolume(50);

// };

  Player.Controller.prototype = {
    bindListeners: function() {
      var form = this.view.getForm()
      form.on('submit', this.queueSong)
      // debugger
      widget.bind(SC.Widget.Events.FINISH, this.view.renderNextSong )
    },

    queueSong: function() {
      // use serialize toget form info
      // send to player.presenter
      // sends return of that to view to store in que

    }
  }


Player.Presenter = function() {
}

Player.Presenter.prototype = {

}


Player.View = function() {
  var queue = ["https://soundcloud.com/zedd/spectrum"]
  _this = this
}

Player.View.prototype = {
  getWidget: function() {
    return document.getElementById('sc-widget')
  },

  getForm: function() {
    return $('#new-content')
  },

  renderNextSong: function() {
    debugger
    var url = _this.queue.splice(0,1)
    var html = '<iframe id="sc-widget" src="https://w.soundcloud.com/player/?url=' + url + '&sharing=false&download=false&buying=false&liking=false&show_comments=false&show_playcount=true&show_user=false&show_artwork=true&visual=true" width="100%" height="465" scrolling="no" frameborder="no"></iframe>'
    $('#frame-holder').html(html)
  }

}
