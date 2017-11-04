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

};