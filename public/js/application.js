// Useless function
/* function eventAlarm(minutes, seconds, milliseconds, cb) {
  (function loop() {
      var now = new Date();
      if (now.getMinutes() === minutes && now.getSeconds() === seconds && now.getMilliseconds() >= milliseconds) {
        cb();
      } else {
        //recursively calls self to the delay
        setTimeout(loop, 1); }
  })();
}
*/