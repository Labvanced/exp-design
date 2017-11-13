// � by Caspar Goeke and Holger Finger

/**
 * generated a global unique id.
 *
 * @returns {string}
 */
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '' + s4() + '' + s4() + '' +
        s4() + '' + s4() + s4() + s4();
}


function getCurrentDate(offset) {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if (offset){
        var hh = today.getHours()+offset;
    }
    else{
        var hh = today.getHours();
    }
    if (hh<0){
        dd --;
        hh = 24-hh;
    }
    else if (hh>23){
        dd++;
        hh=hh-24
    }

    if(dd<10){
        dd='0'+dd;
    }
    if(mm<10){
        mm='0'+mm;
    }
    var today = yyyy+'/'+mm+'/'+dd;
    return today
};


function getCurrentDateModified(offset) {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours()+offset;
    if (hh<0){
        dd --;
        hh = 24-hh;
    }
    else if (hh>23){
        dd++;
        hh=hh-24
    }
    var min = today.getMinutes();

    if(dd<10){
        dd='0'+dd;
    }
    if(mm<10){
        mm='0'+mm;
    }
    var date = yyyy+"-"+mm+"-"+dd ;
    var time = hh+":"+min;

    var obj = {
        date: date,
        time: time,
        data: [yyyy,parseInt(mm),parseInt(dd),hh,min]
    };
    return obj;

}


function copyTarget(elemId) {
    var elem  =   $('#'+elemId)[0];
    // create hidden text element, if it doesn't already exist
    var targetId = "_hiddenCopyText_";
    var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
    var origSelectionStart, origSelectionEnd;
    if (isInput) {
        // can just use the original source element for the selection and copy
        target = elem;
        origSelectionStart = elem.selectionStart;
        origSelectionEnd = elem.selectionEnd;
    } else {
        // must use a temporary form element for the selection and copy
        target = document.getElementById(targetId);
        if (!target) {
            var target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.textContent = elem.textContent;
    }
    // select the content
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);

    // copy the selection
    var succeed;
    try {
        succeed = document.execCommand("copy");
    } catch(e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }

    if (isInput) {
        // restore prior selection
        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
    } else {
        // clear temporary content
        target.textContent = "";
    }
    return succeed;
}