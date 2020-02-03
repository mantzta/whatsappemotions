document.addEventListener('DOMContentLoaded', function(){

    var input = document.getElementById('turn');

    // set the initial state of the checkbox
    chrome.storage.sync.get("turn_on_off", function(data){
        if (data["turn_on_off"]){
            input.checked = true;
        } else {
            input.checked = false;
        }
      });


    input.addEventListener("change", function(){
        chrome.storage.sync.set({turn_on_off: input.checked});
    });


});

