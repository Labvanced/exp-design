var ExperimentStartupScreen = function (experiment) {
    var self = this;

    this.experiment = experiment;
    this.expData = experiment.exp_data;

    this.imageType = ko.observable(experiment.publishing_data.imageType());
    this.exp_name = ko.observable(experiment.publishing_data.exp_name());
    this.jdenticonHash = ko.observable(experiment.publishing_data.jdenticonHash());
    this.description = ko.observable(experiment.publishing_data.description());

    this.surveySubmitted = ko.observable(false);

    this.selectedGender = ko.observable(null);
    this.selectedAge = ko.observable(null);
    this.selectedCountry = ko.observable(null);
    this.selectedLanguage = ko.observable(null);
    this.selectedEmail = ko.observable(null);
    this.selectedCSId = ko.observable(null);
    if (player.crowdsourcinSubjId) {
        this.selectedCSId(player.crowdsourcinSubjId);
    }

    if (player.country && self.expData.parentExperiment.publishing_data.geoIpMethod() != "notused") {
        this.selectedCountry(countries_by_code[player.country]);
    }

    this.acceptedCustomReq = ko.observable(false);

    this.agreeToTermsAndConditions = ko.observable(false);

    this.requiredGender = this.expData.parentExperiment.publishing_data.surveyItemGender;
    this.requiredAge = this.expData.parentExperiment.publishing_data.surveyItemAge;
    this.requiredCountry = this.expData.parentExperiment.publishing_data.surveyItemCountry;
    this.requiredLanguage = this.expData.parentExperiment.publishing_data.surveyItemLanguage;
    this.requiredEmail = this.expData.parentExperiment.publishing_data.surveyItemEmail;

    this.dataAlreadySent = false;

    this.countryQuestionVisible = ko.computed(function () {
        if (self.requiredCountry() == "hidden") {
            return false;
        }
        else if (self.requiredCountry() == "optional") {
            return true;
        }
        else {
            if (self.expData.parentExperiment.publishing_data.geoIpMethod() == "notused") {
                return true;
            }
            else if (self.expData.parentExperiment.publishing_data.geoIpMethod() == "prefill") {
                return true;
            }
            else if (self.expData.parentExperiment.publishing_data.geoIpMethod() == "forced") {
                return false;
            }
        }

    });

    this.requiredGroup = this.expData.studySettings.assignSubjGroup;
    this.requiredSession = this.expData.studySettings.assignSession;

    this.requiredCustom = this.expData.parentExperiment.publishing_data.customParticipationRequirement;

    this.displayBackToLib = this.expData.parentExperiment.publishing_data.displayBackToLib;

    this.wizardStep = ko.observable("selectStudyLanguage");
    this.selectedStudyLanguage = ko.observable(this.expData.translatedLanguages()[0]);

    this.timeToNextSession = ko.observable("");
    this.participantName = ko.observable("");
    this.friendsEmail = ko.observable("");


    this.initialSubjectDialog = ko.observable(new InitialSubjectDialog(this.expData));
    this.initialSubjectDialog().selectedSubjectGroup(this.expData.availableGroups()[0]);

    this.audioRequest = this.experiment.exp_data.studySettings.isAudioRecEnabled();
    this.videoRequest = false;
    if (this.experiment.exp_data.studySettings.isWebcamEnabled()) {
        // isWebcamEnabled actually mean "use eyetracking", so we request a higher resolution:
        this.videoRequest = {
            facingMode: 'user',
            width: {
                ideal: 1280
            },
            height: {
                ideal: 720
            }
        };
    }
    else if (this.experiment.exp_data.studySettings.isVideoRecEnabled()) {
        // when webcam is only used for video recordings (without eyetracking) it is better to use only 800x600 to reduce upload size of recorded videos:
        this.videoRequest = {
            facingMode: 'user',
            width: {
                ideal: 800
            },
            height: {
                ideal: 600
            }
        };
    }

    this.imgSource = ko.computed(function () {
        return "/files/" + experiment.publishing_data.img_file_id() + "/" + experiment.publishing_data.img_file_orig_name();
    }, this);

    this.errorString = ko.computed(function () {
        var errorString = "";

        // validate if all required fields are filled:
        if (this.requiredGender() == 'required') {
            if (this.selectedGender() != "male" && this.selectedGender() != "female") {
                errorString += self.expData.staticStrings().start.yourGender + " " + self.expData.staticStrings().start.missing + ", ";
            }
        }
        if (this.requiredAge() == 'required') {
            if (!(this.selectedAge() > 0)) {
                errorString += self.expData.staticStrings().start.yourAge + " " + self.expData.staticStrings().start.missing + ", ";
            }
        }
        if (this.requiredCountry() == 'required') {
            if (this.selectedCountry() == null) {
                errorString += self.expData.staticStrings().start.yourCountry + " " + self.expData.staticStrings().start.missing + ", ";
            }
        }
        if (this.requiredLanguage() == 'required') {
            if (this.selectedLanguage() == null) {
                errorString += self.expData.staticStrings().start.yourFirstLang + " " + self.expData.staticStrings().start.missing + ", ";
            }
        }
        if (this.requiredEmail() == 'required') {
            if (this.selectedEmail() == null) {
                errorString += self.expData.staticStrings().start.yourEmail + " " + self.expData.staticStrings().start.missing + ", ";
            }
        }

        // remove last comma:
        if (errorString != "") {
            errorString = errorString.substring(0, errorString.length - 2);
        }
        return errorString;
    }, this);

    this.preloadingProgressRounded = ko.computed(function () {
        var progressRounded = Math.round(player.playerPreloader.progress() * 100);
        $("#progressbar .bar").css({
            'width': progressRounded + "%"
        });
        return progressRounded;
    });

    this.acceptedCustomReq.subscribe(function (newLang) {
        var l = 1;
    });

    this.selectedStudyLanguage.subscribe(function (newLang) {
        var langIdx = self.expData.translatedLanguages().indexOf(newLang);
        self.expData.currentLanguage(langIdx);
        self.expData.varDisplayedLanguage().setValue(newLang);
        self.expData.updateLanguage();
    });

    this.allowedBrowsers = ko.computed(function () {
        var settings = self.expData.studySettings;
        var list = [];
        list.push("Labvanced");
        if (settings.allowChrome()) {
            list.push("Chrome");
        }
        if (settings.allowFirefox()) {
            list.push("Firefox");
        }
        if (settings.allowInternetExplorer()) {
            list.push("Microsoft Internet Explorer");
        }
        if (settings.allowEdge()) {
            list.push("Microsoft Edge");
        }
        if (settings.allowSafari()) {
            list.push("Safari");
        }
        if (settings.allowOpera()) {
            list.push("Opera");
        }
        return list;
    }, this);


    this.allowedSystems = ko.computed(function () {
        var settings = self.expData.studySettings;
        var list = [];
        if (settings.allowAndroidMobile()) {
            list.push("Android-Mobile");
        }
        if (settings.allowAndroidTablet()) {
            list.push("Android-Tablet");
        }
        if (settings.allowIPhone()) {
            list.push("iPhone");
        }
        if (settings.allowIPad()) {
            list.push("iPad");
        }
        if (settings.allowMac()) {
            list.push("Mac/OS-X");
        }
        if (settings.allowPCWindows()) {
            list.push("Windows-PC");
        }
        if (settings.allowPCLinux()) {
            list.push("Linux-PC");
        }
        if (settings.allowOtherOS()) {
            list.push("others");
        }
        return list;
    }, this);


    this.allowOtherBrowser = self.expData.studySettings.allowOtherBrowser();
    this.miniRes = ko.observable('');

    this.resolutionAllowed = ko.observable(null);
    this.browserAllowed = ko.observable(null);
    this.osAllowed = ko.observable(null);
    this.detectBrowserAndSystemSpecs();

    if (this.osAllowed() && this.browserAllowed() && this.resolutionAllowed()) {
        // only start joinExpLobby if allowed:
        this.jointExpLobbyModel = ko.observable(new JointExpLobby(self.expData));
        player.jointExpLobby = this.jointExpLobbyModel();

        var numLang = this.expData.translatedLanguages().length;
        if (numLang < 2) {
            // directly skip to survey if only one language is defined:
            this.jumpToAskSubjData();
        }
    }

    if (this.experiment.publishing_data.connectToExternalDevices()) {
        // only start external connection if enabled:
        var param = "ws://" + this.experiment.publishing_data.connectToIP() + ":" + this.experiment.publishing_data.connectToPort() + "/";
        player.externalWebsocket = new WebSocket(param);
        player.externalWebsocket.onmessage = function (event) {
            var data = JSON.parse(event.data);
            var allCBs = player.currentFrame.websocketTriggerCallbacks;
            // execute all callbacks (events) with 'any' as trigger
            var callbacksToExe = allCBs["any"];
            if (callbacksToExe) {
                callbacksToExe.forEach(function (cb) {
                    cb(data.msg, data.value);
                })
            }
            // execute all callbacks (events) with 'specific' trigger
            if (allCBs[data.msg]) {
                var cbs = allCBs[data.msg];
                cbs.forEach(function (cb) {
                    cb(data.msg, data.value);
                })
            }


        }
    }



};







