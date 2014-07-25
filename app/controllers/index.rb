require 'time'

get '/' do
  # to float and times 1000 to turn it into Javascript's time format
  @fakeHostTime = 1406325594471.7861 #Time.now.to_f * 1000 - 20000
  @fakeHostProgress = 5000
  erb :index
end