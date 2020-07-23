var StudySettings = function (expData) {
    this.expData = expData;

    this.studySettings = this.expData.studySettings;
    this.timeZoneOffset = ko.observable(0);
    this.bgColor = ko.observable('#ffffff');
    this.allowSTRGQ = ko.observable(true);

    // browsers
    this.allowChrome = ko.observable(true);
    this.allowFirefox = ko.observable(true);
    this.allowInternetExplorer = ko.observable(true);
    this.allowEdge = ko.observable(true);
    this.allowSafari = ko.observable(true);
    this.allowOpera = ko.observable(true);
    this.allowOtherBrowser = ko.observable(true);

    // devices
    this.allowAndroidMobile = ko.observable(true);
    this.allowAndroidTablet = ko.observable(true);
    this.allowIPhone = ko.observable(true);
    this.allowIPad = ko.observable(true);
    this.allowMac = ko.observable(true);
    this.allowPCWindows = ko.observable(true);
    this.allowPCLinux = ko.observable(true);
    this.allowOtherOS = ko.observable(true);

    // resolution
    this.minRes = ko.observable(false);
    this.minWidth = ko.observable(800);
    this.minHeight = ko.observable(600);
    this.pauseOnExitFullscreen = ko.observable(false);
    this.useOnlyCompletedSessionsForGroupRand = ko.observable(true);
    this.disablePreloadingResources = ko.observable(false);

    // special device requirements:
    this.isAudioRecEnabled = ko.observable(false);
    this.isVideoRecEnabled = ko.observable(false);
    this.isWebcamEnabled = ko.observable(false);
    this.multiUserOnLeaveAction = ko.observable("Finish Study With Error");
    this.multiUserAllowInviteFriends = ko.observable(true);
    this.multiUserAllowReconnect = ko.observable(true);
    this.multiUserReconnectTimeout = ko.observable(120);
    this.multiUserPauseAfter = ko.observable(6);
    this.multiUserCheckPing = ko.observable(true);
    this.multiUserMaxPingAllowed = ko.observable(1000);
    this.multiUserMaxAvgPingAllowed = ko.observable(600);

    // number entered before checking the validity (min/max). gets updated after check.
    this.numPartEntered = ko.observable(expData.numPartOfJointExp());

    // change these values to refactor the min/max number of participants
    this.minNumPartOfJointExp = ko.observable(2);
    this.maxNumPartOfJointExp = ko.observable(10);

    this.participantConsent = ko.observable(true);

    this.assignSubjGroup = ko.observable("automatic");
    this.assignSession = ko.observable("automatic");

    this.actionOnResourceError = ko.observable("abort experiment");

    this.eyetrackingUploadEnabled = ko.observable(false);


    var self = this;
    this.deviceRunType = ko.computed(function () {
        var someMobileAllowed = false;
        var someDesktopAllowed = false;

        if (self.allowAndroidMobile() || self.allowAndroidTablet() || self.allowIPhone() || self.allowIPad()) {
            someMobileAllowed = true;
        }
        if (self.allowMac() || self.allowPCWindows() || self.allowPCLinux() || self.allowOtherOS()) {
            someDesktopAllowed = true;
        }
        if (someMobileAllowed && someDesktopAllowed) {
            return "desktopAndMobile";
        }
        else if (someDesktopAllowed) {
            return "desktop";
        }
        else if (someMobileAllowed) {
            return "mobile";
        }


    }, this);
};
StudySettings.prototype.timezones = ["-11", "-10", "-9", "-8", "-7", "-6", "-5", "-4", "-3", "-2", "-1", "0", "+1", "+2", "+3", "+4", "+5", "+6", "+7", "+8", "+9", "+10", "+11", "+12"];

// function to check the validity of the input number of participants. (min and max attr. not sufficient)
StudySettings.prototype.checkNumPartEntered = function () {
    var checkedValue = null;

    // entered number too small
    if (this.numPartEntered() < this.minNumPartOfJointExp()) {
        checkedValue = this.minNumPartOfJointExp();

        // entered number too large
    } else if (this.numPartEntered() > this.maxNumPartOfJointExp()) {
        checkedValue = this.maxNumPartOfJointExp();

        // entered number valid
    } else {
        checkedValue = this.numPartEntered();
    }

    // update actual numPartOfJointExp in ExpData and the entered number for the view.
    this.expData.numPartOfJointExp(checkedValue);
    this.numPartEntered(checkedValue);
};