ExperimentStartupScreen.prototype.sendFriendInvite = function () {

    var emailData = {
        InputName: this.participantName(),
        InputEmail: this.friendsEmail(),
        LinkToStudy: 'https://www.labvanced.com/player.html?id=' + this.expData.parentExperiment.exp_id()
    };

    var self = this;

    $.ajax({
        url: '/inviteFriendForMultiUser',
        type: 'post',
        data: emailData,
        success: function (data) {
            self.participantName("");
            self.friendsEmail("");
            $('#confirmInvite').html("Invite Send");

            setTimeout(
                function () {
                    $('#confirmInvite').html("")
                }, 15000);

        }
    });


};

ExperimentStartupScreen.prototype.detectBrowserAndSystemSpecs = function () {
    var unknown = '-';

    // screen
    var screenSize = '';
    if (screen.width) {
        var width = (screen.width) ? screen.width : '';
        var height = (screen.height) ? screen.height : '';
        screenSize += '' + width + " x " + height;
    }


    if (this.expData.studySettings.minRes()) {
        this.miniRes(this.expData.studySettings.minWidth() + "x" + this.expData.studySettings.minHeight());
        if (width >= parseInt(this.expData.studySettings.minWidth()) && height >= parseInt(this.expData.studySettings.minHeight())) {
            this.resolutionAllowed(true);
        }
        else {
            this.resolutionAllowed(false);
        }
    }
    else {
        this.resolutionAllowed(true);
    }


    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browser = navigator.appName;
    var version = '' + parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;
    var isOtherBrowser = false;

    // Opera
    if ((verOffset = nAgt.indexOf('Opera')) != -1) {
        browser = 'Opera';
        version = nAgt.substring(verOffset + 6);
        if ((verOffset = nAgt.indexOf('Version')) != -1) {
            version = nAgt.substring(verOffset + 8);
        }
    }
    // Opera Next
    if ((verOffset = nAgt.indexOf('OPR')) != -1) {
        browser = 'Opera';
        version = nAgt.substring(verOffset + 4);
    }
    // Edge
    else if ((verOffset = nAgt.indexOf('Edge')) != -1) {
        browser = 'Microsoft Edge';
        version = nAgt.substring(verOffset + 5);
    }
    // MSIE
    else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
        browser = 'Microsoft Internet Explorer';
        version = nAgt.substring(verOffset + 5);
    }
    // Chrome
    else if ((verOffset = nAgt.indexOf('Chrome')) != -1 || navigator.userAgent.match('CriOS')) {
        browser = 'Chrome';
        version = nAgt.substring(verOffset + 7);
    }
    // Safari
    else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
        browser = 'Safari';
        version = nAgt.substring(verOffset + 7);
        if ((verOffset = nAgt.indexOf('Version')) != -1) {
            version = nAgt.substring(verOffset + 8);
        }
    }
    // Firefox
    else if ((verOffset = nAgt.indexOf('Firefox')) != -1 || navigator.userAgent.match("FxiOS")) {
        browser = 'Firefox';
        version = nAgt.substring(verOffset + 8);
    }
    // Labvanced
    else if ((verOffset = nAgt.indexOf('Labvanced')) != -1) {
        browser = 'Labvanced';
        version = nAgt.substring(verOffset + 10, nAgt.indexOf(' '));
        if (is_nwjs()) {
            var ifaces = require('os').networkInterfaces();
            var ifnames = Object.keys(ifaces);
            ifnames.sort();
            var macAddrFound = false;
            for (var ifidx = 0; ifidx < ifnames.length; ifidx++) {
                var addr = ifaces[ifnames[ifidx]];
                for (var addridx = 0; addridx < addr.length; addridx++) {
                    var macAddr = addr[addridx].mac;
                    if (macAddr.length == 17 && macAddr != "00:00:00:00:00:00") {
                        console.log("found macAddr: ", macAddr)
                        nAgt = nAgt + " MACADDR/" + macAddr;
                        macAddrFound = true;
                        break;
                    }
                }
                if (macAddrFound) {
                    break;
                }
            }
        }
    }
    // MSIE 11+
    else if (nAgt.indexOf('Trident/') != -1) {
        browser = 'Microsoft Internet Explorer';
        version = nAgt.substring(nAgt.indexOf('rv:') + 3);
    }
    // Other browsers
    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
        browser = nAgt.substring(nameOffset, verOffset);
        isOtherBrowser = true;
        version = nAgt.substring(verOffset + 1);
        if (browser.toLowerCase() == browser.toUpperCase()) {
            browser = navigator.appName;
        }
    }
    if (this.allowedBrowsers().indexOf(browser) >= 0) {
        this.browserAllowed(true);
    }
    else if (isOtherBrowser && this.allowOtherBrowser) {
        this.browserAllowed(true);
    }
    else {
        this.browserAllowed(false);
    }


    // system
    var os = "others";
    var clientStrings = [
        { s: 'Windows-PC', r: /(Windows 10.0|Windows NT 10.0)/ },
        { s: 'Windows-PC', r: /(Windows 8.1|Windows NT 6.3)/ },
        { s: 'Windows-PC', r: /(Windows 8|Windows NT 6.2)/ },
        { s: 'Windows-PC', r: /(Windows 7|Windows NT 6.1)/ },
        { s: 'Windows-PC', r: /Windows NT 6.0/ },
        { s: 'Windows-PC', r: /Windows NT 5.2/ },
        { s: 'Windows-PC', r: /(Windows NT 5.1|Windows XP)/ },
        { s: 'Windows-PC', r: /(Windows NT 5.0|Windows 2000)/ },
        { s: 'Windows-PC', r: /(Win 9x 4.90|Windows ME)/ },
        { s: 'Windows-PC', r: /(Windows 98|Win98)/ },
        { s: 'Windows-PC', r: /(Windows 95|Win95|Windows_95)/ },
        { s: 'Windows-PC', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
        { s: 'Windows-PC', r: /Windows CE/ },
        { s: 'Windows-PC', r: /Win16/ },

        { s: 'iPad', r: /iPad/ },
        { s: 'iPhone', r: /iPhone/ },

        { s: 'Mac/OS-X', r: /Mac OS X/ },
        { s: 'Mac/OS-X', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },

        { s: 'Android', r: /Android/ },

        { s: 'Linux-PC', r: /(Linux|X11)/ }, // warning: it is important to first check Android above, because it also includes Linux in agent string.

        { s: 'others', r: /iPod/ },
        { s: 'others', r: /OpenBSD/ },
        { s: 'others', r: /SunOS/ },
        { s: 'others', r: /QNX/ },
        { s: 'others', r: /UNIX/ },
        { s: 'others', r: /BeOS/ },
        { s: 'others', r: /OS\/2/ },
        { s: 'others', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ }
    ];

    for (var id in clientStrings) {
        var cs = clientStrings[id];
        if (cs.r.test(nAgt)) {
            console.log("matched " + cs.r);
            os = cs.s;
            break;
        }
    }

    if (os == "Mac/OS-X") {    // since iOS 13
        var isIOS = /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        if (isIOS) {
            if (navigator.platform.indexOf("iPhone") != -1) {
                os = "iPhone";
            }
            else {
                os = "iPad";
            }
        }
    }

    if (os == "Android") {
        if (/Mobile/.test(nAgt)) {
            os = "Android-Mobile";
        }
        else {
            os = "Android-Tablet";
        }
    }

    if (this.allowedSystems().indexOf(os) >= 0) {
        this.osAllowed(true);
    }
    else {
        this.osAllowed(false);
    }


    this.experiment.exp_data.varBrowserSpec().value().value(browser);
    this.experiment.exp_data.varBrowserVersionSpec().value().value(version);
    this.experiment.exp_data.varSystemSpec().value().value(os);
    this.experiment.exp_data.varAgentSpec().value().value(nAgt);

};




