var PublishingData = function(experiment,exp_data) {

    this.experiment = experiment;
    this.exp_data = exp_data;

    var self = this;

    this.exp_name = ko.observable(experiment.exp_name());
    this.description = ko.observable(experiment.description());
    this.category_id = ko.observable(experiment.category_id());
    this.img_file_id = ko.observable(experiment.img_file_id());
    this.img_file_orig_name = ko.observable(experiment.img_file_orig_name());

    this.termsAccepted = ko.observable(false);
    this.copyrightsOk = ko.observable(false);

    this.publishInLibrary = ko.observable(true);
    this.publishSecretly = ko.observable(false);
    this.publishExternal= ko.observable(false);

    this.categories = ko.observableArray([]);
    this.currentCategory= ko.observable(null);

    this.brandingType= ko.observable('LabVanced');
    this.secrecyType= ko.observable('link');
    this.passwordType= ko.observable('oneForAll');

    this.advertisement = ko.observable(null);
    this.addHighlight= ko.observable(false);
    this.addLabVancedSearch= ko.observable(false);

    this.stopCondition= ko.observable('none');
    this.recordingStopDate= ko.observable(null);
    this.recordingStopTime= ko.observable(null);
    this.recordingStopNrSubjects =  ko.observable(null);

    this.hasToPay =  ko.observable(true);
    
    
    this.postOnAMT = ko.observable(null);

    this.amountOfSubjects = ko.observable(0);
    this.amountPerSubject1 =  ko.observable(0);
    this.amountPerSubject2 =  ko.observable(3);
    
    this.moneyPerSubject =  ko.computed( function() {
        return Math.ceil((self.amountPerSubject1()+self.amountPerSubject2())*100)/100;

    }, this);

    this.moneyPerSubject2 =  ko.observable(self.moneyPerSubject());
    
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


    this.totalFees =  ko.computed( function() {
        return  Math.ceil((self.amazonFees() +self.serviceFee() +self.transactionFeePart())*100)/100;
    }, this);
    

    this.totalTaxes =  ko.computed( function() {
        var interim =  (((self.amountPerSubject1()+self.amountPerSubject2()) *self.amountOfSubjects()) +self.totalFees())*0.19;
        return (Math.ceil(interim*100))/100;
    }, this);
    
    this.moneyTotalRecruitment =  ko.computed( function() {
        var interim =  ((self.amountPerSubject1()+self.amountPerSubject2()) *self.amountOfSubjects()) +self.totalFees() + self.totalTaxes();
        return (Math.ceil(interim*100))/100;
    }, this);




};


