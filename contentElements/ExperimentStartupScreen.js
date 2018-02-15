var ExperimentStartupScreen = function(experiment) {
    var self = this;

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

    this.agreeToTermsAndConditions = ko.observable(false);

    this.requiredGender = this.expData.parentExperiment.publishing_data.surveyItemGender;
    this.requiredAge = this.expData.parentExperiment.publishing_data.surveyItemAge;
    this.requiredCountry = this.expData.parentExperiment.publishing_data.surveyItemCountry;
    this.requiredLanguage = this.expData.parentExperiment.publishing_data.surveyItemLanguage;
    this.requiredEmail = this.expData.parentExperiment.publishing_data.surveyItemEmail;

    this.displayBackToLib = this.expData.parentExperiment.publishing_data.displayBackToLib;

    this.wizardStep = ko.observable("selectStudyLanguage");
    this.selectedStudyLanguage = ko.observable(this.expData.translatedLanguages()[0]);

    this.timeToNextSession = ko.observable("");

    this.imgSource = ko.computed( function() {
        return "/files/" + experiment.publishing_data.img_file_id() + "/" + experiment.publishing_data.img_file_orig_name();
    }, this);

    this.errorString = ko.computed(function() {
        var errorString = "";

        // validate if all required fields are filled:
        if (this.requiredGender()== 'required') {
            if (this.selectedGender() != "male" && this.selectedGender() != "female") {
                errorString += self.expData.staticStrings().errorGender + ", ";
            }
        }
        if (this.requiredAge()== 'required') {
            if (!(this.selectedAge() > 0)) {
                errorString += self.expData.staticStrings().errorAge + ", ";
            }
        }
        if (this.requiredCountry()== 'required') {
            if (this.selectedCountry() == null) {
                errorString += self.expData.staticStrings().errorCountry + ", ";
            }
        }
        if (this.requiredLanguage()== 'required') {
            if (this.selectedLanguage() == null) {
                errorString += self.expData.staticStrings().errorLanguage + ", ";
            }
        }
        if (this.requiredEmail()== 'required') {
            if (this.selectedEmail() == null) {
                errorString += self.expData.staticStrings().errorEmail + ", ";
            }
        }

        // remove last comma:
        if (errorString!="") {
            errorString = errorString.substring(0, errorString.length - 2);
        }
        return errorString;
    }, this);

    this.preloadingProgressRounded = ko.computed(function() {
        var progressRounded = Math.round(player.playerPreloader.progress() * 100);
        $("#progressbar .bar").css({
            'width': progressRounded + "%"
        });
        return progressRounded;
    });

    this.selectedStudyLanguage.subscribe(function(newLang) {
        var langIdx = self.expData.translatedLanguages().indexOf(newLang);
        self.expData.currentLanguage(langIdx);
        self.expData.updateLanguage();
    });

    var numLang = this.expData.translatedLanguages().length;
    if (numLang < 2) {
        // directly skip to survey if only one language is defined:
        this.jumpToSurvey();
    }

    this.allowedBrowsers = ko.computed( function() {
          var settings =  self.expData.studySettings;
          var list = [];
        if (settings.allowChrome()){
            list.push("Chrome");
        }
        if (settings.allowFirefox()){
            list.push("Firefox");
        }
        if (settings.allowInternetExplorer()){
            list.push("Microsoft Internet Explorer");
        }
        if (settings.allowEdge()){
            list.push("Microsoft Edge");
        }
        if (settings.allowSafari()){
            list.push("Safari");
        }
        if (settings.allowOpera()){
            list.push("Opera");
        }
        return list;
        }, this);


    this.allowedSystems= ko.computed( function() {
        var settings =  self.expData.studySettings;
        var list = [];
        if (settings.allowAndroidMobile()){
            list.push("androidMobile");
        }
        if (settings.allowAndroidTablet()){
            list.push("androidTablet");
        }
        if (settings.allowIPhone()){
            list.push("iPhone");
        }
        if (settings.allowIPad()){
            list.push("iPad");
        }
        if (settings.allowMac()){
            list.push("Mac");
        }
        if (settings.allowPCWindows()){
            list.push("Windows");
        }
        if (settings.allowPCLinux()){
            list.push("Linux");
        }
        if (settings.allowOtherOS()){
            list.push("others");
        }
        return list;
    }, this);


    this.allowOtherBrowser =  self.expData.studySettings.allowOtherBrowser();

    this.browserAllowed = ko.observable(null);
    this.osAllowed = ko.observable(null);
    this.detectBrowserAndSystemSpecs()


};