ExperimentStartupScreen.prototype.languageSelected = function () {
    this.jumpToAskSubjData();
};

ExperimentStartupScreen.prototype.jumpToAskSubjData = function () {
    var self = this;

    if (player.askSubjData) {
        // player was started by the experimenter, so we ask for subject code, group, session:
        var initialSubjectDialog = new InitialSubjectDialog(player.experiment.exp_data);
        if (player.runOnlyGroupNr) {
            initialSubjectDialog.selectedSubjectGroup(player.runOnlyGroupNr);
        }
        if (player.runOnlySessionNr) {
            initialSubjectDialog.selectedSessionNr(player.runOnlySessionNr);
        }
        initialSubjectDialog.subjectCode(player.subject_code);
        initialSubjectDialog.start(function () {
            player.subject_code = initialSubjectDialog.subjectCode();
            var groupNr = initialSubjectDialog.selectedGroupNr();
            var sessionNr = initialSubjectDialog.selectedSessionNr();
            if (!groupNr) {
                groupNr = 1;
            }
            if (!sessionNr) {
                sessionNr = 1;
            }
            player.setSubjectGroupNr(groupNr, sessionNr);
            self.jumpToSurvey();
        });
    }
    else {
        this.jumpToSurvey();
    }

};

ExperimentStartupScreen.prototype.jumpToSurvey = function () {
    var self = this;
    if (player.runOnlyTaskId) {
        // directly skip to joint exp lobby:
        player.setSubjectGroupNr(1, 1);
        player.preloadAllContent();
        self.jumpToRequestPermissionScreen();
        return;
    }

    if (player.runOnlyGroupNr && player.runOnlySessionNr) {
        // directly skip to joint exp lobby:
        player.setSubjectGroupNr(player.runOnlyGroupNr, player.runOnlySessionNr);
        player.preloadAllContent();
        this.sendDataAndContinue();
        return;
    }

    if (player.runOnlyGroupNr) {
        // still need to send data (initialize recording session on server) before jump to joint exp lobby:
        player.runOnlySessionNr = "1";
        player.setSubjectGroupNr(player.runOnlyGroupNr, player.runOnlySessionNr);
        player.preloadAllContent();
        this.sendDataAndContinue();
        return;
    }

    if (player.groupNrAssignedByServer && player.sessionNrAssignedByServer) {
        // directly skip to permission screen (recording session already initialized on server:
        player.setSubjectGroupNr(player.groupNrAssignedByServer, player.sessionNrAssignedByServer);
        player.preloadAllContent();
        self.jumpToRequestPermissionScreen();
        return;
    }

    if (this.requiredGender() == 'hidden' && this.requiredAge() == 'hidden' && !this.countryQuestionVisible() && this.requiredLanguage() == 'hidden' && this.requiredEmail() == 'hidden' && !player.askForWorkerId() && this.requiredGroup() == 'automatic' && this.requiredSession() == 'automatic' && this.requiredCustom() == '') {
        this.sendDataAndContinue();
    }
    else {
        this.wizardStep("initialSurvey");
    }

};


