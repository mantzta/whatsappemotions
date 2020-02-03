$("body").append('<canvas id="profilepic" width="400" height="300"></canvas>');
$("body").append('<canvas id="overlay" width="400" height="300"></canvas>');
$("body").append("<div id='bg'></div>");
$("body").append("<div id='emoPics'><p id='picsText'>Your emotions will be shown in your profile picture. Therefore, we need profile pictures showing each emotion of you. Take now a picture of the emotion:</br></br> Anger </p><button id='btnPics' type='button'>take picture</button>  <button id='btnAbort' class='btnClose'>cancel</button></div>");
$("body").append('<video id="videoel" width="400" height="300" preload="auto" loop></video>');
$("body").append("<img src='' class='testimg' />");
$("body").append("<div id='reminder'>Did you forget to turn on your extension?<button class='btnCloseReminder'>close</button></div>");

var an = "Visualization is turned on for ";
var aus = "Visualization is turned off for ";

var buttonEmotion = "<div id='btnEmotion' class='emoBtns'>My emotions</div>";
var buttonBlacklist = "<div id='btnBlacklist' class='emoBtns'>Blacklist</div>";
var buttonOnOff = "<div id='btnOnOff' class='emoBtns'>"+aus+"</div>";
var buttonPics = "<div id='btnPicsMenu' class='emoBtns'>Take new profile pictures</div>";
var buttonShowPics = "<div id='btnShowPicsMenu' class='emoBtns'>Show profile pictures</div>";
var legendColor = "<div id='legend1'><div><div id='squareAnger1'></div> Anger <div id='squareHappiness1'></div> Happiness <div id='squareNeutral1'></div> Neutral </div><div><div id='squareSadness1'></div> Sadness <div id='squareSurprise1'></div> Surprise </div></div>";
var legendText = "<div id='legend2'><div><div id='squareAnger2'>Anger</div><div id='squareHappiness2'>Happiness</div><div id='squareNeutral2'>Neutral</div></div><div><div id='squareSadness2'>Sadness</div><div id='squareSurprise2'>Surprise</div>  </div></div>";

var popup = "<div id='popup'><button id='btnClose' class='btnClose'>close</button></div>";

var buttonVis1 = "<div id='btnVis1' class='emoBtns'>Chathintergrund</div>";
var buttonVis2 = "<div id='btnVis2' class='emoBtns'>Chatnachricht Hintergrund</div>";
var buttonVis3 = "<div id='btnVis3' class='emoBtns'>Textstyle</div>";
var buttonVis4 = "<div id='btnVis4' class='emoBtns'>Profilbilder</div>";

var permissionList = [];
var blacklist = [];
var permissionListOtherWay = [];
var blacklistOtherWay = [];
var emoPicsExist = false;
var emoPicsLinks = [];
var emoPicsLinksCP = [];
var cmd = "";

var stopTakingPics = false;
var stopSavingPics = false;
var currentlyTakingPics = false;

var newTimestamp = Date.now();
var oldTimestamp = newTimestamp;
var userEmotionOn = false;

var currentVisualization = 1;

var vidWidth = 400;
var vidHeight = 300;