ExperimentStartupScreen.prototype.detectBrowserAndSystemSpecs = function() {
    var unknown = '-';

    // screen
    var screenSize = '';
    if (screen.width) {
        var width = (screen.width) ? screen.width : '';
        var height = (screen.height) ? screen.height : '';
        screenSize += '' + width + " x " + height;
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
    else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
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
    else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
        browser = 'Firefox';
        version = nAgt.substring(verOffset + 8);
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
    if (this.allowedBrowsers().indexOf(browser)>=0){
        this.browserAllowed(true);
    }
    else if (isOtherBrowser && this.allowOtherBrowser){
        this.browserAllowed(true);
    }
    else{
        this.browserAllowed(false);
    }


    // system
    var os = "others";
    var clientStrings = [
        {s: 'Windows', r: /(Windows 10.0|Windows NT 10.0)/},
        {s: 'Windows', r: /(Windows 8.1|Windows NT 6.3)/},
        {s: 'Windows', r: /(Windows 8|Windows NT 6.2)/},
        {s: 'Windows', r: /(Windows 7|Windows NT 6.1)/},
        {s: 'Windows', r: /Windows NT 6.0/},
        {s: 'Windows', r: /Windows NT 5.2/},
        {s: 'Windows', r: /(Windows NT 5.1|Windows XP)/},
        {s: 'Windows', r: /(Windows NT 5.0|Windows 2000)/},
        {s: 'Windows', r: /(Win 9x 4.90|Windows ME)/},
        {s: 'Windows', r: /(Windows 98|Win98)/},
        {s: 'Windows', r: /(Windows 95|Win95|Windows_95)/},
        {s: 'Windows', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
        {s: 'Windows', r: /Windows CE/},
        {s: 'Windows', r: /Win16/},

        {s: 'Mac', r: /Mac OS X/},
        {s: 'Mac', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},

        {s: 'Linux', r: /(Linux|X11)/},

        {s: 'Android', r: /Android/},

        {s: 'iPhone', r: /iPhone/},

        {s: 'iPad', r: /iPad/},

        {s: 'others', r: /iPod/},
        {s: 'others', r: /OpenBSD/},
        {s: 'others', r: /SunOS/},
        {s: 'others', r: /QNX/},
        {s: 'others', r: /UNIX/},
        {s: 'others', r: /BeOS/},
        {s: 'others', r: /OS\/2/},
        {s: 'others', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
    ];

    for (var id in clientStrings) {
        var cs = clientStrings[id];
        if (cs.r.test(nAgt)) {
            os = cs.s;
            break;
        }
    }

    if (os == "Android"){
        if (/Mobile/.test(nAgt)){
            os = "androidMobile";
        }
        else{
            os = "androidTablet";
        }
    }

    if (this.allowedSystems().indexOf(os)>=0){
        this.osAllowed(true);
    }
    else{
        this.osAllowed(false);
    }

};




ExperimentStartupScreen.prototype.languageSelected = function () {
    this.jumpToSurvey();
};

ExperimentStartupScreen.prototype.jumpToSurvey = function () {

    if (player.runOnlyTaskId) {
        // directly skip to loading screen (no need to initialize recording session on server):
        player.setSubjectGroupNr(1, 1);
        player.preloadAllContent();
        this.jumpToLoadingScreen();
        return;
    }

    if (player.runOnlyGroupNr && player.runOnlySessionNr) {
        // still need to send data (initialize recording session on server) before loading screen
        player.setSubjectGroupNr(player.runOnlyGroupNr, player.runOnlySessionNr);
        player.preloadAllContent();
        this.sendDataAndContinue();
        return;
    }

    if (player.runOnlyGroupNr) {
        // still need to send data (initialize recording session on server) before loading screen
        player.runOnlySessionNr = "1";
        player.setSubjectGroupNr(player.runOnlyGroupNr, player.runOnlySessionNr);
        player.preloadAllContent();
        this.sendDataAndContinue();
        return;
    }

    if (player.groupNrAssignedByServer && player.sessionNrAssignedByServer) {
        // directly skip to loading screen (recording session already initialized on server:
        player.setSubjectGroupNr(player.groupNrAssignedByServer, player.sessionNrAssignedByServer);
        player.preloadAllContent();
        this.jumpToLoadingScreen();
        return;
    }

    if (this.requiredGender() =='hidden' && this.requiredAge() =='hidden' && this.requiredCountry() =='hidden' && this.requiredLanguage() =='hidden' && this.requiredEmail() =='hidden'){
        this.sendDataAndContinue();
    }
    else{
        this.wizardStep("initialSurvey");
    }

};


ExperimentStartupScreen.prototype.checkSurveyData = function () {
    var self = this;
    this.surveySubmitted(true);
    if (this.errorString() == "") {
      this.sendDataAndContinue();
    }
};

ExperimentStartupScreen.prototype.sendDataAndContinue = function() {

    var self = this;
    var survey_data = {
        selectedGender: this.selectedGender(),
        selectedAge: this.selectedAge(),
        selectedCountry: this.selectedCountry() ? this.selectedCountry().name : null,
        selectedLanguage: this.selectedLanguage() ? this.selectedLanguage().name : null,
        selectedEmail: this.selectedEmail()
    };
    playerAjaxPost('/startFirstPlayerSession',
        {
            expId: player.expId,
            subject_code: player.subject_code,
            token: player.token,
            survey_data: survey_data,
            isTestrun: player.isTestrun,
            runOnlyGroupNr: player.runOnlyGroupNr,
            runOnlySessionNr: player.runOnlySessionNr
        },
        function(data) {
            if (data.hasOwnProperty('success') && data.success == false) {
                if (data.msg == "no matching subject group") {
                    player.finishSessionWithError("We are sorry, but the experiment is currently not available.");
                }
                else {
                    player.finishSessionWithError("Could not initialize first session of experiment. Error Message: " + data.msg);
                }
                return;
            }
            player.selectedEmail = self.selectedEmail();
            player.setSubjectGroupNr(data.groupNr, data.sessionNr);
            player.preloadAllContent();
            self.jumpToLoadingScreen();
        }
    );
};

ExperimentStartupScreen.prototype.jumpToLoadingScreen = function() {
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

ExperimentStartupScreen.prototype.recalcStartingTime = function() {
    var self = this;
    var currentStartWindow = player.getCurrentStartWindow();
    var timeToWait =  player.getDifferenceBetweenDates(currentStartWindow.current,currentStartWindow.start);
    self.timeToNextSession(timeToWait[3]);
    if (timeToWait[3]== 'now'){
        self.checkPreloadingState();
    }
};

ExperimentStartupScreen.prototype.checkPreloadingState = function() {
    var self = this;
    if ( player.preloaderCompleted()) {
        this.wizardStep("readyToStart");
    }
    else {
        player.preloaderCompleted.subscribe(function(newVal) {
            if (newVal) {
                self.wizardStep("readyToStart");
            }
        });
    }
};

ExperimentStartupScreen.prototype.startExp = function() {

    player.startFullscreen();

    $('#sectionPreload').css({
        position:"absolute",
        margin: "0 auto",
        height:"100%",
        width:"100%",
        left:"40%",
        top:"50%"
    });

    $('#sectionPreload').html("<div style='font-size: xx-large;'>"+this.expData.staticStrings().startingExp+"</div>");
    $("#startExpSection").hide();

    // wait for five seconds:
    setTimeout(function(){
        $("#sectionPreload").hide();

        // TODO: this check is not working yet:
        var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled;
        if (fullscreenEnabled){
            player.startExperiment();
        }
    },5000);

};

ExperimentStartupScreen.prototype.init = function(divWidth, divHeight) {
    jdenticon();
    //jdenticon.update("#identicon", this.jdenticonHash());
};
