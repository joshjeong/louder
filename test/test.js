var should = require('should')
var io = require('socket.io-client')
var assert = require("assert")

var socketUrl = "http://localhost:8080/"

var options ={
  transports: ['websocket'],
  'force new connection': true
}

var user1 = {name: "Jeff"}
var user2 = {name: "Josh"}
var user3 = {name: "Valerie"}

describe("Accuracy Testing", function(done){
  it("should have a difference in song progress of less than 50ms", function(){

    var client1 = io.connect(socketUrl, options)
    console.log('connect command: '+ client1.connect)
    client1.connect()
    

    client1.on('connect', function(data){
      console.log('connected')
      var sessionId = socket.io.engine.id;
      // client1.emit("newUser", {id: sessionId, name: $('#name').val(), song: "", timestamp: 0, currentProgress: 0, playing: false} )
      console.log('your session id: '+ sessionId)
      should(sessionId).eql(1223000)

      client1.disconnect();
      done();
    })

  })
})