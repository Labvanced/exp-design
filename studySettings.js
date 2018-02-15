var StudySettings = function (expData) {
    this.expData = expData;

    this.studySettings = this.expData.studySettings;
    this.timeZoneOffset = ko.observable(0);
    this.bgColor = ko.observable('#ffffff');
    this.allowSTRGQ = ko.observable(true);

    // browsers
    this.allowChrome = ko.observable(true);
    this.allowFirefox = ko.observable(true);
    this.allowInternetExplorer= ko.observable(true);
    this.allowEdge= ko.observable(true);
    this.allowSafari = ko.observable(true);
    this.allowOpera = ko.observable(true);
    this.allowOtherBrowser = ko.observable(true);

    // devices
    this.allowAndroidMobile= ko.observable(true);
    this.allowAndroidTablet = ko.observable(true);
    this.allowIPhone= ko.observable(true);
    this.allowIPad = ko.observable(true);
    this.allowMac = ko.observable(true);
    this.allowPCWindows = ko.observable(true);
    this.allowPCLinux = ko.observable(true);
    this.allowOtherOS= ko.observable(true);
};
StudySettings.prototype.timezones = ["-11", "-10", "-9", "-8", "-7", "-6", "-5", "-4", "-3", "-2", "-1", "0","+1","+2","+3","+4","+5","+6","+7","+8","+9","+10","+11","+12"];


StudySettings.prototype.setPointers = function(entitiesArr) {

};

StudySettings.prototype.reAddEntities = function(entitiesArr) {

};




StudySettings.prototype.fromJS = function(data) {
    this.timeZoneOffset(data.timeZoneOffset);
    if (data.hasOwnProperty("bgColor")){
        this.bgColor(data.bgColor);
    }
    if (data.hasOwnProperty("allowSTRGQ")){
        this.allowSTRGQ(data.allowSTRGQ);
    }

    if (data.hasOwnProperty("allowChrome")){
        this.allowChrome(data.allowChrome);
    }
    if (data.hasOwnProperty("allowFirefox")){
        this.allowFirefox(data.allowFirefox);
    }
    if (data.hasOwnProperty("allowInternetExplorer")){
        this.allowInternetExplorer(data.allowInternetExplorer);
    }
    if (data.hasOwnProperty("allowSafari")){
        this.allowSafari(data.allowSafari);
    }
    if (data.hasOwnProperty("allowOpera")){
        this.allowOpera(data.allowOpera);
    }
    if (data.hasOwnProperty("allowOtherBrowser")){
        this.allowOtherBrowser(data.allowOtherBrowser);
    }
    if (data.hasOwnProperty("allowAndroidMobile")){
        this.allowAndroidMobile(data.allowAndroidMobile);
    }
    if (data.hasOwnProperty("allowAndroidTablet")){
        this.allowAndroidTablet(data.allowAndroidTablet);
    }
    if (data.hasOwnProperty("allowIPhone")){
        this.allowIPhone(data.allowIPhone);
    }
    if (data.hasOwnProperty("allowIPad")){
        this.allowIPad(data.allowIPad);
    }
    if (data.hasOwnProperty("allowMac")){
        this.allowMac(data.allowMac);
    }
    if (data.hasOwnProperty("allowPCWindows")){
        this.allowPCWindows(data.allowPCWindows);
    }
    if (data.hasOwnProperty("allowPCLinux")){
        this.allowPCLinux(data.allowPCLinux);
    }
    if (data.hasOwnProperty("allowOtherOS")){
        this.allowOtherOS(data.allowOtherOS);
    }
    if (data.hasOwnProperty("allowEdge")){
        this.allowEdge(data.allowEdge);
    }



};



StudySettings.prototype.toJS = function() {
    var data = {
        timeZoneOffset: this.timeZoneOffset(),
        bgColor:this.bgColor(),
        allowSTRGQ:this.allowSTRGQ(),
        allowChrome:this.allowChrome(),
        allowFirefox:this.allowFirefox(),
        allowInternetExplorer:this.allowInternetExplorer(),
        allowSafari:this.allowSafari(),
        allowOpera:this.allowOpera(),
        allowOtherBrowser:this.allowOtherBrowser(),
        allowAndroidMobile:this.allowAndroidMobile(),
        allowAndroidTablet:this.allowAndroidTablet(),
        allowIPhone:this.allowIPhone(),
        allowIPad:this.allowIPad(),
        allowMac:this.allowMac(),
        allowPCWindows:this.allowPCWindows(),
        allowPCLinux:this.allowPCLinux(),
        allowOtherOS:this.allowOtherOS(),
        allowEdge:this.allowEdge()
    };
    return data;
};