$(document).ready(function(){
    
    /*********************** VISUALIZATION CHANGE ***************************/
    
    var firstuse = null;
    var firstuserTS = null;
    
    function checkFirstInstall(){
        var jsonUser = getUserphone();

        if(jsonUser != null){
            $.ajax({
                type: 'POST',
                url: 'https://tama.adhara.uberspace.de/emotion/firstuse.php',
                data: { 
                    'user': jsonUser
                      },
                success: function(res){
                    if(res !== "Error occured while retrieving firstuse timestamp."){
                        firstuse = res;
                        firstuserTS = Date.parse(firstuse);
                    }
                }
            });
        }
    }
    
    /*
    $("body").on("click", "#btnVis1", function () {
         currentVisualization = 1;
         deleteAllButtons();
         setAllButtons();
         unsetBubblesColor();
         unsetBubblesText();
         unsetProfilePic();
    });
    
    $("body").on("click", "#btnVis2", function () {
         currentVisualization = 2;
         deleteAllButtons();
         setAllButtons();
         unsetBackground();
         unsetBubblesText();
         unsetProfilePic();
    });
    
    $("body").on("click", "#btnVis3", function () {
         currentVisualization = 3;
         deleteAllButtons();
         setAllButtons();
         unsetBubblesColor();
         unsetBackground();
         unsetProfilePic();
    });
    
    $("body").on("click", "#btnVis4", function () {
         currentVisualization = 4;
         deleteAllButtons();
         setAllButtons();
         unsetBubblesColor();
         unsetBubblesText();
         unsetBackground();
    });
    */
    
    
    // check everyday if visualization should be changed
    setInterval(function setNewVisualization() {
        // millisonds of one/two/three/four weeks
        var oneWeek = 1000*60*60*24*7;
        var twoWeeks = oneWeek*2;
        var threeWeeks = oneWeek*3;
        var fourWeeks = oneWeek*4;
        
        var currentDaytime = new Date();
        
        if(firstuserTS != null){
            var difference = currentDaytime.getTime() - firstuserTS;
            // seconds
            var mod = difference % (1000*60*4);
            if(mod < 1000*60*1){
                currentVisualization = 1;
                deleteAllButtons();
                setAllButtons();
                unsetBubblesText();
                unsetBubblesColor();
                unsetProfilePic();
            }else if(mod < 1000*60*2){
                currentVisualization = 2;
                deleteAllButtons();
                setAllButtons();
                unsetBackground();
                unsetBubblesText();
                unsetProfilePic();
            }else if(mod < 1000*60*3){
                currentVisualization = 3;
                deleteAllButtons();
                setAllButtons();
                unsetBackground();
                unsetBubblesColor();
                unsetProfilePic();
            }else if(mod < 1000*60*4){
                currentVisualization = 4;
                deleteAllButtons();
                setAllButtons();
                unsetBackground();
                unsetBubblesText();
                unsetBubblesColor();
            }
        }
        
    }, 1000);
    
    
    /*********************** EMOTION BUTTON FUNCTIONALITIES ***************************/
    
    $("body").on("click", ".btnClose", function () {
         $("#popup").remove();
         // this is needed if the user emotion window is open and needs to be updated
         userEmotionOn = false;
    });
    
    // Close button of the reminder popup
    $("body").on("click", ".btnCloseReminder", function () {
         $("#reminder").css("visibility", "hidden");
    });

    $("body").on("click", "#btnEmotion", function () {
         if(!$("#popup").length){
             userEmotionOn = true;
             $("body").prepend(popup);
             getUserEmotion(getOtherTimestamp(5), getCurrentTimestamp());
         }else{
             $("#popup").remove();
             userEmotionOn = false;
         }
    });
    
    $("body").on("click", "#btnBlacklist", function () {
         if(!$("#popup").length){
             $("body").prepend(popup);
             $("#popup").append("<form action='' id='blacklist-form'></form>");
             for(var number in blacklist){
                 var checkbox = null;
                 if(blacklist[number]["blacklisted"] === "yes"){
                     checkbox = "<input type='checkbox' name='blacklist-checkbox' class='blacklist-checkbox' value='" + number + "' checked>" + blacklist[number]["name"] + " (" + number + ")<br><br>";
                 }else{
                     checkbox = "<input type='checkbox' name='blacklist-checkbox' class='blacklist-checkbox' value='" + number + "'>" + blacklist[number]["name"] + " (" + number + ")<br><br>";
                 }
                 $("#blacklist-form").append(checkbox);
             }
             
             // show chat groups but disable checkbox for them
             var groups = getGroups();
             for(index in groups){
                 checkbox = "<input type='checkbox' disabled='disabled' checked='checked'>"+groups[index]+"(Group)<br><br>";
                 $("#blacklist-form").append(checkbox);
             }
         }else{
             $("#popup").remove();
         }
    });
    
    $("body").on("click", ".blacklist-checkbox", function () {
        var chatpartner = $(this).attr('value');
        var chatpartnerArray = ["u="+chatpartner, chatpartner];
        var checkChatpartner = getChatpartnerPhone();
        chatpartnerArray = JSON.stringify(chatpartnerArray);
        if($(this).prop('checked')){
            setBlacklist(chatpartnerArray, 1);
            if(checkChatpartner === chatpartnerArray){
                unsetBackground();
                unsetProfilePic();
                unsetBubblesText();
                unsetBubblesColor();
            }
        }else{
            setBlacklist(chatpartnerArray, 0);
        }
        setTurnOnOffBtn();
    });
    
    $("body").on("click", "#btnOnOff", function () {
         if($("#btnOnOff").text().indexOf(an) !== -1){
             turnOnOff(0);
             try{
                 permissionList[JSON.parse(getChatpartnerPhone())[1]] = "no";
                 setTurnOnOffBtn();
                 unsetBackground();
                 unsetProfilePic();
                 unsetBubblesText();
                 unsetBubblesColor();
             }catch(err){}
         }else if($("#btnOnOff").text().indexOf(aus) !== -1){
             turnOnOff(1);
             try{
                 permissionList[JSON.parse(getChatpartnerPhone())[1]] = "yes";
                 setTurnOnOffBtn();
             }catch(err){}
         }
    });
    
    $("body").on("click", "#btnPicsMenu", function () {
        takePics("UPDATE_PICS");
    });
    
    $("body").on("click", "#btnShowPicsMenu", function () {
         if(!$("#popup").length){
             $("body").prepend(popup);
             if(emoPicsLinks.length > 0){
             }else{
                 fillEmoPicsList();
             }
             
             $.get(emoPicsLinks[0]).done(function() { 
                 for(var i=0; i<emoPicsLinks.length-1; i++){
                     var emotion = "";
                     switch(i){
                         case 0:
                             emotion = "Wut";
                             break;
                         case 1:
                             emotion = "Freude";
                             break;
                         case 2:
                             emotion = "Neutral";
                             break;
                         case 3:
                             emotion = "Traurigkeit";
                             break;
                         case 4:
                             emotion = "Überraschung";
                             break;
                     }
                     var img = "<div><img src='"+emoPicsLinks[i]+"?"+new Date().getTime()+"' \>"+emotion+"</div>";
                     $("#popup").append(img);
                 }
             }).fail(function() {

             })
         }else{
             $("#popup").remove();
         }
    });

    /*********************** WEBCAM STREAM ***************************/
    
    var vid = document.getElementById('videoel');
    var overlay = document.getElementById('overlay');
    var overlayCC = overlay.getContext('2d');
    var localMediaStream = null;
    var currentlyStreamStarting = false;

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

    function startStream(){
        currentlyStreamStarting = true;
        // check for camerasupport
        if (navigator.getUserMedia) {
            // set up stream
            var videoSelector = {video : true};
            if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
                var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
                if (chromeVersion < 20) {
                    videoSelector = "video";
                }
            };

            navigator.getUserMedia(videoSelector, function( stream ) {
                if (vid.mozCaptureStream) {
                    vid.mozSrcObject = stream;
                } else {
                    vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
                }
                localMediaStream = stream;
                currentlyStreamStarting = false;
                vid.play();
            }, function() {
                currentlyStreamStarting = false;
                //alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam or refresh the webpage.");
            });
        } else {
            alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
        }
    }
    
    startStream();

    vid.addEventListener('canplay', startVideo, false);

    /*********** EMOTION DETECTION *************/

    // set eigenvector 9 and 11 to not be regularized. This is to better detect motion of the eyebrows
    pModel.shapeModel.nonRegularizedVectors.push(9);
    pModel.shapeModel.nonRegularizedVectors.push(11);
    var er = null;

    var ctrack = new clm.tracker({useWebGL : true});
    ctrack.init(pModel);

    function startVideo() {
        // start video
        vid.play();
        // start tracking
        ctrack.start(vid);
        // start loop to draw face
        drawLoop();
    }
    
    function stopStream(){
        if(localMediaStream){
            localMediaStream.getTracks()[0].stop();
        }
    }

    function drawLoop() {
        if(localMediaStream.active){
            requestAnimFrame(drawLoop);
            overlayCC.clearRect(0, 0, 400, 300);
            if (ctrack.getCurrentPosition()) {
                ctrack.draw(overlay);
            }
            var cp = ctrack.getCurrentParameters();

            er = ec.meanPredict(cp);
        }
    }

    delete emotionModel['disgusted'];
    delete emotionModel['fear'];
    var ec = new emotionClassifier();
    ec.init(emotionModel);
    var emotionData = ec.getBlank();
    
    function calcEmotion(er){
        var highest = 0;
        var index = -1;
        for(var i=0; i<er.length; i++){
            if(highest < er[i]["value"] && er[i]["value"] > 0.5){
                highest = er[i]["value"];
                index = i;
            }
        }
        if(index != -1){
            var emotion = er[index]["emotion"];
            switch(emotion){
                    case "angry":
                                emotion = "anger";
                                break;
                    case "sad":
                                emotion = "sadness";
                                break;
                    case "surprised":
                                emotion = "surprise";
                                break;
                    case "happy":
                                emotion = "happiness";
                                break;
            }
            return emotion;
        }else{
            // neutral is standard if nothing is measured
            return "neutral";
        }
    }

    /*********************** PERMISSION ***************************/
    
    var turn_on = true;
    var old = true;
    var focus = true;
    
    // check if extension is turned off
    setInterval(function checkPermission() {
        
        chrome.storage.sync.get("turn_on_off", function(item){
            old = turn_on;
            turn_on = item.turn_on_off;
        });

        if(!turn_on){
            deleteAllButtons();
        }else{
            setAllButtons();
        }
        
        // turn off the webcam if user turned off whole emotion extension
        if(turn_on){
            if(permissionForAllOff() && !currentlyTakingPics){
                if(localMediaStream.active){
                    stopStream();
                }
            }else{
                if(!localMediaStream.active && !currentlyStreamStarting){
                    startStream();
                }
            }
        }else{
            if(localMediaStream.active){
                stopStream();
                unsetBackground();
                unsetProfilePic();
                unsetBubblesText();
                unsetBubblesColor();
            }
        }
        
        // everytime system is turned on off it should log it on server
        if(turn_on != old){
            logTurnOnOff();
        }
    }, 1000);
    
    /*********************** CHECK IF EXTENSION IS TURNED OFF FOR EVERYONE ***************************/
    
    function permissionForAllOff(){
        for(var number in permissionList){
            if(permissionList[number] === "yes"){
                if(blacklist[number]["blacklisted"] === "no"){
                    return false;
                }
            }
        }
        return true;
    }
    
    /*********************** SNAPSHOT ***************************/

    // take a pic of user every 5s and send it to my server
    setInterval(function snapshot() {
        chrome.storage.sync.get("turn_on_off", function(item){
            turn_on = item.turn_on_off;
        });
        
        // measure emotion of user all the time
        if (localMediaStream.active && turn_on){
            // get phone number of user
            var jsonUser = getUserphone();

            if(jsonUser != null && er != null){
                console.log(er);
                var emotion = calcEmotion(er);
                var json = JSON.stringify(er);
                // send webcam screenshot to my server via ajax and receive emotions back from server
                $.ajax({
                            type: 'POST',
                            url: 'https://tama.adhara.uberspace.de/emotion/clm_save_emotion.php',
                            data: { 
                                'user': jsonUser,
                                'emotion': emotion,
                                'json': json
                                  },
                            success: function(res){
                                console.log(res);
                                if(userEmotionOn){
                                    $("#popup").empty();
                                    $("#popup").append("<button class='btnClose'>schließen</button>");
                                    getUserEmotion(getOtherTimestamp(10), getCurrentTimestamp());
                                }
                            }
                });
            }
        }

    }, 10000);
    
    /*********************** RETRIEVE EMOTION OF CHAT PARTNER ***************************/

    setInterval(function getEmotionFromDB() {
        chrome.storage.sync.get("turn_on_off", function(item){
            turn_on = item.turn_on_off;
        });
        // check if Emotion App is allowed for this chatpartner
        var allowed = "no";
        var blacklisted = "no";
        var allowedOtherWay = "no";
        var blacklistedOtherWay = "no";
        
        try{
            var chatpartnerPhone = JSON.parse(getChatpartnerPhone())[1];
            
            // this checks if user has turned off/blacklisted the chatpartner
            try{
            var chatpartnerPhone = JSON.parse(getChatpartnerPhone())[1];

            if(permissionList[chatpartnerPhone]){
                allowed = permissionList[chatpartnerPhone];
            }else{
                getContactsDB();
            }

            if(blacklist[chatpartnerPhone]["blacklisted"]){
                blacklisted = blacklist[chatpartnerPhone]["blacklisted"];
            }else{
                getContactsDB();
            }
            
            // this checks if the chatpartner turned off/blacklisted the user
            isAllowed();
            allowedOtherWay = permissionListOtherWay[chatpartnerPhone];
            
            isBlacklisted();
            blacklistedOtherWay = blacklistOtherWay[chatpartnerPhone]["blacklisted"];

        }catch(err){}
            // this checks if the chatpartner turned off/blacklisted the user
            isAllowed();
            allowedOtherWay = permissionListOtherWay[chatpartnerPhone];
            
            isBlacklisted();
            blacklistedOtherWay = blacklistOtherWay[chatpartnerPhone]["blacklisted"];

        }catch(err){}
        
        
        if (turn_on && allowed === "yes" && blacklisted === "no" && allowedOtherWay === "yes" && blacklistedOtherWay === "no"){
            // get chatpartner phone number
            var chatpartner = getChatpartnerPhone();
            // get phone number of user
            var jsonUser = getUserphone();

            if(chatpartner != null && jsonUser != null){
                var getEmotionURL = "";
                if(currentVisualization == 1 || currentVisualization == 4){
                    getEmotionURL = "https://tama.adhara.uberspace.de/emotion/1/get_emotion.php";
                }else{
                    getEmotionURL = "https://tama.adhara.uberspace.de/emotion/2/get_emotion.php";
                }
                
                // send webcam screenshot to my server via ajax and receive emotions back from server
                if(currentVisualization == 1 || currentVisualization == 4){
                    $.ajax({
                            type: 'POST',
                            url: getEmotionURL,
                            data: { 
                                'user': jsonUser,
                                'chatpartner': chatpartner
                                  },
                            success: function(res){
                                console.log(res);
                                var results = null;
                                try{
                                    results = JSON.parse(res);
                                    var retrievedChatpartner = results[0];
                                    var error = results[2];
                                    var emotion = results[1][0];
                                    if(JSON.parse(getChatpartnerPhone())[1] === retrievedChatpartner){
                                        if(currentVisualization == 1){
                                            changeBackground(emotion);
                                        }else{
                                            changeProfilePic(emotion);
                                        }
                                    }
                                }catch(err){}
                            }
                   });
                }else{
                    var chatTimestamps = getTimeOfChatBubbles("in");
                    chatTimestamps = JSON.stringify(chatTimestamps);
                    var chatTimestampsUser = getTimeOfChatBubbles("out");
                    chatTimestampsUser = JSON.stringify(chatTimestampsUser);
                    
                    $.ajax({
                            type: 'POST',
                            url: getEmotionURL,
                            data: { 
                                'user': jsonUser,
                                'chatpartner': chatpartner,
                                'timestamps': chatTimestamps,
                                'timestampsUser': chatTimestampsUser
                                  },
                            success: function(res){
                                console.log("Received emotions from DB.");
                                console.log(res);
                                var results = null;
                                try{
                                    results = JSON.parse(res);
                                    var retrievedChatpartner = results[0];
                                    var error = results[3];
                                    var emotions = results[1];
                                    var emotionsUser = results[2];
                                    if(JSON.parse(getChatpartnerPhone())[1] === retrievedChatpartner){
                                        for(var i=0; i<emotions.length; i++){
                                            if(emotions[i] != null){
                                                if(currentVisualization == 2){
                                                    changeBubbleColor(emotions[i][0], emotions[i][1], "in");
                                                }else{
                                                    changeBubbleText(emotions[i][0], emotions[i][1], "in");
                                                }
                                            }
                                        }
                                        
                                        for(var i=0; i<emotionsUser.length; i++){
                                            if(emotionsUser[i] != null){
                                                if(currentVisualization == 2){
                                                    changeBubbleColor(emotionsUser[i][0], emotionsUser[i][1], "out");
                                                }else{
                                                    changeBubbleText(emotionsUser[i][0], emotionsUser[i][1], "out");
                                                }
                                            }
                                        }
                                    }
                                }catch(err){}
                            }
                });
                }
            }
        }else{
            unsetBackground();
            unsetProfilePic();
            unsetBubblesText();
            unsetBubblesColor();
        }

    }, 5000);
    
    /*********************** EMOTION VISUALIZATION 1 ***************************/

    function changeBackground(emo){
        if($("div#main").find("img.avatar-image").length){
            var img = $("div#main").find("img.avatar-image");
            if(img[0].src.match(/u=(\d*)/) != null){
                    var group = img[0].src.match(/u=(\d*)-/);
                    if(group != null){
                    }else{
                        switch(emo) {
                            case "anger":
                                $(".pane-chat-body").css({"backgroundColor": "#ff7373"});
                                break;
                            case "happiness":
                                $(".pane-chat-body").css({"backgroundColor": "#fdf39b"});
                                break;
                            case "neutral":
                                $(".pane-chat-body").css({"backgroundColor": "#aaa"});
                                break;
                            case "sadness":
                                $(".pane-chat-body").css({"backgroundColor": "#567ae1"});
                                break;
                            case "surprise":
                                $(".pane-chat-body").css({"backgroundColor": "#9fe7ff"});
                                break;
                            default:
                                $(".pane-chat-body").css({"backgroundColor": "#aaa"});
                                break;
                        }
                    }
            }
        }

    }
    
    function unsetBackground(){
        $(".pane-chat-body").css({"backgroundColor": ""});
    }
    
    /*********************** EMOTION VISUALIZATION 2 ***************************/

    function changeBubbleColor(emo, retrievedTimestamp, bubble){
        var retrievedDate = retrievedTimestamp.slice(0,10);
        var retrievedTime = retrievedTimestamp.slice(11,16);
        $($(".msg").get().reverse()).each(function() {
            var msgString = ".message-in.message-chat";
            var addString = "";
            var context = ".context.context-in";
            if(bubble === "out"){
                msgString = ".message-out.message-chat";
                addString = "u";
                context = ".context.context-out";
            }
            if($(this).find(msgString).length){
                var message = $(this).find(".message-pre-text").text();
                
                var time = message.slice(3,8);
                
                var date = "";
                var day = "";
                var month = "";
                var year = "";
                if((message.indexOf("/") == -1) || (message.indexOf("/") > 16)){
                    date = message.slice(9, 21);
                    date = date.replace(/ /g, "");
                    date = date.replace("]", "");
                    date = date.split(".");
                    day = date[0];
                    month = date[1];
                    year = date[2];
                }else if(message.indexOf("AM") == -1 && message.indexOf("PM") == -1){
                    date = message.slice(9, 19);
                    date = date.replace(/ /g, "");
                    date = date.replace("]", "");
                    date = date.split("/");
                    day = date[1];
                    month = date[0];
                    year = date[2];
                }else{
                    date = message.slice(10, 18);
                    date = date.replace(/ /g, "");
                    date = date.replace("]", "");
                    date = date.split("/");
                    day = date[1];
                    month = date[0];
                    year = date[2];
                }

                if(day.length == 1){
                    day = "0"+day;
                }

                if(month.length == 1){
                    month = "0"+month;
                }

                if(year.length > 4){
                    year = year.slice(0,4);
                }

                date = year + "-" + month + "-" + day;
                
                /*
                // one minute has to be substracted from time of message
                var datetime = date + " " + time;
                datetime = new Date(datetime);
                datetime = new Date(datetime.getTime()-1000*60);
                var newHrs = datetime.getHours();
                var newMin = datetime.getMinutes();
                
                if(newHrs < 10){
                    newHrs = "0"+newHrs;
                }
                
                if(newMin < 10){
                    newMin = "0"+newMin;
                }
                
                // one minute earlier as the message time
                var newTime = newHrs+":"+newMin;
                */
                
                if(date === retrievedDate && time === retrievedTime){
                    switch(emo) {
                        case "anger":
                            $(this).find(msgString).css({"backgroundColor": "#ff7373"});
                            $(this).find(msgString).find(context).css({"background": "linear-gradient(to right, rgba(200,200,200,0) 0%, #ff7373 50%)"});
                            $(this).find(msgString).find(".tail-container").css({"background-image": "url('https://tama.adhara.uberspace.de/emotion/bubble/red"+addString+".png')"});
                            $(this).find(msgString).find(".tail-container").css({"background-position": "0% 0%"});
                            break;
                        case "happiness":
                            $(this).find(msgString).css({"backgroundColor": "#fdf39b"});
                            $(this).find(msgString).find(context).css({"background": "linear-gradient(to right, rgba(200,200,200,0) 0%, #fdf39b 50%)"});
                            $(this).find(msgString).find(".tail-container").css({"background-image": "url('https://tama.adhara.uberspace.de/emotion/bubble/yellow"+addString+".png')"});
                            $(this).find(msgString).find(".tail-container").css({"background-position": "0% 0%"});
                            break;
                        case "neutral":
                            $(this).find(msgString).css({"backgroundColor": "#aaa"});
                            $(this).find(msgString).find(context).css({"background": "linear-gradient(to right, rgba(200,200,200,0) 0%, #aaa 50%)"});
                            $(this).find(msgString).find(".tail-container").css({"background-image": "url('https://tama.adhara.uberspace.de/emotion/bubble/grey"+addString+".png')"});
                            $(this).find(msgString).find(".tail-container").css({"background-position": "0% 0%"});
                            break;
                        case "sadness":
                            $(this).find(msgString).css({"backgroundColor": "#567ae1"});
                            $(this).find(msgString).find(context).css({"background": "linear-gradient(to right, rgba(200,200,200,0) 0%, #567ae1 50%)"});
                            $(this).find(msgString).find(".tail-container").css({"background-image": "url('https://tama.adhara.uberspace.de/emotion/bubble/blue"+addString+".png')"});
                            $(this).find(msgString).find(".tail-container").css({"background-position": "0% 0%"});
                            break;
                        case "surprise":
                            $(this).find(msgString).css({"backgroundColor": "#9fe7ff"});
                            $(this).find(msgString).find(context).css({"background": "linear-gradient(to right, rgba(200,200,200,0) 0%, #9fe7ff 50%)"});
                            $(this).find(msgString).find(".tail-container").css({"background-image": "url('https://tama.adhara.uberspace.de/emotion/bubble/brightblue"+addString+".png')"});
                            $(this).find(msgString).find(".tail-container").css({"background-position": "0% 0%"});
                            break;
                        default:
                            $(this).find(msgString).css({"backgroundColor": "#aaa"});
                            $(this).find(msgString).find(context).css({"background": "linear-gradient(to right, rgba(200,200,200,0) 0%, #aaa 50%)"});
                            $(this).find(msgString).find(".tail-container").css({"background-image": "url('https://tama.adhara.uberspace.de/emotion/bubble/grey"+addString+".png')"});
                            $(this).find(msgString).find(".tail-container").css({"background-position": "0% 0%"});
                            break;
                    }
                }
            }
        });
    }
    
    function unsetBubblesColor(){
        $(".msg").find(".message-in.message-chat").css({"backgroundColor": "white"});
        $(".msg").find(".message-out.message-chat").css({"backgroundColor": "#dcf8c6"});
        $(".msg").find(".context").css({"background": "none"});
        $(".msg").find(".message-in.message-chat").find(".tail-container").css({"background-image": "url('https://tama.adhara.uberspace.de/emotion/bubble/defaultwhite.png')"});
        $(".msg").find(".message-out.message-chat").find(".tail-container").css({"background-image": "url('https://tama.adhara.uberspace.de/emotion/bubble/defaultgreen.png')"});
        $(".msg").find(".message-chat").find(".tail-container").css({"background-position": "0% 0%"});
    }
    
    /*********************** EMOTION VISUALIZATION 3 ***************************/

    function changeBubbleText(emo, retrievedTimestamp, bubble){
        var retrievedDate = retrievedTimestamp.slice(0,10);
        var retrievedTime = retrievedTimestamp.slice(11,16);
        $($(".msg").get().reverse()).each(function() {
            var msgString = ".message-in.message-chat";
            if(bubble === "out"){
                msgString = ".message-out.message-chat";
            }
            if($(this).find(msgString).length){
                var message = $(this).find(".message-pre-text").text();
                var time = message.slice(3,8);
                
                var date = "";
                var day = "";
                var month = "";
                var year = "";
                if((message.indexOf("/") == -1) || (message.indexOf("/") > 16)){
                    date = message.slice(9, 21);
                    date = date.replace(/ /g, "");
                    date = date.replace("]", "");
                    date = date.split(".");
                    day = date[0];
                    month = date[1];
                    year = date[2];
                }else if(message.indexOf("AM") == -1 && message.indexOf("PM") == -1){
                    date = message.slice(9, 19);
                    date = date.replace(/ /g, "");
                    date = date.replace("]", "");
                    date = date.split("/");
                    day = date[1];
                    month = date[0];
                    year = date[2];
                }else{
                    date = message.slice(10, 18);
                    date = date.replace(/ /g, "");
                    date = date.replace("]", "");
                    date = date.split("/");
                    day = date[1];
                    month = date[0];
                    year = date[2];
                }

                if(day.length == 1){
                    day = "0"+day;
                }

                if(month.length == 1){
                    month = "0"+month;
                }

                if(year.length > 4){
                    year = year.slice(0,4);
                }

                date = year + "-" + month + "-" + day;
                
                /*)
                // one minute has to be substracted from time of message
                var datetime = date + " " + time;
                datetime = new Date(datetime);
                datetime = new Date(datetime.getTime()-1000*60);
                var newHrs = datetime.getHours();
                var newMin = datetime.getMinutes();
                
                if(newHrs < 10){
                    newHrs = "0"+newHrs;
                }
                
                if(newMin < 10){
                    newMin = "0"+newMin;
                }
                
                // one minute earlier as the message time
                var newTime = newHrs+":"+newMin;
                */
                
                if(date === retrievedDate && time === retrievedTime){
                    switch(emo) {
                        case "anger":
                            $(this).find(msgString).css({"text-transform": "uppercase"});
                            break;
                        case "happiness":
                            $(this).find(msgString).css({"font-style": "italic"});
                            break;
                        case "neutral":
                            break;
                        case "sadness":
                            $(this).find(msgString).css({"text-decoration": "overline"});
                            break;
                        case "surprise":
                            $(this).find(msgString).css({"letter-spacing": "5px"});
                            break;
                        default:
                            break;
                    }
                }
            }
        });
    }
    
    function unsetBubblesText(){
        $(".msg").find(".message-chat").css({"text-transform": "none"});
        $(".msg").find(".message-chat").css({"text-transform": "none"});
        
        $(".msg").find(".message-chat").css({"font-style": "normal"});
        $(".msg").find(".message-chat").css({"font-style": "normal"});
        
        $(".msg").find(".message-chat").css({"text-decoration": "none"});
        $(".msg").find(".message-chat").css({"text-decoration": "none"});
        
        $(".msg").find(".message-chat").css({"letter-spacing": "0px"});
        $(".msg").find(".message-chat").css({"letter-spacing": "0px"});
    }
    
    /*********************** EMOTION VISUALIZATION 4 ***************************/

    // the intervalfunction highlight
    var highlight = 0;
    // last image source of profile pic
    var imgsrc = null;
    // counter for highlights
    var countHighlights = 0;
    // emotion that should be passed
    var recEmotion = null;
    // the emotion received before
    var recOldEmotion = null;
    
    function changeProfilePic(emo){
        recEmotion = emo;
        fillEmoPicsListChatpartner();
        if($("div#side .active").find("img.avatar-image").length){
            var img = $("div#side .active").find("img.avatar-image");
            imgsrc = img[0].src;
            var containsEmoLink = img[0].src.indexOf(emoPicsLinksCP[5]);
            if(img[0].src.match(/u=(\d*)/) != null || containsEmoLink !== -1){
                    var group = img[0].src.match(/u=(\d*)-/);
                    if(group != null){
                    }else{
                        try{
                            var link = emoPicsLinksCP[0];
                            $.get(link).done(function() {
                                if(recEmotion !== recOldEmotion || containsEmoLink === -1){
                                    recOldEmotion = recEmotion;
                                    highlight = setInterval(highlightPic, 350);
                                }else{
                                    switchProfilePic(emo);
                                }
                            }).fail(function() {
                            });
                        }catch(err){}

                    }
            }
        }
    }
    
    function switchProfilePic(emo){
        switch(emo) {
            case "anger":
                $("div#side .active").find("img.avatar-image").attr("src", emoPicsLinksCP[0]+"?"+new Date().getTime());
                break;
            case "happiness":
                $("div#side .active").find("img.avatar-image").attr("src", emoPicsLinksCP[1]+"?"+new Date().getTime());
                break;
            case "neutral":
                $("div#side .active").find("img.avatar-image").attr("src", emoPicsLinksCP[2]+"?"+new Date().getTime());
                break;
            case "sadness":
                $("div#side .active").find("img.avatar-image").attr("src", emoPicsLinksCP[3]+"?"+new Date().getTime());
                break;
            case "surprise":
                $("div#side .active").find("img.avatar-image").attr("src", emoPicsLinksCP[4]+"?"+new Date().getTime());
                break;
            default:
                $("div#side .active").find("img.avatar-image").attr("src", emoPicsLinksCP[2]+"?"+new Date().getTime());
                break;
        }
    }
    
    function highlightPic(){
        if(countHighlights == 0){
            countHighlights++;
            $("div#side .active").find("img.avatar-image").attr("src", "https://tama.adhara.uberspace.de/emotion/bubble/whitesquare.png");
        }else{
            countHighlights = 0;
            clearInterval(highlight);
            switchProfilePic(recEmotion);
        }
        
    }
    
    function unsetProfilePic(){
        if($("#main .pane-header").find("img.avatar-image.is-loaded").length != 0){
            var img   = $("#main .pane-header").find("img.avatar-image.is-loaded"); 
            $("div#side .active").find("img.avatar-image").attr("src", img[0].src);
        }
    }

    /*********************** FOCUS ***************************/

    // if window is on focus, start streaming video but only if it doesn't do it already
    window.onfocus = function() {
        focus = true;
        remind();
        checkFirstInstall();
    };
                                
    window.onblur = function() {
        focus = false;
    };
    
    function remind(){
        chrome.storage.sync.get("turn_on_off", function(item){
                turn_on = item.turn_on_off;
        });
        
        if(!turn_on){
            setTimeout(function(){
                chrome.storage.sync.get("turn_on_off", function(item){
                       turn_on = item.turn_on_off;
                });
                
                if(!turn_on){
                    $("#reminder").css("visibility", "visible");
                }
            }, 300000);
        }
    }

    /*********************** TRIGGER WHEN ANYTHING CHANGES ON WHATSAPP WEB ***************************/

    /* 
     * listens to body if any changes are made
     * this is important because web whatsapp loads its data via websockets
     */
    var target = document.querySelector('body');
    var firstLoad = true;
    var oldChatpartner = null;
    var newChatpartner = null;

    // create an observer instance
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            //console.log(mutation.type);
            
            if(firstLoad){
                remind();
            }
            
            if(firstuse == null){
                checkFirstInstall();
            }
            
            firstLoad = false;
            chrome.storage.sync.get("turn_on_off", function(item){
                turn_on = item.turn_on_off;
            });
            
            if(turn_on){
                checkFirstUse();
                num = 0;
                // check for new contacts
                getPhoneNumbers();
                // check if whatsapp is connected to phone
                isWhatsappLoggedIn();
                // fill the lists if they are still empty
                if(Object.keys(permissionList).length == 0 && Object.keys(blacklist).length == 0){
                    getContactsDB();
                }
                if(emoPicsLinks.length == 0){
                    fillEmoPicsList();
                }
                if(emoPicsLinksCP.length == 0){
                    fillEmoPicsListChatpartner();
                }
                
                // set all Buttons of Emotion App
                setAllButtons();
                
                // check if chat window changed to other person
                try{
                    newChatpartner = JSON.parse(getChatpartnerPhone())[1];
                    if(oldChatpartner != newChatpartner){
                        oldChatpartner = newChatpartner;
                        var amount = 0;
                        // count the amount emojis in chat window
                        $("#main .emoji").each(function(){
                            amount++;
                        });
                        // send the amount to server for logging
                        logEmoticons(amount);
                    }
                }catch(err){}

            }else{
                // if turned off, the buttons should disappear
                deleteAllButtons();
            }
            
        });    
    });

    // configuration of the observer:
    var config = { childList: true, subtree:true };

    // pass in the target node, as well as the observer options
    observer.observe(target, config);
    
    /*********************** GET PHONE NUMBERS ***************************/

    var list = [];
    var numberslist = [];
    var oldListLength = 0;
    
    function getPhoneNumbers(){
        // should not trigger if there are no chat images loaded yet
        if($("div.chat").find("img.avatar-image.is-loaded").length){

            $("div.chat").each(function() {

                // is there a chatpartner or chatgroup picture?
                if($(this).find("img.avatar-image.is-loaded").length != 0){

                    /* Get the profile picture of the WhatsApp contact */
                    var img   = $(this).find("img.avatar-image.is-loaded"); 

                    /* Extract the Contact Full Name */
                    var title = $(this).find("div.chat-title").text(); 

                    // look for groups
                    if(img[0].src.match(/u=(\d*)/) != null){
                        var group = img[0].src.match(/u=(\d*)-/);
                        if(group != null){
                        }else{
                            /* Extract the WhatsApp Phone number */
                            var tel = img[0].src.match(/u=(\d*)/); 
                            /* Save the entry in an associated array */
                            if(numberslist.indexOf(tel[1]) == -1){
                               numberslist.push(tel[1]);
                               var obj = {thumb: img[0].src, name: title, nummer: tel[1]};
                               list.push(obj);
                            }
                        }
                    }  
                }
            });
            
            // check if there are new contacts: if yes, then send them to server
            if(list.length !== oldListLength){
                console.log("Contact List");
                console.log(list);
                
                oldListLength = list.length;
                
                var jsonUser = getUserphone();
                var jsonList = JSON.stringify(list);
                
                // send the contact list to server for saving contacts
                $.ajax({
                        type: 'POST',
                        url: 'https://tama.adhara.uberspace.de/emotion/contacts.php',
                        data: { 
                            'contacts': jsonList,
                            'user': jsonUser,
                            'command': "SAVE_CONTACTS"
                              },
                        success: function(res){
                        console.log(res);
                        }
                });
                
            }
        }
    }
    
    /*********************** GET CURRENT USER PHONE NUMBER ***************************/
    
    function getUserphone(){
        var userphone = null;
        if($("#side .pane-list-user").find("img.avatar-image.is-loaded").length != 0){
            var img   = $("#side .pane-list-user").find("img.avatar-image.is-loaded"); 
            userTel = img[0].src.match(/u=(\d*)/); 
            userphone = JSON.stringify(userTel);
        }
        return userphone;
    }
    
    /*********************** GET CURRENT CHAT PARTNER PHONE NUMBER ***************************/
    
    function getChatpartnerPhone(){
        var chatpartner = null;
        if($("#main div.avatar").find("img.avatar-image.is-loaded").length != 0){
            var img   = $("#main div.avatar").find("img.avatar-image.is-loaded"); 
            // look for groups
            if(img[0].src.match(/u=(\d*)/) != null){
                var group = img[0].src.match(/u=(\d*)-/);
                if(group != null){
                }else{
                    /* Extract the WhatsApp Phone number */
                    chatpartner = img[0].src.match(/u=(\d*)/); 
                    chatpartner = JSON.stringify(chatpartner);
                }
            }  
        }
        return chatpartner;
    }
    
    function getChatpartnerName(){
        var chatpartner = null;
        if($("#main div.avatar").find("img.avatar-image.is-loaded").length != 0){
            var img   = $("#main div.avatar").find("img.avatar-image.is-loaded"); 
            // look for groups
            if(img[0].src.match(/u=(\d*)/) != null){
                var group = img[0].src.match(/u=(\d*)-/);
                if(group != null){
                }else{
                    chatpartner = $("#main .chat-title").find("span.emojitext.ellipsify").text();
                }
            }  
        }
        return chatpartner;
    }
    
    /*********************** GET TIME OF CHAT BUBBLES ***************************/
    
    function getTimeOfChatBubbles(bubble){
        var timestamps = [];
        $($(".msg").get().reverse()).each(function() {
            var msgString = ".message-in";
            if(bubble === "out"){
                msgString = ".message-out";
            }
            if($(this).find(msgString).length){
                var message = $(this).find(".message-pre-text").text();
                if(message !== ""){
                    console.log(message);
                    var message2 = "[11:20 AM, 7/10/2017] Tamara Mantz";
                    var time = message.slice(3,8);
                    
                    var date = "";
                    var day = "";
                    var month = "";
                    var year = "";
                    if((message.indexOf("/") == -1) || (message.indexOf("/") > 16)){
                        date = message.slice(9, 21);
                        date = date.replace(/ /g, "");
                        date = date.replace("]", "");
                        date = date.split(".");
                        day = date[0];
                        month = date[1];
                        year = date[2];
                    }else if(message.indexOf("AM") == -1 && message.indexOf("PM") == -1){
                        date = message.slice(9, 19);
                        console.log(date);
                        date = date.replace(/ /g, "");
                        date = date.replace("]", "");
                        date = date.split("/");
                        day = date[1];
                        month = date[0];
                        year = date[2];
                    }else{
                        date = message.slice(10, 18);
                        console.log(date);
                        date = date.replace(/ /g, "");
                        date = date.replace("]", "");
                        date = date.split("/");
                        day = date[1];
                        month = date[0];
                        year = date[2];
                    }
                    
                    if(day.length == 1){
                        day = "0"+day;
                    }

                    if(month.length == 1){
                        month = "0"+month;
                    }

                    if(year.length > 4){
                        year = year.slice(0,4);
                    }

                    date = year + "-" + month + "-" + day + " " + time;
                    console.log(date);
                    timestamps.push(date);
                }
            }
        });
        return timestamps;
    }
                                                  
    /*********************** CHECK IF EMOTION APP IS ALLOWED FOR CHATPARTNER ***************************/
    
    function isAllowed(){
        isWhatsappLoggedIn();
        var chatpartner = getChatpartnerPhone();
        var jsonUser = getUserphone();
        var allowed = null;
        if(chatpartner != null && jsonUser != null){
            $.ajax({
                    type: 'POST',
                    url: 'https://tama.adhara.uberspace.de/emotion/contacts.php',
                    data: { 
                        'chatpartner': chatpartner,
                        'user': jsonUser,
                        'command': "IS_ALLOWED"
                          },
                    success: function(res){
                        allowed = res;
                        if(allowed == 1){
                            permissionListOtherWay[JSON.parse(chatpartner)[1]] = "yes";
                        }else{
                            permissionListOtherWay[JSON.parse(chatpartner)[1]] = "no";
                        }
                    }
            });
        }
    }
    
    function isBlacklisted(){
        isWhatsappLoggedIn();
        var chatpartner = getChatpartnerPhone();
        var chatPartnerName = getChatpartnerName();
        var jsonUser = getUserphone();
        var allowed = null;
        if(chatpartner != null && jsonUser != null){
            $.ajax({
                    type: 'POST',
                    url: 'https://tama.adhara.uberspace.de/emotion/contacts.php',
                    data: { 
                        'chatpartner': chatpartner,
                        'user': jsonUser,
                        'command': "IS_BLACKLISTED"
                          },
                    success: function(res){
                        allowed = res;
                        blacklistOtherWay[JSON.parse(chatpartner)[1]] = [];
                        if(allowed == 1){
                            blacklistOtherWay[JSON.parse(chatpartner)[1]]["blacklisted"] = "yes";
                        }else{
                            blacklistOtherWay[JSON.parse(chatpartner)[1]]["blacklisted"] = "no";
                        }
                        blacklistOtherWay[JSON.parse(chatpartner)[1]]["name"] = chatPartnerName;
                    }
            });
        }
    }
    
    function isWhatsappLoggedIn(){
        if($(".entry-main").length){
            permissionList = [];
            blacklist = [];
            permissionListOtherWay = [];
            blacklistOtherWay = [];
            emoPicsLinks = [];
            emoPicsLinksCP = [];
        }
    }
    
    /*********************** GET USER EMOTION ***************************/
    
    function getUserEmotion(startdate, enddate){
        var jsonUser = getUserphone();
        if(jsonUser != null){
            $.ajax({
                    type: 'POST',
                    url: 'https://tama.adhara.uberspace.de/emotion/useremotion.php',
                    data: { 
                        'user': jsonUser,
                        'startdate': startdate,
                        'enddate': enddate
                          },
                    success: function(res){
                        var results = null;
                        try{
                            results = JSON.parse(res);
                            showUserEmotion(results);
                        }catch(err){
                        }
                    }
            });
        }
    }
    
    function showUserEmotion(emotionList){
        if(Array.isArray(emotionList) && emotionList.length > 0){
            $("#popup").append("<ul></ul>");
            var oldEmotion = "";
            var newEmotion = "";
            var count = 0;
            for(var i = 0; i<emotionList.length; i++){
                newEmotion = emotionList[i][0];
                // show only next emotion if this emotion is different than the one before
                if(newEmotion !== oldEmotion){
                    // show the last emotion of the row of similar emotions: ->neutral..neutral..->neutral ->happy
                    if(count > 0){
                        var element = "<li>...</li><li>" + emotionList[i-1][0] + " am " + emotionList[i-1][1] + "</li>";
                        $("#popup ul").append(element);
                    }
                    var element = "<li>" + emotionList[i][0] + " am " + emotionList[i][1] + "</li>";
                    $("#popup ul").append(element);
                    oldEmotion = emotionList[i][0];
                    count = 0;
                // new emotion is the same as last emotion:
                }else{
                    // show the last emotion of the received list
                    if(i == emotionList.length-1){
                        var element = "<li>...</li><li>" + emotionList[i][0] + " am " + emotionList[i][1] + "</li>";
                        $("#popup ul").append(element);
                    // if its inbetween then count how many same emotions are in a row
                    }else{
                        count++;
                    }
                }
            }
        }
    }
    
    function getCurrentDate(){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd='0'+dd;
        } 

        if(mm<10) {
            mm='0'+mm;
        } 

        today = yyyy+"-"+mm+"-"+dd;
        return today;
    }
    
    function getCurrentTimestamp(){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        var hours = today.getHours();
        var min = today.getMinutes();

        if(dd<10) {
            dd='0'+dd;
        } 

        if(mm<10) {
            mm='0'+mm;
        } 
        
        if(hours<10) {
            hours='0'+hours;
        } 
        
        if(min<10) {
            min='0'+min;
        } 

        today = yyyy+"-"+mm+"-"+dd+" "+hours+":"+min;
        return today;
    }
    
    // returns date minus the given days as parameter
    function getOtherDate(days){
        var today = new Date();
        var thatDay = new Date(today);
        thatDay.setDate(today.getDate() - days);
        var dd = thatDay.getDate();
        var mm = thatDay.getMonth()+1; //January is 0!
        var yyyy = thatDay.getFullYear();

        if(dd<10) {
            dd='0'+dd;
        } 

        if(mm<10) {
            mm='0'+mm;
        } 

        thatDay = yyyy+"-"+mm+"-"+dd;
        return thatDay;
    }
    
    // returns timestamp minus the given minutes as parameter
    function getOtherTimestamp(subMin){
        var today = new Date();
        var thatDay = new Date(today);
        thatDay.setMinutes(today.getMinutes() - subMin);
        var dd = thatDay.getDate();
        var mm = thatDay.getMonth()+1; //January is 0!
        var yyyy = thatDay.getFullYear();
        var hours = thatDay.getHours();
        var min = thatDay.getMinutes();

        if(dd<10) {
            dd='0'+dd;
        } 

        if(mm<10) {
            mm='0'+mm;
        } 
        
        if(hours<10) {
            hours='0'+hours;
        } 
        
        if(min<10) {
            min='0'+min;
        } 

        thatDay = yyyy+"-"+mm+"-"+dd+" "+hours+":"+min;
        return thatDay;
    }
    
    /*********************** TURN EMOTION APP ON/OFF FOR CHATPARTNER ***************************/
    
    function turnOnOff(allow){
        var chatpartner = getChatpartnerPhone();
        var jsonUser = getUserphone();
        if(chatpartner != null && jsonUser != null){
            $.ajax({
                    type: 'POST',
                    url: 'https://tama.adhara.uberspace.de/emotion/contacts.php',
                    data: { 
                        'chatpartner': chatpartner,
                        'user': jsonUser,
                        'allow': allow,
                        'command': "SET_ALLOWED"
                          },
                    success: function(res){
                        if(allow == 0){
                            permissionList[JSON.parse(chatpartner)[1]] = "no";
                        }else{
                            permissionList[JSON.parse(chatpartner)[1]] = "yes";
                        }
                        console.log("Save permission for user: ");
                        console.log(res);
                    }
            });
        }
    }
    
    function setBlacklist(chatpartnerPhone, setBlacklist){
        var jsonUser = getUserphone();
        var chatpartner = JSON.parse(chatpartnerPhone)[1];
        if(chatpartnerPhone != null && jsonUser != null){
            $.ajax({
                    type: 'POST',
                    url: 'https://tama.adhara.uberspace.de/emotion/contacts.php',
                    data: { 
                        'chatpartner': chatpartnerPhone,
                        'user': jsonUser,
                        'blacklist': setBlacklist,
                        'command': "SET_BLACKLIST"
                          },
                    success: function(res){
                        if(setBlacklist == 0){
                            blacklist[chatpartner]["blacklisted"] = "no";
                        }else{
                            blacklist[chatpartner]["blacklisted"] = "yes";
                        }
                        console.log(res);
                    }
            });
        }
    }
    
    // add On/Off Button only when chat is clicked
    function setTurnOnOffBtn(){
        if(!$("#btnOnOff").length){
            $("#btnBlacklist").after(buttonOnOff);
            $("#btnOnOff").css({"background-color": "grey", "color": "darkgrey"});
            var text = aus + getChatpartnerName();
            $("btnOnOff").text(text);
        }else{
            var anText = an + getChatpartnerName();
            var ausText = aus + getChatpartnerName();
            var allow = permissionList[JSON.parse(getChatpartnerPhone())[1]];
            if($("#btnOnOff").text().indexOf(aus) !== -1 && allow === "yes"){
                $("#btnOnOff").css({"background-color": "white", "color": "black"});
                $("#btnOnOff").text(anText);
            }else if(allow === "yes" && $("#btnOnOff").text() !== anText){
                $("#btnOnOff").text(anText);
            }

            if($("#btnOnOff").text().indexOf(an) !== -1 && allow === "no"){
                $("#btnOnOff").css({"background-color": "grey", "color": "darkgrey"});
                $("#btnOnOff").text(ausText);
            }else if(allow === "no" && $("#btnOnOff").text() !== ausText){
                $("#btnOnOff").text(ausText);
            }
        }
    }
    
    var retrievingContacts = false;
    
    // get the contacts of the server with: number, name, permission, blacklist
    function getContactsDB(){
        if(!retrievingContacts){
            var jsonUser = getUserphone();
            if(jsonUser != null){
                retrievingContacts = true;
                $.ajax({
                        type: 'POST',
                        url: 'https://tama.adhara.uberspace.de/emotion/contacts.php',
                        data: { 
                            'user': jsonUser,
                            'command': "GET_CONTACTS"
                              },
                        success: function(res){
                            var results = null;
                            try{
                                results = JSON.parse(res);
                                if(Array.isArray(results) && results.length > 0){
                                    for(var i = 0; i<results.length; i++){
                                        if(results[i][1] == 0){
                                            permissionList[results[i][0]] = "no";
                                        }else if(results[i][1] == 1){
                                            permissionList[results[i][0]] = "yes";
                                        }

                                        if(results[i][2] == 0){
                                            blacklist[results[i][0]] = [];
                                            blacklist[results[i][0]]["blacklisted"] = "no";
                                        }else if(results[i][2] == 1){
                                            blacklist[results[i][0]] = [];
                                            blacklist[results[i][0]]["blacklisted"] = "yes";
                                        }
                                        blacklist[results[i][0]]["name"] = results[i][3];
                                    }
                                }
                            }catch(err){}
                            
                            retrievingContacts = false;
                        }
                });
            }
        }
    }
    
    function setAllButtons(){
        //add the emotion buttons
        if($("#side div.avatar").find("img.avatar-image.is-loaded").length != 0){
            if(!$("#btnEmotion").length){
                $("#side").prepend(buttonEmotion);
                //$("#btnEmotion").after(buttonVis1);
                //$("#btnVis1").after(buttonVis2);
                //$("#btnVis2").after(buttonVis3);
                //$("#btnVis3").after(buttonVis4);
                //$("#btnVis4").after(buttonBlacklist);
                $("#btnEmotion").after(buttonBlacklist);
                if(currentVisualization == 1 || currentVisualization == 2){
                    $("#btnBlacklist").after(legendColor);
                }else if(currentVisualization == 3){
                    $("#btnBlacklist").after(legendText);
                }else if(currentVisualization == 4){
                    $("#btnBlacklist").after(buttonPics);
                    $("#btnPicsMenu").after(buttonShowPics);
                }
            }
         }

        // removes and adds emotion buttons and changes it according to the chat partner
        if($("#main div.avatar").find("img.avatar-image.is-loaded").length != 0){
            var img   = $("#main div.avatar").find("img.avatar-image.is-loaded"); 
            // check if group
            if(img[0].src.match(/u=(\d*)/) != null){
                var group = img[0].src.match(/u=(\d*)-/);
                // if group found remove emotion on/off button if it exists
                if(group != null){
                    if($("#btnOnOff").length){
                        $("#btnOnOff").remove();
                    }
                }else{
                    try{
                        // if not blacklisted, show emotion on/off button
                        if(blacklist[JSON.parse(getChatpartnerPhone())[1]]["blacklisted"] === "no"){
                            setTurnOnOffBtn();
                        // if blacklisted, remove emotion on/off button if existed
                        }else if(blacklist[JSON.parse(getChatpartnerPhone())[1]]["blacklisted"] === "yes"){
                            $("#btnOnOff").remove();
                        }else if(blacklist[JSON.parse(getChatpartnerPhone())[1]]["blacklisted"] === "undefined"){
                            getContactsDB();
                        }
                    }catch(err){}
                }
            }  
        }else{
            $("#btnOnOff").remove();
        }
    }
    
    function deleteAllButtons(){
        $("#btnEmotion").remove();
        //$("#btnVis1").remove();
        //$("#btnVis2").remove();
        //$("#btnVis3").remove();
        //$("#btnVis4").remove();
        $("#btnBlacklist").remove();
        $("#btnPicsMenu").remove();
        $("#btnOnOff").remove();
        $("#btnShowPicsMenu").remove();
        $("#legend1").remove();
        $("#legend2").remove();
    }
    
    // check for chat groups
    function getGroups(){
        var groups = [];
        if($("div.chat").find("img.avatar-image.is-loaded").length){
            $("div.chat").each(function() {
                if($(this).find("img.avatar-image.is-loaded").length != 0){
                    var img   = $(this).find("img.avatar-image.is-loaded"); 
                    var title = $(this).find("div.chat-title").text(); 
                    if(img[0].src.match(/u=(\d*)/) != null){
                        var group = img[0].src.match(/u=(\d*)-/);
                        if(group != null){
                            groups.push(title);
                        }
                    }  
                }
            });

        }
        
        return groups;
    }
    
    /*********************** FIRST USE TAKE PICTURES ***************************/
    
    var count = 0;
    var octetArray = [];
    
    // show necessary text and buttons to take user pics
    function takePics(command){
        currentlyTakingPics = true;
        stopSavingPics = false;
        octetArray = [];
        count = 0;
        cmd = command;
        $("#bg").css("visibility", "visible");
        $("video").css("visibility", "visible");
        $("#emoPics").css("visibility", "visible");
        $("#btnAbort").css("visibility", "visible");
        $("#btnPics").css("display", "inline");
    }
    
    // the abortion button if pics should be taken 
    $("body").on("click", "#btnAbort", function () {
        currentlyTakingPics = false;
         $("video").css("visibility", "hidden");
         $("canvas").css("visibility", "hidden");
         $("#emoPics").css("visibility", "hidden");
         $("#btnPics").css("display", "none");
         $("#btnAbort").css("visibility", "hidden");
         $("#bg").css("visibility", "hidden");
         $("#picsText").html("Your emotions will be shown in your profile picture. Therefore, we need profile pictures showing each emotion of you. Take now a picture of the emotion:</br></br> Anger");
         return;
    });

    // the button to actually take user pics
    $("body").on("click", "#btnPics", function () {
        switch(count){
            case 0:
                $("#picsText").html("Take now a picture of the emotion: </br></br>Happiness");
                $("#btnPics").hover(function(){
                    $(this).css("background-color", "#fdf39b");
                    }, function(){
                    $(this).css("background-color", "#efd705");
                });
                break;
            case 1:
                $("#picsText").html("Take now a picture of the emotion:</br></br>Neutral");
                $("#btnPics").hover(function(){
                    $(this).css("background-color", "#aaa");
                    }, function(){
                    $(this).css("background-color", "#7a7a7a");
                });
                break;
            case 2:
                $("#picsText").html("Take now a picture of the emotion:</br></br>Sadness");
                $("#btnPics").hover(function(){
                    $(this).css("background-color", "#567ae1");
                    }, function(){
                    $(this).css("background-color", "#2b4caa");
                });
                break;
            case 3:
                $("#picsText").html("Take now a picture of the emotion:</br></br>Surprise");
                $("#btnPics").hover(function(){
                    $(this).css("background-color", "#9fe7ff");
                    }, function(){
                    $(this).css("background-color", "#17b5ea");
                });
                break;
            default:
                break;
        }
        if(count < 5){
            var canvas = document.getElementById('profilepic');
            var ctx = canvas.getContext('2d');
            ctx.drawImage(vid, 0, 0, vidWidth, vidHeight);
            var snapshot = canvas.toDataURL('image/png');
            var img = canvas.toDataURL('image/octet-stream');
            octetArray[count] = img;
            document.querySelector('img.testimg').src = snapshot;
            $("#profilepic").css("visibility", "visible");
            count++;

            setTimeout(function(){
                $("canvas").css("visibility", "hidden");
            }, 1500);

            if(octetArray.length == 5){
                currentlyTakingPics = false;
                var jsonUser = getUserphone();
                $("video").css("visibility", "hidden");
                $("canvas").css("visibility", "hidden");
                $("#btnPics").css("display", "none");
                $("#btnAbort").css("visibility", "hidden");
                $("#picsText").html("The pictures are currently stored.");
                if(jsonUser != null && !stopSavingPics){
                    stopSavingPics = true;
                    $.ajax({
                            type: 'POST',
                            url: 'https://tama.adhara.uberspace.de/emotion/emotionpics.php',
                            data: { 
                                'user': jsonUser,
                                'command': cmd,
                                'anger': octetArray[0],
                                'happiness': octetArray[1],
                                'neutral': octetArray[2],
                                'sadness': octetArray[3],
                                'surprise': octetArray[4]
                                  },
                            success: function(res){
                                console.log(res);
                                emoPicsExist = true;
                                fillEmoPicsList();
                                $("#emoPics").css("visibility", "hidden");
                                $("#bg").css("visibility", "hidden");
                                $("#picsText").html("Your emotions will be shown in your profile picture. Therefore, we need profile pictures showing each emotion of you. Take now a picture of the emotion:</br></br> Anger");
                            }
                    });
                }
            }
        }
    });

    function checkFirstUse(){
        if(!stopTakingPics){
            var jsonUser = getUserphone();
            if(jsonUser != null){
                $.ajax({
                        type: 'POST',
                        url: 'https://tama.adhara.uberspace.de/emotion/emotionpics.php',
                        data: { 
                            'user': jsonUser,
                            'command': "FIRST_USE"
                              },
                        success: function(res){
                            stopTakingPics = true;
                            if(res == 1){
                                takePics("SAVE_PICS");
                            }else{
                                emoPicsExist = true;
                                fillEmoPicsList();
                            }
                        }
                });
            }
        }
    }
    
    function fillEmoPicsList(){
        try{
            var jsonUser = getUserphone();
            var link = "https://tama.adhara.uberspace.de/emotion/emotionpics/" + JSON.parse(jsonUser)[1] + "/";
            emoPicsLinks = [];
            emoPicsLinks.push(link+"anger.png");
            emoPicsLinks.push(link+"happiness.png");
            emoPicsLinks.push(link+"neutral.png");
            emoPicsLinks.push(link+"sadness.png");
            emoPicsLinks.push(link+"surprise.png");
            emoPicsLinks.push(link);
        }catch(err){}
    }
    
    function fillEmoPicsListChatpartner(){
        try{
            var chatpartner = getChatpartnerPhone();
            var link = "https://tama.adhara.uberspace.de/emotion/emotionpics/" + JSON.parse(chatpartner)[1] + "/";
            emoPicsLinksCP = [];
            emoPicsLinksCP.push(link+"anger.png");
            emoPicsLinksCP.push(link+"happiness.png");
            emoPicsLinksCP.push(link+"neutral.png");
            emoPicsLinksCP.push(link+"sadness.png");
            emoPicsLinksCP.push(link+"surprise.png");
            emoPicsLinksCP.push(link);
        }catch(err){}
    }
    
    /*********************** LOGGING FOR TURN ON OFF OF SYSTEM ***************************/
    
    function logTurnOnOff(){
        var userphone = getUserphone();
        if(userphone != null){
            var user = JSON.parse(userphone)[1];
            $.ajax({
                        type: 'POST',
                        url: 'https://tama.adhara.uberspace.de/emotion/system_turn_on_off.php',
                        data: { 
                            'user': user
                              },
                        success: function(res){
                        }
            });
        }
    }
    
    /*********************** LOGGING FOR EMOTICONS AMOUNT ***************************/
    
    function logEmoticons(amount){
        var userphone = getUserphone();
        if(userphone != null){
            var user = JSON.parse(userphone)[1];
            $.ajax({
                        type: 'POST',
                        url: 'https://tama.adhara.uberspace.de/emotion/count_emoticons.php',
                        data: { 
                            'user': user,
                            'chatpartner': chatpartner,
                            'amount': amount
                              },
                        success: function(res){
                        }
            });
        }
    }

});