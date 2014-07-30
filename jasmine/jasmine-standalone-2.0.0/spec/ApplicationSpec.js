var serverBaseUrl = "http://127.0.0.0"
io = {connect: function(){}};
socket = function(){on: function(){}}
describe("Application Testing", function(){

  it("should run a test", function(){
    console.log('socket', socket)
    console.log('server base url', serverBaseUrl)
    expect(5).toBe(5)
  })

})