StudySettings.prototype.setParamsOnCreation = function (addSettingDialog) {
    this.timeZoneOffset(addSettingDialog.timeZoneOffset());
    this.bgColor(addSettingDialog.bgColor());
    this.allowChrome(addSettingDialog.allowChrome());
    this.allowFirefox(addSettingDialog.allowFirefox());
    this.allowInternetExplorer(addSettingDialog.allowInternetExplorer());
    this.allowEdge(addSettingDialog.allowEdge());
    this.allowSafari(addSettingDialog.allowSafari());
    this.allowOpera(addSettingDialog.allowOpera());
    this.allowOtherBrowser(addSettingDialog.allowOtherBrowser());
    this.allowAndroidMobile(addSettingDialog.allowAndroidMobile());
    this.allowAndroidTablet(addSettingDialog.allowAndroidTablet());
    this.allowIPhone(addSettingDialog.allowIPhone());
    this.allowIPad(addSettingDialog.allowIPad());
    this.allowMac(addSettingDialog.allowMac());
    this.allowPCWindows(addSettingDialog.allowPCWindows());
    this.allowPCLinux(addSettingDialog.allowPCLinux());
    this.allowOtherOS(addSettingDialog.allowOtherOS());

    if (addSettingDialog.isMultiUser()) {
        this.expData.isJointExp(true);
    }

};

StudySettings.prototype.setPointers = function (entitiesArr) {

};

StudySettings.prototype.reAddEntities = function (entitiesArr) {

};


StudySettings.prototype.enableAudioRec = function () {
    if (!this.isAudioRecEnabled()) {
        this.isAudioRecEnabled(true);
    }
    this.allowInternetExplorer(false);
};


StudySettings.prototype.enableVideoRec = function () {
    if (!this.isVideoRecEnabled()) {
        this.isVideoRecEnabled(true);
    }
    this.allowInternetExplorer(false);
};




StudySettings.prototype.fromJS = function (data) {
    this.timeZoneOffset(data.timeZoneOffset);
    if (data.hasOwnProperty("bgColor")) {
        this.bgColor(data.bgColor);
    }
    if (data.hasOwnProperty("allowSTRGQ")) {
        this.allowSTRGQ(data.allowSTRGQ);
    }

    if (data.hasOwnProperty("allowChrome")) {
        this.allowChrome(data.allowChrome);
    }
    if (data.hasOwnProperty("allowFirefox")) {
        this.allowFirefox(data.allowFirefox);
    }
    if (data.hasOwnProperty("allowInternetExplorer")) {
        this.allowInternetExplorer(data.allowInternetExplorer);
    }
    if (data.hasOwnProperty("allowSafari")) {
        this.allowSafari(data.allowSafari);
    }
    if (data.hasOwnProperty("allowOpera")) {
        this.allowOpera(data.allowOpera);
    }
    if (data.hasOwnProperty("allowOtherBrowser")) {
        this.allowOtherBrowser(data.allowOtherBrowser);
    }
    if (data.hasOwnProperty("allowAndroidMobile")) {
        this.allowAndroidMobile(data.allowAndroidMobile);
    }
    if (data.hasOwnProperty("allowAndroidTablet")) {
        this.allowAndroidTablet(data.allowAndroidTablet);
    }
    if (data.hasOwnProperty("allowIPhone")) {
        this.allowIPhone(data.allowIPhone);
    }
    if (data.hasOwnProperty("allowIPad")) {
        this.allowIPad(data.allowIPad);
    }
    if (data.hasOwnProperty("allowMac")) {
        this.allowMac(data.allowMac);
    }
    if (data.hasOwnProperty("allowPCWindows")) {
        this.allowPCWindows(data.allowPCWindows);
    }
    if (data.hasOwnProperty("allowPCLinux")) {
        this.allowPCLinux(data.allowPCLinux);
    }
    if (data.hasOwnProperty("allowOtherOS")) {
        this.allowOtherOS(data.allowOtherOS);
    }
    if (data.hasOwnProperty("allowEdge")) {
        this.allowEdge(data.allowEdge);
    }
    if (data.hasOwnProperty("minRes")) {
        this.minRes(data.minRes);
    }
    if (data.hasOwnProperty("minWidth")) {
        this.minWidth(data.minWidth);
    }
    if (data.hasOwnProperty("minHeight")) {
        this.minHeight(data.minHeight);
    }
    if (data.hasOwnProperty("pauseOnExitFullscreen")) {
        this.pauseOnExitFullscreen(data.pauseOnExitFullscreen);
    }
    if (data.hasOwnProperty("useOnlyCompletedSessionsForGroupRand")) {
        this.useOnlyCompletedSessionsForGroupRand(data.useOnlyCompletedSessionsForGroupRand);
    }
    if (data.hasOwnProperty("disablePreloadingResources")) {
        this.disablePreloadingResources(data.disablePreloadingResources);
    }
    if (data.hasOwnProperty('isAudioRecEnabled')) {
        this.isAudioRecEnabled(data.isAudioRecEnabled);
    }
    if (data.hasOwnProperty('isVideoRecEnabled')) {
        this.isVideoRecEnabled(data.isVideoRecEnabled);
    }
    if (data.hasOwnProperty("participantConsent")) {
        this.participantConsent(data.participantConsent);
    }
    if (data.hasOwnProperty("multiUserOnLeaveAction")) {
        this.multiUserOnLeaveAction(data.multiUserOnLeaveAction);
    }
    if (data.hasOwnProperty("multiUserAllowInviteFriends")) {
        this.multiUserAllowInviteFriends(data.multiUserAllowInviteFriends);
    }
    if (data.hasOwnProperty("multiUserCheckPing")) {
        this.multiUserCheckPing(data.multiUserCheckPing);
    }
    if (data.hasOwnProperty("multiUserAllowReconnect")) {
        this.multiUserAllowReconnect(data.multiUserAllowReconnect);
    }
    if (data.hasOwnProperty("multiUserReconnectTimeout")) {
        this.multiUserReconnectTimeout(data.multiUserReconnectTimeout);
    }
    if (data.hasOwnProperty("multiUserPauseAfter")) {
        this.multiUserPauseAfter(data.multiUserPauseAfter);
    }
    if (data.hasOwnProperty("multiUserMaxPingAllowed")) {
        this.multiUserMaxPingAllowed(data.multiUserMaxPingAllowed);
    }
    if (data.hasOwnProperty("multiUserMaxAvgPingAllowed")) {
        this.multiUserMaxAvgPingAllowed(data.multiUserMaxAvgPingAllowed);
    }
    if (data.hasOwnProperty("isWebcamEnabled")) {
        this.isWebcamEnabled(data.isWebcamEnabled);
    }
    if (data.hasOwnProperty("assignSubjGroup")) {
        this.assignSubjGroup(data.assignSubjGroup);
    }

    if (data.hasOwnProperty("assignSession")) {
        this.assignSession(data.assignSession);
    }

    if (data.hasOwnProperty("actionOnResourceError")) {
        this.actionOnResourceError(data.actionOnResourceError);
    }
    if (data.hasOwnProperty("eyetrackingUploadEnabled")) {
        this.eyetrackingUploadEnabled(data.eyetrackingUploadEnabled);
    }



};