ExperimentStartupScreen.prototype.checkSurveyData = function () {
    var self = this;
    if (this.errorString() == "" && !this.surveySubmitted()) {
        this.surveySubmitted(true);
        if (this.requiredGroup() == 'byParticipant' || this.requiredSession() == 'byParticipant') {
            var groupNr = this.initialSubjectDialog().selectedGroupNr();
            var sessionNr = this.initialSubjectDialog().selectedSessionNr();
            player.setSubjectGroupNr(groupNr, sessionNr);
        }
        this.sendDataAndContinue();
    }
};

ExperimentStartupScreen.prototype.sendDataAndContinue = function () {

    if (this.dataAlreadySent) {
        // prevent double sending data...
        return;
    }

    this.dataAlreadySent = true;

    // temp save worker id
    this.expData.varCrowdsourcingSubjId().value().value(this.selectedCSId());

    var self = this;
    var survey_data = {
        selectedGender: this.selectedGender(),
        selectedAge: this.selectedAge(),
        selectedCountry: this.selectedCountry() ? this.selectedCountry().code : null,
        selectedLanguage: this.selectedLanguage() ? this.selectedLanguage().code : null,
        selectedEmail: this.selectedEmail()
    };


    var data_send = {
        expSessionNr: player.expSessionNr,
        expId: player.expId,
        subject_code: player.subject_code,
        token: player.token,
        survey_data: survey_data,
        isTestrun: player.isTestrun,
        runOnlyGroupNr: player.runOnlyGroupNr,
        runOnlySessionNr: player.runOnlySessionNr
    };



    playerAjaxPost('/startFirstPlayerSession',
        data_send,
        function (data) {
            if (data.hasOwnProperty('success') && data.success == false) {
                if (data.msg == "no matching subject group") {
                    player.finishSessionWithError("We are sorry, but you do not qualify to take part in this study.");
                }
                else {
                    player.finishSessionWithError("Could not initialize first session of experiment. Error Message: " + data.msg);
                }
                return;
            }
            player.selectedEmail = self.selectedEmail();

            if (!(self.requiredGroup() == 'byParticipant' || self.requiredSession() == 'byParticipant')) {
                player.setSubjectGroupNr(data.groupNr, data.sessionNr);
            }
            if (self.experiment.publishing_data.sendRecordedDataToExternalServer()) {
                data_send.groupNr = player.groupNr;
                data_send.sessionNr = player.sessionNr;
                data_send.group_name = player.subj_group.name();
                data_send.session_name = player.exp_session.name();
                data_send.experiment_name = player.experiment.exp_name();

                if (player.exp_license === 'lab') {
                    playerAjaxPostExternal(
                        '/startFirstPlayerSession',
                        data_send,
                        null
                    );
                } else {
                    console.error("external data storage is only supported for lab license holders");
                }
            }
            player.preloadAllContent();
            self.jumpToRequestPermissionScreen();
        }

    );
};

