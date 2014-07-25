get '/' do
  @fakeHostTime = Time.now.to_f * 1000 - 15000
  @fakeHostProgress = 15000
  erb :index
end