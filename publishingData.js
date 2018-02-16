var PublishingData = function(experiment) {

    this.experiment = experiment;

    var self = this;

    // others
    this.dateLastModified = ko.observable(""); // deprecated
    this.sharingDesign = ko.observable('none'); // 'none', 'public'

    // description  //
    this.exp_name = ko.observable("");
    if (experiment){
        this.exp_name(experiment.exp_name());
    }
    this.description = ko.observable("");
    this.img_file_id = ko.observable(null);
    this.img_file_orig_name = ko.observable(null);
    this.jdenticonHash = ko.observable(guid());
    this.imageType = ko.observable("jdenticon"); // "jdenticon" or "imgfile"
    this.categories = ko.observableArray([]);
    this.affiliation= ko.observable('');
    this.duration = ko.observable(null);
    this.durationMax = ko.observable(null);
    this.references = ko.observableArray([]);
    this.referenceURLs = ko.observableArray([]);
    this.externalnfo = ko.observableArray([]);
    this.externalLinks = ko.observableArray([]);

    
    // recruiting options //
    this.recruitInLibrary = ko.observable(false);
    this.recruitSecretly = ko.observable(false);
    this.recruitViaCrowdsourcing = ko.observable(false);
    this.recruitViaOwnCrowdsourcing = ko.observable(false);
    this.recruitViaCustomLink= ko.observable(false);

    // crowdsourcing
    this.crowdsourcingStatus = ko.observable('inactive');
    this.measuredAverageTime =  ko.observable(null);



    // initial subject survey info
    this.surveyItemGender = ko.observable('hidden');  // hidden, optional, required
    this.surveyItemAge = ko.observable('hidden');
    this.surveyItemCountry = ko.observable('hidden');
    this.surveyItemLanguage = ko.observable('hidden');
    this.surveyItemEmail = ko.observable('hidden');

    this.requiredGender = ko.observable(false);
    this.requiredAge = ko.observable(false);
    this.requiredCountry = ko.observable(false);
    this.requiredLanguage = ko.observable(false);
    this.requiredEmail = ko.observable(false);

    
    // After publication
    this.individualizedLinks =  ko.observableArray([]);
    this.ratingValues =  ko.observableArray([]);
    this.raterUserIds=  ko.observableArray([]);
    this.publicationDate =  ko.observable(null);

    this.displayBackToLib = ko.observable(true);
    this.lastLoadedNrRecordings =  ko.observable(0);
    // test



    this.recruitingEnabled= ko.computed(function () {
        if (self.recruitInLibrary() || self.recruitSecretly() || self.recruitViaCrowdsourcing() || self.recruitViaOwnCrowdsourcing() || self.recruitViaCustomLink()) {
            return true;
        }
        else  {
            return false;
        }
    }, this);



    this.isDescriptionValid = ko.computed(function () {

        if (this.exp_name().length == 0){
            return false;
        }

        if (this.categories().length == 0){
            return false;
        }

        if (this.affiliation() == ''){
            return false;
        }
        if (this.duration() === null){
            return false;
        }

        if (this.durationMax() === null){
            return false;
        }

        if (parseInt(this.durationMax())<=parseInt(this.duration())){
            return false;
        }

        if (this.imageType() == "jdenticon") {
            if (!this.jdenticonHash())
                return false;
        }
        else if (this.imageType() == "imgfile") {
            if (!this.img_file_id())
                return false;
            if (!this.img_file_orig_name())
                return false;
        }

        return true;
    }, this);

    this.errorString = ko.computed(function() {
        var errorString = "";
        if (this.exp_name().length == 0) {
            errorString += "No name, ";
        }
        if (this.categories().length == 0) {
            errorString += "No keyword(s), ";
        }
        if (this.affiliation() == ''){
            errorString += "No affiliation, ";
        }
        if (this.duration() === null){
            errorString += "No minimum time, ";
        }

        if (this.durationMax() === null){
            errorString += "No maximum time, ";
        }


        if (this.imageType() == "jdenticon") {
            if (!this.jdenticonHash()) {
                errorString += "No image, ";
            }
        }
        else if (this.imageType() == "imgfile") {
            if (!this.img_file_id()) {
                errorString += "No image, ";
            }
            if (!this.img_file_orig_name()) {
                errorString += "No image, ";
            }
        }

        // remove last comma:
        if (errorString!="") {
            errorString = errorString.substring(0, errorString.length - 2);
        }
        return errorString;
    }, this);

};