StudySettings.prototype.toJS = function () {
    var data = {
        timeZoneOffset: this.timeZoneOffset(),
        bgColor: this.bgColor(),
        allowSTRGQ: this.allowSTRGQ(),
        allowChrome: this.allowChrome(),
        allowFirefox: this.allowFirefox(),
        allowInternetExplorer: this.allowInternetExplorer(),
        allowSafari: this.allowSafari(),
        allowOpera: this.allowOpera(),
        allowOtherBrowser: this.allowOtherBrowser(),
        allowAndroidMobile: this.allowAndroidMobile(),
        allowAndroidTablet: this.allowAndroidTablet(),
        allowIPhone: this.allowIPhone(),
        allowIPad: this.allowIPad(),
        allowMac: this.allowMac(),
        allowPCWindows: this.allowPCWindows(),
        allowPCLinux: this.allowPCLinux(),
        allowOtherOS: this.allowOtherOS(),
        allowEdge: this.allowEdge(),
        minRes: this.minRes(),
        minWidth: this.minWidth(),
        minHeight: this.minHeight(),
        pauseOnExitFullscreen: this.pauseOnExitFullscreen(),
        useOnlyCompletedSessionsForGroupRand: this.useOnlyCompletedSessionsForGroupRand(),
        disablePreloadingResources: this.disablePreloadingResources(),
        isAudioRecEnabled: this.isAudioRecEnabled(),
        isVideoRecEnabled: this.isVideoRecEnabled(),
        participantConsent: this.participantConsent(),
        multiUserOnLeaveAction: this.multiUserOnLeaveAction(),
        multiUserAllowInviteFriends: this.multiUserAllowInviteFriends(),
        multiUserAllowReconnect: this.multiUserAllowReconnect(),
        multiUserReconnectTimeout: this.multiUserReconnectTimeout(),
        multiUserPauseAfter: this.multiUserPauseAfter(),
        multiUserCheckPing: this.multiUserCheckPing(),
        multiUserMaxPingAllowed: this.multiUserMaxPingAllowed(),
        multiUserMaxAvgPingAllowed: this.multiUserMaxAvgPingAllowed(),
        isWebcamEnabled: this.isWebcamEnabled(),
        assignSubjGroup: this.assignSubjGroup(),
        assignSession: this.assignSession(),
        actionOnResourceError: this.actionOnResourceError(),
        eyetrackingUploadEnabled: this.eyetrackingUploadEnabled()
    };
    return data;
};
