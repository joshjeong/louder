var serverBaseUrl = "http://127.0.0.0"
io = { connect: function() { return new Socket }};
function Socket(){
  this.on = function(){}
  this.emit = function(){}
}
describe("Application Testing", function(){

  it("should run a test", function(){
    console.log('socket', socket)
    console.log('server base url', serverBaseUrl)
    expect(5).toBe(5)
  })

})