PublishingData.prototype.updateReqProperties = function () {
    // calculate required survey fields (it is required if the field is enabled in any group):
    var someRequirements = false;
    var availableGroups = this.experiment.exp_data.availableGroups();
    for (var i=0; i<availableGroups.length; i++) {
        if (availableGroups[i].enabledGender()) {
            this.surveyItemGender('required');
            this.requiredGender(true);
            someRequirements = true;
        }

        if (availableGroups[i].enabledAge()) {
            this.surveyItemAge('required');
            this.requiredAge(true);
            someRequirements = true;
        }

        if (availableGroups[i].enabledCountry()) {
            this.surveyItemCountry('required');
            this.requiredCountry(true);
            someRequirements = true;
        }

        if (availableGroups[i].enabledLanguage()) {
            this.surveyItemLanguage('required');
            this.requiredLanguage(true);
            someRequirements = true;
        }

        // email is required if more than one session:
        var sessionTimeData = availableGroups[i].sessionTimeData();
        if (sessionTimeData.length > 1) {
            this.surveyItemEmail('required');
            this.requiredEmail(true);
            someRequirements = true;
        }
    }
    return someRequirements
};

PublishingData.prototype.getCurrentDate = function() {
    if (this.experiment.expData){
       var offset =  this.experiment.exp_data.studySettings.timeZoneOffset();
    }
   return getCurrentDate(offset);
};

PublishingData.prototype.setPointers = function() {
    if (this.experiment.exp_data instanceof ExpData) {
        this.updateReqProperties();
    }
};

PublishingData.prototype.fromJS = function(data) {

    this.sharingDesign(data.sharingDesign);

    // description //
    this.exp_name(data.exp_name);
    this.description(data.description);
    this.img_file_id(data.img_file_id);
    this.img_file_orig_name(data.img_file_orig_name);
    this.jdenticonHash(data.jdenticonHash);
    this.imageType(data.imageType);
    this.categories(data.categories);

    if (data.hasOwnProperty('references')) {
        var references = [];
        for (var i = 0; i<data.references.length; i++){
            references.push(ko.observable(data.references[i]));
        }
        this.references(references);
    }

    if (data.hasOwnProperty('referenceURLs')) {
        var referenceURLs = [];
        for (var i = 0; i<data.referenceURLs.length; i++){
            referenceURLs.push(ko.observable(data.referenceURLs[i]));
        }
        this.referenceURLs(referenceURLs);
    }

    if (data.hasOwnProperty('externalnfo')) {
        var externalnfo = [];
        for (var i = 0; i<data.externalnfo.length; i++){
            externalnfo.push(ko.observable(data.externalnfo[i]));
        }
        this.externalnfo(externalnfo);
    }

    if (data.hasOwnProperty('externalLinks')) {
        var externalLinks = [];
        for (var i = 0; i<data.externalLinks.length; i++){
            externalLinks.push(ko.observable(data.externalLinks[i]));
        }
        this.externalLinks(externalLinks);
    }

    if (data.hasOwnProperty('duration')) {
        this.duration(data.duration);
    }
    if (data.hasOwnProperty('durationMax')) {
        this.durationMax(data.durationMax);
    }
    if (data.hasOwnProperty('affiliation')) {
        this.affiliation(data.affiliation);
    }



    // recruiting options //
    this.recruitInLibrary(data.recruitInLibrary);

    if (data.hasOwnProperty('recruitSecretly')  ) {
        this.recruitSecretly(data.recruitSecretly);
    }

    if (data.hasOwnProperty('recruitViaCrowdsourcing') ) {
        this.recruitViaCrowdsourcing(data.recruitViaCrowdsourcing);
    }
    if (data.hasOwnProperty('recruitViaOwnCrowdsourcing') ) {
        this.recruitViaOwnCrowdsourcing(data.recruitViaOwnCrowdsourcing);
    }
    if (data.hasOwnProperty('recruitViaCustomLink') ) {
        this.recruitViaCustomLink(data.recruitViaCustomLink);
    }


    // initial subject survery
    if (data.hasOwnProperty('surveyItemGender')) {
        this.surveyItemGender(data.surveyItemGender);
    }
    if (data.hasOwnProperty('surveyItemAge')) {
        this.surveyItemAge(data.surveyItemAge);
    }
    if (data.hasOwnProperty('surveyItemCountry')) {
        this.surveyItemCountry(data.surveyItemCountry);
    }
    if (data.hasOwnProperty('surveyItemLanguage')) {
        this.surveyItemLanguage(data.surveyItemLanguage);
    }
    if (data.hasOwnProperty('surveyItemEmail')) {
        this.surveyItemEmail(data.surveyItemEmail);
    }


    if (data.hasOwnProperty('crowdsourcingStatus')) {
        this.crowdsourcingStatus(data.crowdsourcingStatus);
    }

    if (data.hasOwnProperty('measuredAverageTime')) {
        this.measuredAverageTime(data.measuredAverageTime);
    }
    if (data.hasOwnProperty('lastLoadedNrRecordings')) {
        this.lastLoadedNrRecordings(data.lastLoadedNrRecordings);
    }




    // After publication
    this.individualizedLinks(data.individualizedLinks);
    this.ratingValues(data.ratingValues);
    this.raterUserIds(data.raterUserIds);
    this.publicationDate(data.publicationDate);

    if (data.hasOwnProperty('displayBackToLib')) {
        this.displayBackToLib(data.displayBackToLib);
    }

};


