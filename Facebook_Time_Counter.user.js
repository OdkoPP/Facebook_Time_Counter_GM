// ==UserScript==
// @name        Facebook Time Counter
// @namespace   TimeCounter
// @author      OdkoPP
// @include     http*://www.facebook.com/*
// @description Plugin to count time spent on Facebook
// @version     1
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js
// ==/UserScript==

var h, m, s;
var saveOrg = 3;
var saveAct = saveOrg;
var todayDate;
var status = "off";
var id = "";

// init function that runs at the begining to initilize all necessery variables
function init() {

  // get unique user name from blue bar on the top - used to store cookies for multiuser mode
  id = $('a[data-testid="blue_bar_profile_link"]').attr("href");
  id = id.split(".com/")[1];
  
  // get current date as day/month/year ... months are numbered from 0 to 11 => getMonth()+1 to get actual month
  var currentDate = new Date();
  todayDate = currentDate.getDate()+"/"+(currentDate.getMonth()+1)+"/"+currentDate.getFullYear();
  // check to cookies, whether there is already note for today
  var todayTime = getCookie(id+"."+todayDate);
  
  // if there are no data for today set all zeroes and set cookies to all zeroes. Else load data from cookies and use them
  if(todayTime == ""){
    setAppTime("00:00:00")
    setTimeCookie();
  } else {
    setAppTime(todayTime);
  }
  
  // display data on page - on the place where find friends button was
  var ref = $("#findFriendsNav").parent();
  ref.append("<div style='width: 90px; text-align: center; padding-top: 5px; font-size: 13px' id='stopWatch'>"+formatNum(h)+":"+formatNum(m)+":"+formatNum(s)+"</div>");
  $("#stopWatch").after("<div id='timeTable' style='position: relative; width:88px; margin-top: 13px; border: 1px solid grey; color: black; visibility: hidden; background-color: white; border-radius: 3px; box-shadow: 0 3px 8px rgba(0, 0, 0, .3);'></div>")
  $("#findFriendsNav").remove();
  
  // data history - for 7 days
  var foundAmount = 0;
  var currentdate2 = new Date();
  for(var i = 0; i < 7; i++){
    currentdate2.setDate(currentdate2.getDate() - 1);
    var yesterdayDate = currentdate2.getDate()+"/"+(currentdate2.getMonth()+1)+"/"+currentdate2.getFullYear();
    var yesterdayTime = getCookie(id+"."+yesterdayDate);
    if(yesterdayTime != ""){
      $("#timeTable").append("<div style='text-align:center; padding-bottom: 5px'><hr style=' margin-left: 5px; margin-right: 5px; margin-top: 0px'>"+ yesterdayDate +"</br>"+ yesterdayTime +"</div>");
      foundAmount++;
    }
  }
  // if there are no data
  if(foundAmount == 0){
    $("#timeTable").html("<span style='margin-left: 23px'>No data</span>");
  }
  
  // start timer
  setTimeout(stopwatch, 1000);
}

// mouse listener to show/hide hitory
$(document).ready(function(){ 
    $(document)
        .on('mouseover', '#stopWatch', function() { 
            $("#timeTable").css("visibility", "initial");
        })
        .on('mouseleave', '#stopWatch', function() { 
            $("#timeTable").css("visibility", "hidden");
        })
});

// function to set app time to time represented as String (hh:mm:ss)
function setAppTime(time){
  time = time.split(":");
  h = parseInt(time[0]);
  m = parseInt(time[1]);
  s = parseInt(time[2]);
}

// function to format standard cookie saves and set TTL(8 days)
function setTimeCookie(){
  // set expiration date
  var a = new Date();
  a = new Date(a.getTime() +1000*60*60*24*8);
  // set cookie
  document.cookie = id+"."+todayDate+"="+formatNum(h)+":"+formatNum(m)+":"+formatNum(s)+"; expires="+a.toGMTString()+";";
}

// main stopwatch function
function stopwatch(){
  // if user inactive
  if(status == "off"){
    setTimeout(stopwatch, 1000);
    return;
  }
  
  // if user active = move time 
  s++;
  if(s > 59){
    s = 0;
    m++;
    if(m > 59){
      m = 0;
      h++;
    }
  }

  saveTime();
  
  // display changes
  $('#stopWatch').text(formatNum(h)+":"+formatNum(m)+":"+formatNum(s));
  // wait 1 sec to run this function again
  setTimeout(stopwatch, 1000);
}

// function to save time to cookies every saveOrg seconds
// also check whether there is a later time (from other FB active window) app will sync with that time
function saveTime(){
  saveAct--;
  if(saveAct <= 0){
    saveAct = saveOrg;
    var actTime = getCookie(id+"."+todayDate);
    actTime = actTime.split(":");
    if((parseInt(actTime[0])*3600 + parseInt(actTime[1])*60 + parseInt(actTime[2])) < (h*3600+m*60+s)){
      setTimeCookie();
    } else {
      setAppTime(actTime);
    }
  }  
}

// function to get cookies from browser
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
} 

// function to format text to be printed (allways two digits)
function formatNum(num){
  if(num < 10)
   return "0"+num;
  return num;
}

// function to check whether active on page
window.onload=window.onfocus=function() {
  status = "on";
}

// function to check whether inactive on page
window.onblur=function() {
  status = "off";
}

// everithing starts 1 second after load
$(document).ready(init());
