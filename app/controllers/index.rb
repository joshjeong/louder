require 'time'

get '/' do
  # to float and times 1000 to turn it into Javascript's time format
  @fakeHostTime = 1406328436593.838 #Time.now.to_f * 1000 - 20000
  @fakeHostProgress = 5000
  erb :index
end