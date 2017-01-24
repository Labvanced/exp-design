var PublishingData = function(experiment) {

    this.experiment = experiment;
    
    // page 1 //
    this.sharing = ko.observable('onRequest');
    this.publishInLibrary = ko.observable(false);
    this.publishSecretly = ko.observable(false);
    this.publishExternal= ko.observable(false);
    this.brandingType= ko.observable('LabVanced');
    this.secrecyType= ko.observable('link');
    this.passwordType= ko.observable('oneForAll');
    this.stopCondition= ko.observable(null);
    this.recordingStopDate= ko.observable(null);
    this.recordingStopTime= ko.observable(null);
    this.recordingStopNrSubjects =  ko.observable(1);

    // page 2  //
    this.exp_name = ko.observable(experiment.exp_name());
    this.description = ko.observable(experiment.description());
    this.category_id = ko.observable(experiment.category_id());
    this.img_file_id = ko.observable(experiment.img_file_id());
    this.img_file_orig_name = ko.observable(experiment.img_file_orig_name());
    this.jdenticonHash = ko.observable(guid());
    this.imageType = ko.observable("jdenticon"); // "jdenticon" or "imgfile"
    this.categories = ko.observableArray([]);

    // page 3 //
    this.advertisement = ko.observable(null);
    this.addHighlight= ko.observable(false);
    this.addLabVancedSearch= ko.observable(false);
    this.postOnAMT = ko.observable(null);
    this.termsCrowdsourcing = ko.observable(false);
    this.amountOfSubjects = ko.observable(0);

    // page 4 //
    this.termsAccepted = ko.observable(false);
    this.copyrightsOk = ko.observable(false);
    this.materialOk = ko.observable(false);
    this.addSpaceInMB = ko.observable(0);
    this.addNrStudiesToPublish= ko.observable(0);
    this.addRecordingsPerWeek= ko.observable(0);
    this.upgradeLevel= ko.observable(0);

};


PublishingData.prototype.fromJS = function(data) {

        // page 1 //
        this.sharing(data.sharing);
        this.publishInLibrary(data.publishInLibrary);
        this.publishSecretly(data.publishSecretly);
        this.publishExternal(data.publishExternal);
        this.brandingType(data.brandingType);
        this.secrecyType(data.secrecyType);
        this.passwordType(data.passwordType);
        this.stopCondition(data.stopCondition);
        this.recordingStopDate(data.recordingStopDate);
        this.recordingStopTime(data.recordingStopTime);
        this.recordingStopNrSubjects(data.recordingStopNrSubjects);

        // page 2  //
        this.exp_name(data.exp_name);
        this.description(data.description);
        this.category_id(data.category_id);
        this.img_file_id(data.img_file_id);
        this.img_file_orig_name(data.img_file_orig_name);
        this.jdenticonHash(data.jdenticonHash);
        this.imageType(data.imageType);
        this.categories(data.categories);

        // page 3 //
        this.advertisement(data.advertisement);
        this.addHighlight(data.addHighlight);
        this.addLabVancedSearch(data.addLabVancedSearch);
        this.postOnAMT(data.postOnAMT);
        this.termsCrowdsourcing(data.termsCrowdsourcing);
        this.amountOfSubjects(data.amountOfSubjects);

        // page 4 //
        this.termsAccepted(data.termsAccepted);
        this.copyrightsOk(data.copyrightsOk);
        this.materialOk(data.materialOk);
        this.addSpaceInMB(data.addSpaceInMB);
        this.addNrStudiesToPublish(data.addNrStudiesToPublish);
        this.addRecordingsPerWeek(data.addRecordingsPerWeek);
        this.upgradeLevel(data.upgradeLevel);

};



PublishingData.prototype.toJS = function() {

    return {
        // page 1 //
        sharing:this.sharing(),
        publishInLibrary: this.publishInLibrary(),
        publishSecretly: this.publishSecretly(),
        publishExternal: this.publishExternal(),
        brandingType: this.brandingType(),
        secrecyType: this.secrecyType(),
        passwordType: this.passwordType(),
        stopCondition: this.stopCondition(),
        recordingStopDate: this.recordingStopDate(),
        recordingStopTime: this.recordingStopTime(),
        recordingStopNrSubjects: this.recordingStopNrSubjects(),

        // page 2  //
        exp_name: this.exp_name(),
        description: this.description(),
        category_id: this. category_id(),
        img_file_id: this.img_file_id(),
        img_file_orig_name: this.img_file_orig_name(),
        jdenticonHash: this.jdenticonHash(),
        imageType: this.imageType(),
        categories: this.categories(),

        // page 3 //
        advertisement: this.advertisement(),
        addHighlight: this.addHighlight(),
        addLabVancedSearch: this.addLabVancedSearch(),
        postOnAMT : this.postOnAMT(),
        termsCrowdsourcing: this.termsCrowdsourcing(),
        amountOfSubjects: this.amountOfSubjects(),
        
        // page 4 //
        termsAccepted: this.termsAccepted(),
        copyrightsOk: this.copyrightsOk(),
        materialOk: this.materialOk(),
        addSpaceInMB:this.addSpaceInMB(),
        addNrStudiesToPublish:this.addNrStudiesToPublish(),
        addRecordingsPerWeek:this.addRecordingsPerWeek(),
        upgradeLevel:this.upgradeLevel(),

    };
};



