var PublishingData = function(experiment) {

    this.experiment = experiment;

    var self = this;
    
    // page 1 //
    this.sharingDesign = ko.observable('onRequest'); // 'none', 'public'
    this.recruitInLibrary = ko.observable(false);
    this.recruitSecretly = ko.observable(false);
    this.recruitExternal= ko.observable(false);
    this.brandingType= ko.observable('LabVanced');
    this.secrecyType= ko.observable('link');
    this.passwordType= ko.observable('oneForAll');
    this.stopCondition= ko.observable(null);
    this.recordingStopDate= ko.observable(null);
    this.recordingStopTime= ko.observable(null);
    this.recordingStopNrSubjects =  ko.observable(1);

    // page 2  //
    this.exp_name = ko.observable(null);
    if (experiment){
        this.exp_name(experiment.exp_name());
    }
    this.description = ko.observable(null);
    this.img_file_id = ko.observable(null);
    this.img_file_orig_name = ko.observable(null);
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
    
    // After publication
    this.individualizedLinks =  ko.observableArray([]);
    this.ratingValues =  ko.observableArray([]);
    this.raterUserIds=  ko.observableArray([]);
    this.authorId = ko.observable('user');
    this.publicationDate =  ko.observable(null);

    // test
    this.ratingValues.push(4);
    this.raterUserIds.push('test');
};


PublishingData.prototype.fromJS = function(data) {

        // page 1 //
        this.sharingDesign(data.sharingDesign);
        this.recruitInLibrary(data.recruitInLibrary);
        this.recruitSecretly(data.recruitSecretly);
        this.recruitExternal(data.recruitExternal);
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

        // After publication
        this.individualizedLinks(data.individualizedLinks);
        this.ratingValues(data.ratingValues);
        this.raterUserIds(data.raterUserIds);
        this.authorId(data.authorId);
        this.publicationDate(data.publicationDate);

};



PublishingData.prototype.toJS = function() {

    return {
        // page 1 //
        sharingDesign:this.sharingDesign(),
        recruitInLibrary: this.recruitInLibrary(),
        recruitSecretly: this.recruitSecretly(),
        recruitExternal: this.recruitExternal(),
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

        // After publication
        individualizedLinks:  this.individualizedLinks(),
        ratingValues:  this.ratingValues(),
        raterUserIds:  this.raterUserIds(),
        authorId: this.authorId(),
        publicationDate: this.publicationDate()

    };
};



