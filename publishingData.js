var PublishingData = function(experiment) {

    this.experiment = experiment;

    var self = this;

    // others
    this.dateLastModified = ko.observable(getCurrentDate());
    
    // page 1 //
    this.sharingDesign = ko.observable('none'); // 'none', 'public'
    this.recruitInLibrary = ko.observable(false);
    this.recruitSecretly = ko.observable(false);
    this.recruitExternal= ko.observable(false);
    this.recruitingEnabled= ko.computed(function () {
        if (self.recruitInLibrary() || self.recruitSecretly() || self.recruitExternal()) {
            return true;
        }
        else  {
            return false;
        }
    }, this);

    this.brandingType= ko.observable('LabVanced');
    this.secrecyType= ko.observable('link');
    this.passwordType= ko.observable('oneForAll');
    this.stopCondition= ko.observable('none');
    this.recordingStopDate= ko.observable(null);
    this.recordingStopTime= ko.observable(null);
    this.recordingStopNrSubjects =  ko.observable(1);

    // page 2  //
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

    // page 3 //
    this.advertisement = ko.observable(null);
    this.addHighlight= ko.observable(false);
    this.addLabVancedSearch= ko.observable(false);
    this.postOnAMT = ko.observable("no");
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
    this.publicationDate =  ko.observable(null);

    // test
    this.ratingValues.push(4);
    this.raterUserIds.push('test');


    this.isDescriptionValid = ko.computed(function () {

        if (this.exp_name().length == 0)
            return false;

        if (this.description().length == 0)
            return false;

        if (this.categories().length == 0)
            return false;

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
        if (this.description().length == 0) {
            errorString += "No description, ";
        }
        if (this.categories().length == 0) {
            errorString += "No categories, ";
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

PublishingData.prototype.fromJS = function(data) {

    if (data.hasOwnProperty('dateLastModified')) {
        this.dateLastModified(data.dateLastModified);
    }

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
    this.publicationDate(data.publicationDate);

};


PublishingData.prototype.toJS = function() {

    return {
        dateLastModified: this.dateLastModified(),

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
        publicationDate: this.publicationDate(),

    };
};



