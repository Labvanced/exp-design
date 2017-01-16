var publishing_data = function(experiment) {

    this.experiment = experiment;

    var self = this;

    // page 4 //
    this.termsAccepted = ko.observable(false);
    this.copyrightsOk = ko.observable(false);
    this.materialOk = ko.observable(false);
    this.moneyforAccountUpgrade = ko.observable(0);
    this.moneyforLicense = ko.observable(0);
    this.addSpaceInMB = ko.observable(0);
    this.addNrStudiesToPublish= ko.observable(0);
    this.addRecordingsPerWeek= ko.observable(0);
    this.upgradeLevel= ko.observable(0);


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

    this.secretPublicationCosts =  ko.computed( function() {
        if(self.publishSecretly()){
            if (self.secrecyType()=='password'){
                if (self.passwordType()=='individual'){
                    return 89.99
                }
                else{
                    return 59.99
                }
            }
            else{
                return 39.99
            }
        }
        else{
            return 0;
        }
    }, this);


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
    this.amountPerSubject1 =  ko.observable(0);
    this.amountPerSubject2 =  ko.observable(3);
    this.moneyPerSubject =  ko.computed( function() {
        return Math.ceil((self.amountPerSubject1()+self.amountPerSubject2())*100)/100;
    }, this);
    this.moneyPerSubject2 =  ko.observable(self.moneyPerSubject());


    this.advertisementFee =  ko.computed( function() {
        if (self.addHighlight()){
          if (self.addLabVancedSearch()){
            return 5.99+19.99;
          }
          else{
              return 5.99;
          }
        }
        else if (self.addLabVancedSearch()){
            return 19.99;
        }
        else{
            return 0;
        }
    }, this);
    
    
    this.moneySumOverSubjects =  ko.computed( function() {
        return Math.ceil((self.amountPerSubject1()+self.amountPerSubject2()) *self.amountOfSubjects()*100)/100;

    }, this);

    this.amazonFees=  ko.computed( function() {
        return Math.ceil((((self.amountPerSubject1()+self.amountPerSubject2()) *self.amountOfSubjects())*0.4)*100)/100;
    }, this);

    this.serviceFee=  ko.computed( function() {
        return Math.ceil((((self.amountPerSubject1()+self.amountPerSubject2()) *self.amountOfSubjects())*0.08)*100)/100;
    }, this);
    
    this.transactionFeePart =  ko.computed( function() {
        var interim =  (((self.amountPerSubject1()+self.amountPerSubject2()) *self.amountOfSubjects()) + self.amazonFees() +self.serviceFee())*0.05 ;
        return (Math.ceil(interim*100))/100;
    }, this);


    this.totalFeesSubj =  ko.computed( function() {
        return  Math.ceil((self.amazonFees() +self.serviceFee() +self.transactionFeePart())*100)/100;
    }, this);


    this.totalWithoutTaxesSubj =  ko.computed( function() {
        var interim =  ((self.amountPerSubject1()+self.amountPerSubject2()) *self.amountOfSubjects()) +self.totalFeesSubj();
        return (Math.ceil(interim*100))/100;
    }, this);

    this.totalTaxesSubj =  ko.computed( function() {
        var interim =  (((self.amountPerSubject1()+self.amountPerSubject2()) *self.amountOfSubjects()) +self.totalFeesSubj())*0.19;
        return (Math.ceil(interim*100))/100;
    }, this);
    
    this.moneyTotalRecruitment =  ko.computed( function() {
        var interim =  ((self.amountPerSubject1()+self.amountPerSubject2()) *self.amountOfSubjects()) +self.totalFeesSubj() + self.totalTaxesSubj();
        return (Math.ceil(interim*100))/100;
    }, this);


    this.moneyPerSubject2.subscribe(function(value) {

        if (self.amountPerSubject1 ()!= Math.floor(value/10)*10) {
            self.amountPerSubject1(Math.floor(value/10)*10);
        }
        if (self.amountPerSubject2 ()!= value % 10) {
            self.amountPerSubject2( value % 10);
        }
    });

    this.amountPerSubject1.subscribe(function(value) {
        if (self.moneyPerSubject2 ()!= self.moneyPerSubject()) {
            self.moneyPerSubject2(self.moneyPerSubject());
        }
        $( "#amountMoneyPerSubject1" ).slider( "option", "value", value );
    });

    this.amountPerSubject2.subscribe(function(value) {
        if (self.moneyPerSubject2 ()!= self.moneyPerSubject()) {
            self.moneyPerSubject2(self.moneyPerSubject());
        }
        $( "#amountMoneyPerSubject2" ).slider( "option", "value", value );
    });
    

};



publishing_data.prototype.fromJS = function(data) {

        // page 4 //
        this.termsAccepted(data.termsAccepted);
        this.copyrightsOk(data.copyrightsOk);
        this.materialOk(data.materialOk);
        this.moneyforAccountUpgrade(data.moneyforAccountUpgrade);
        this.moneyforLicense(data.moneyforLicense);
        this.addSpaceInMB(data.addSpaceInMB);
        this.addNrStudiesToPublish(data.addNrStudiesToPublish);
        this.addRecordingsPerWeek(data.addRecordingsPerWeek);
        this.upgradeLevel(data.upgradeLevel);

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
        this.amountPerSubject1(data.amountPerSubject1);
        this.amountPerSubject2(data.amountPerSubject2);
        this.moneyPerSubject2(data.moneyPerSubject2);

};



publishing_data.prototype.toJS = function() {

    return {
        // page 4 //
        termsAccepted: this.termsAccepted(),
        copyrightsOk: this.copyrightsOk(),
        materialOk: this.materialOk(),
        moneyforAccountUpgrade: this.moneyforAccountUpgrade(),
        moneyforLicense:this.moneyforLicense(),
        addSpaceInMB:this.addSpaceInMB(),
        addNrStudiesToPublish:this.addNrStudiesToPublish(),
        addRecordingsPerWeek:this.addRecordingsPerWeek(),
        upgradeLevel:this.upgradeLevel(),


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
        amountPerSubject1: this.amountPerSubject1(),
        amountPerSubject2: this.amountPerSubject2(),
        moneyPerSubject2: this.moneyPerSubject2()
    };
};



