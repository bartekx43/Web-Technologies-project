function myTimer()
{
    var today = new Date();
    var time = (today.getHours() < 10 ? ("0"+today.getHours()) : today.getHours()) + ":" + (today.getMinutes() < 10 ? ("0"+today.getMinutes()) : today.getMinutes()) + ":" + (today.getSeconds() < 10 ? ("0"+today.getSeconds()) : today.getSeconds());
    postMessage(time);
}
          
setInterval(function(){myTimer()},1000);