PublishingData.prototype.toJS = function() {

    var references = [];
    for (var i = 0; i<this.references().length; i++){
        references.push(this.references()[i]());
    }
    var referenceURLs = [];
    for (var i = 0; i<this.referenceURLs().length; i++){
        referenceURLs.push(this.referenceURLs()[i]());
    }
    var externalnfo = [];
    for (var i = 0; i<this.externalnfo().length; i++){
        externalnfo.push(this.externalnfo()[i]());
    }
    var externalLinks = [];
    for (var i = 0; i<this.externalLinks().length; i++){
        externalLinks.push(this.externalLinks()[i]());
    }

    return {

        sharingDesign:this.sharingDesign(),

        // description //
        exp_name: this.exp_name(),
        description: this.description(),
        img_file_id: this.img_file_id(),
        img_file_orig_name: this.img_file_orig_name(),
        jdenticonHash: this.jdenticonHash(),
        imageType: this.imageType(),
        categories: this.categories(),
        affiliation:this.affiliation(),
        duration: this.duration(),
        durationMax:this.durationMax(),
        references:references,
        referenceURLs:referenceURLs,
        externalnfo:externalnfo,
        externalLinks:externalLinks,

        // recruiting options
        recruitInLibrary: this.recruitInLibrary(),
        recruitSecretly: this.recruitSecretly(),
        recruitViaCrowdsourcing: this.recruitViaCrowdsourcing(),
        recruitViaOwnCrowdsourcing: this.recruitViaOwnCrowdsourcing(),
        recruitViaCustomLink: this.recruitViaCustomLink(),

        // crowdsourcing
        crowdsourcingStatus: this.crowdsourcingStatus(),
        measuredAverageTime:this.measuredAverageTime,

        // initial subject survey
        surveyItemGender:this.surveyItemGender(),
        surveyItemAge:this.surveyItemAge(),
        surveyItemCountry:this.surveyItemCountry(),
        surveyItemLanguage:this.surveyItemLanguage(),
        surveyItemEmail:this.surveyItemEmail(),

        // After publication
        individualizedLinks:  this.individualizedLinks(),
        ratingValues:  this.ratingValues(),
        raterUserIds:  this.raterUserIds(),
        publicationDate: this.publicationDate(),

        displayBackToLib: this.displayBackToLib(),
        lastLoadedNrRecordings:this.lastLoadedNrRecordings()


    };
};



