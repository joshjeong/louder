get '/' do
  @fakeHostTime = Time.now.to_f * 1000 - 20000
  @fakeHostProgress = 5000
  erb :index
end