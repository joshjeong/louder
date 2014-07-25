$( document ).ready(function() {
var pView = new Player.View
var pController = new Player.Controller(pView)
pController.bindListeners();
})

Player = {}
Search = {}

Player.Controller = function(view) {
  this.view = view
  this.searchQuery = new Player.SearchQuery(this)

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
      form.on('submit', this.displaySearchQuery.bind(this))
      // debugger
      widget.bind(SC.Widget.Events.FINISH, this.view.renderNextSong.bind(this.view))
      },
      // widget.bind(SC.Widget.Events.PLAY_PROGRESS, this.view.renderNextSong.bind(this.view))
      // },
    displaySearchQuery: function(event) {
      event.preventDefault()
      searchParameter = this.view.getInput()
      this.searchQuery.getTracks(searchParameter)
      // debugger
      // send searchParameter to Player.SearchQuery object to hit soundcloud api
      // returns arry of song objects with artwork urls and song urls
      // create a gallery of thumnails with song titles and artists

    },

    doSomethingWithTracks: function(tracks) {
      console.log(tracks)
    },

    queueSong: function() {
      this.view.queue.push(url)
      this.view.clearInput(url)
    }
  }


Player.Presenter = function() {
}

Player.Presenter.prototype = {

}


Player.View = function() {
  this.queue = []
}

Player.View.prototype = {
  getWidget: function() {
    return document.getElementById('sc-widget')
  },

  getForm: function() {
    return $('#new-content')
  },
  getInput: function() {
    return $('#new-content').find('input').val()
  },
  clearInput: function(url) {
    $('#new-content').find('input').first().val('')
    $('#flash-message').text("" + url + " Was Just Added")
    $('#flash-message').fadeIn(1000)
    $('#flash-message').fadeOut(3000)
  },

  renderNextSong: function() {
    // debugger
    var url = this.queue.splice(0,1)[0]
    var html = '<iframe id="sc-widget" src="https://w.soundcloud.com/player/?url=' + url + '&sharing=false&download=false&buying=false&liking=false&show_comments=false&show_playcount=true&show_user=false&show_artwork=true&visual=true" width="100%" height="465" scrolling="no" frameborder="no"></iframe>'
    $('#frame-holder').html(html)
  }

}



Player.SearchQuery = function(controller){
  this.controller = controller
  this.getTracks = function(searchParameter) {
    var done = function(tracks) {
      this.controller.doSomethingWithTracks(tracks)
    }
    SC.initialize({
      client_id: 'd8eb7a8be0cc38d451a51d4d223ee84b'
    });
    SC.get('http://api.soundcloud.com/tracks', { q: 'zedd' }, done.bind(this));
  }
}


//////////////////////======================================

// Search.Controller = function(view) {
//   this.view = view
// }

// Search.Controller.prototype = {
//   bindListeners: function() {
//       var form = this.view.getForm()
//       form.on('submit', this.queueSong.bind(this))
//       // debugger
//       widget.bind(SC.Widget.Events.FINISH, this.view.renderNextSong.bind(this.view))
//       },
//       // widget.bind(SC.Widget.Events.PLAY_PROGRESS, this.view.renderNextSong.bind(this.view))
//       // },
//     queueSong: function(event) {
//       event.preventDefault()
//       url = this.view.getInput()
//       // use serialize toget form info
//       // send to player.view to store in queue
//       this.view.queue.push(url)
//       this.view.clearInput(url)
//     }
// }

// Search.View = function() {
//   this.queue = []
// }

// Search.View.prototype = {

//   getForm: function() {
//     return $('#search')
//   },
//   getInput: function() {
//     return $('#search').find('input').val()
//   },
//   clearInput: function(url) {
//     $('#search').find('input').first().val('')
//     $('#flash-message').text("" + url + " Was Just Added")
//     $('#flash-message').fadeIn(1000)
//     $('#flash-message').fadeOut(3000)
//   },

//   renderNextSong: function() {
//     // debugger
//     var url = this.queue.splice(0,1)[0]
//     var html = '<iframe id="sc-widget" src="https://w.soundcloud.com/player/?url=' + url + '&sharing=false&download=false&buying=false&liking=false&show_comments=false&show_playcount=true&show_user=false&show_artwork=true&visual=true" width="100%" height="465" scrolling="no" frameborder="no"></iframe>'
//     $('#frame-holder').html(html)
//   }
// }