ExperimentStartupScreen.prototype.jumpToRequestPermissionScreen = function () {
    var self = this;
    this.wizardStep("requestPermission");

    if (this.audioRequest || this.videoRequest) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // waiting for permission...
        }
        else {
            self.finishSessionWithError("Error accessing your microphone or webcam. Please check your PC and browser settings.");
        }
    }
    else {
        this.jumpToLoadingScreen();
    }
};


ExperimentStartupScreen.prototype.requestPermissions = function () {
    var self = this;

    // ask for permission to use camera / mic
    navigator.mediaDevices.getUserMedia({ audio: this.audioRequest, video: this.videoRequest })
        .then(function (stream) {
            if (self.audioRequest) {
                player.microphone_stream = stream;
                player.audioContext = new AudioContext();
            }
            if (self.videoRequest) {
                player.video_stream = stream;
            }
            self.jumpToLoadingScreen();
        }).catch(function (err) {
            console.error(err);
            player.finishSessionWithError("Error access to camera or microphone not granted. You have to change your browser settings. settings --> site settings --> microphone/camera --> blocked --> labvanced.com --> clear & reset");
        });
};

ExperimentStartupScreen.prototype.jumpToLoadingScreen = function () {
    var self = this;
    this.wizardStep("loading");

    // check session start time:
    var currentStartWindow = player.getCurrentStartWindow();
    if (currentStartWindow.start) {
        if (currentStartWindow.end < currentStartWindow.current) {
            // last available session in the past
            this.wizardStep("sessionOver");
        }
        else if (currentStartWindow.start <= currentStartWindow.current && currentStartWindow.end >= currentStartWindow.current) {
            // currently running
            this.checkPreloadingState();
        }
        else if (currentStartWindow.start > currentStartWindow.current) {
            // running in the future
            var timeToWait = player.getDifferenceBetweenDates(currentStartWindow.current, currentStartWindow.start);
            self.timeToNextSession(timeToWait[3]);
            this.wizardStep("sessionNotReady");
        }
    }
    else {
        // no time requirement specified:
        this.checkPreloadingState();
    }
};

