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

    this.requiredGender = ko.observable(this.expData.parentExperiment.publishing_data.surveyItemGender());
    this.requiredAge = ko.observable(this.expData.parentExperiment.publishing_data.surveyItemAge());
    this.requiredCountry = ko.observable(this.expData.parentExperiment.publishing_data.surveyItemCountry());
    this.requiredLanguage = ko.observable(this.expData.parentExperiment.publishing_data.surveyItemLanguage());
    this.requiredEmail = ko.observable(this.expData.parentExperiment.publishing_data.surveyItemEmail());

    this.wizardStep = ko.observable("selectStudyLanguage");
    this.selectedStudyLanguage = ko.observable(this.expData.translatedLanguages()[0]);




    this.imgSource = ko.computed( function() {
        return "/files/" + experiment.publishing_data.img_file_id() + "/" + experiment.publishing_data.img_file_orig_name();
    }, this);

    this.errorString = ko.computed(function() {
        var errorString = "";

        // validate if all required fields are filled:
        if (this.requiredGender()== 'required') {
            if (this.selectedGender() != "male" && this.selectedGender() != "female") {
                errorString += player.staticStrings().errorGender + ", ";
            }
        }
        if (this.requiredAge()== 'required') {
            if (!(this.selectedAge() > 0)) {
                errorString += player.staticStrings().errorAge + ", ";
            }
        }
        if (this.requiredCountry()== 'required') {
            if (this.selectedCountry() == null) {
                errorString += player.staticStrings().errorCountry + ", ";
            }
        }
        if (this.requiredLanguage()== 'required') {
            if (this.selectedLanguage() == null) {
                errorString += player.staticStrings().errorLanguage + ", ";
            }
        }
        if (this.requiredEmail()== 'required') {
            if (this.selectedEmail() == null) {
                errorString += player.staticStrings().errorEmail + ", ";
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
        player.updateLanguage();
    });

    var numLang = this.expData.translatedLanguages().length;
    if (numLang < 2) {
        // directly skip to survey if only one language is defined:
        this.jumpToSurvey();
    }

};


ExperimentStartupScreen.prototype.languageSelected = function () {
    this.jumpToSurvey();
};

ExperimentStartupScreen.prototype.jumpToSurvey = function () {

    if (player.runOnlyTaskId) {
        // directly skip to loading screen:
        player.setSubjectGroupNr(1, 1);
        player.preloadAllContent();
        this.jumpToLoadingScreen();
        return;
    }

    if (player.runOnlyGroupNr && player.runOnlySessionNr) {
        // directly skip to loading screen:
        player.setSubjectGroupNr(player.runOnlyGroupNr, player.runOnlySessionNr);
        player.preloadAllContent();
        this.jumpToLoadingScreen();
        return;
    }

    if (player.runOnlyGroupNr) {
        // directly skip to loading screen:
        player.setSubjectGroupNr(player.runOnlyGroupNr, 1);
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
        selectedCountry: this.selectedCountry() ? this.selectedCountry().code : null,
        selectedLanguage: this.selectedLanguage() ? this.selectedLanguage().code : null,
        selectedEmail: this.selectedEmail()
    };
    playerAjaxPost('/startFirstPlayerSession',
        {
            expId: player.expId,
            subject_code: player.subject_code,
            survey_data: survey_data,
            isTestrun: player.isTestrun
        },
        function(data) {
            if (data.hasOwnProperty('success') && data.success == false) {
                if (data.msg == "no matching subject group") {
                    player.finishSessionWithError("There is no matching subject group defined which matches your criteria.");
                }
                else {
                    player.finishSessionWithError("Could not initialize first session of experiment. Error Message: " + data.msg);
                }
                return;
            }
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
    var nextStartWindow = player.nextStartWindow;
    if (nextStartWindow.end<nextStartWindow.current){
        // last available session in the past
        this.wizardStep("sessionOver");
    }
    else if (nextStartWindow.start<=nextStartWindow.current && nextStartWindow.end>=nextStartWindow.current)  {
        // currently running
        this.checkPreloadingState();
    }
    else if (nextStartWindow.start>nextStartWindow.current){
        // running in the future
        var timeToWait = player.getDifferenceBetweenDates(nextStartWindow.current,nextStartWindow.start);
        $('#timeToNextSession').text(timeToWait[3]);
        this.wizardStep("sessionNotReady");
        $('#calcStartingTime').click(function(){
            var currentDate = new Date();
            var timeToWait =  player.getDifferenceBetweenDates(currentDate,nextStartWindow.start);
            $('#timeToNextSession').text(timeToWait[3]);
            if (timeToWait[3]== 'ready'){
                self.checkPreloadingState();
            }
        });
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

    launchIntoFullscreen(document.documentElement);

    $('#sectionPreload').css({
        position:"absolute",
        margin: "0 auto",
        height:"100%",
        width:"100%",
        left:"40%",
        top:"50%"
    });

    $('#sectionPreload').html("<div style='font-size: xx-large;'>"+player.staticStrings().startingExp+"</div>");
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
