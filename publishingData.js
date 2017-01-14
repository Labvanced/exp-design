var PublishingData = function(experiment,exp_data) {

    this.experiment = experiment;
    this.exp_data = exp_data;

    var self = this;


    // page 1 //
    this.publishInLibrary = ko.observable(true);
    this.publishSecretly = ko.observable(false);
    this.publishExternal= ko.observable(false);
    this.brandingType= ko.observable('LabVanced');
    this.secrecyType= ko.observable('link');
    this.passwordType= ko.observable('oneForAll');
    this.stopCondition= ko.observable('none');
    this.recordingStopDate= ko.observable(null);
    this.recordingStopTime= ko.observable(null);
    this.recordingStopNrSubjects =  ko.observable(null);

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
    this.currentCategory= ko.observable(null);


    // page 3 //
    this.advertisement = ko.observable(null);
    this.addHighlight= ko.observable(false);
    this.addLabVancedSearch= ko.observable(false);
    this.postOnAMT = ko.observable(null);
    this.amountOfSubjects = ko.observable(0);
    this.amountPerSubject1 =  ko.observable(0);
    this.amountPerSubject2 =  ko.observable(3);
    this.moneyPerSubject =  ko.computed( function() {
        return Math.ceil((self.amountPerSubject1()+self.amountPerSubject2())*100)/100;
    }, this);
    this.moneyPerSubject2 =  ko.observable(self.moneyPerSubject());
    
    this.termsAccepted = ko.observable(false);
    this.copyrightsOk = ko.observable(false);

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