ExperimentStartupScreen.prototype.recalcStartingTime = function () {
    var self = this;
    var currentStartWindow = player.getCurrentStartWindow();
    var timeToWait = player.getDifferenceBetweenDates(currentStartWindow.current, currentStartWindow.start);
    self.timeToNextSession(timeToWait[3]);
    if (timeToWait[3] == 'now') {
        self.checkPreloadingState();
    }
};

ExperimentStartupScreen.prototype.checkPreloadingState = function () {
    var self = this;
    if (player.preloaderCompleted()) {
        this.onPreloaderFinished();
    }
    else {
        player.preloaderCompleted.subscribe(function (newVal) {
            if (newVal) {
                self.onPreloaderFinished();
            }
        });
    }
};

ExperimentStartupScreen.prototype.onPreloaderFinished = function () {
    if (this.expData.isJointExp()) {
        this.jumpToJointExpLobby();
    }
    else {
        this.onReadyToStart();
    }
};

ExperimentStartupScreen.prototype.jumpToJointExpLobby = function () {
    var self = this;
    this.jointExpLobbyModel().initSocketAndListeners();
    this.wizardStep("jointExpLobby");
    this.jointExpLobbyModel().gotMatchedFromServer.subscribe(function (isMatched) {
        if (isMatched) {
            self.onReadyToStart();
        }
    });
};

ExperimentStartupScreen.prototype.onReadyToStart = function () {
    this.wizardStep("readyToStart");
};

ExperimentStartupScreen.prototype.startExp = function () {
    var self = this;

    player.startFullscreen();

    $('#sectionPreload').html("<div style='position: fixed; width: 100%; height: 100%;'>" +
        "<div style='margin: 0; position: absolute; top: 50%; left: 50%;margin-right: -50%; transform: translate(-50%, -50%); font-size: xx-large;'>" + self.expData.staticStrings().start.startingExp + "</div>" +
        "</div>");
    $("#startExpSection").hide();

    setTimeout(function () {
        if (!player.initScreenOrientation()) {
            // need to wait for correct screen orientation:
            $('#sectionPreload').html("<div style='position: fixed; width: 100%; height: 100%;'>" +
                "<div style='margin: 0; position: absolute; top: 50%; left: 50%;margin-right: -50%; transform: translate(-50%, -50%); font-size: xx-large;'>Please rotate your screen.</div>" +
                "</div>");
            var subscriberHandle = player.screenOrientationCurrent.subscribe(function () {
                if (player.checkScreenOrientation()) {
                    // continue startup process:
                    subscriberHandle.dispose();
                    $("#sectionPreload").hide();
                    player.startExperimentContinue();
                }
            })
            return;
        }
        $("#sectionPreload").hide();
        player.startExperimentContinue();
    }, 2000);

};

ExperimentStartupScreen.prototype.init = function (divWidth, divHeight) {
    jdenticon();
    //jdenticon.update("#identicon", this.jdenticonHash());
};
