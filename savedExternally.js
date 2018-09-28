var SavedExternally = function(experiment) {

    this.experiment = experiment;

    this.userName = ko.observable("");
    this.isJointExp = ko.observable(false);
    this.numPartOfJointExp = ko.observable(1);
    this.countries = ko.observable(null);
    this.languages = ko.observable(null);
    this.genders = ko.observable(null);
    this.ages = ko.observable(null);
    this.translatedLanguages = ko.observable(null);
    this.translationsEnabled = ko.observable(false);
    this.totalNrSubjects = ko.observable(0);

};

SavedExternally.prototype.setPointers = function() {
};

SavedExternally.prototype.fromJS = function(data) {


    this.userName(data.userName);
    this.isJointExp(data.isJointExp);
    this.numPartOfJointExp(data.numPartOfJointExp);
    this.countries(data.countries);
    this.languages(data.languages);
    this.genders(data.genders);
    this.ages(data.ages);
    this.translatedLanguages(data.translatedLanguages);
    this.translationsEnabled(data.translationsEnabled);

    if (data.hasOwnProperty('totalNrSubjects')) {
        this.totalNrSubjects(data.totalNrSubjects)
    }
    else{
        this.totalNrSubjects(0);
    }
};


SavedExternally.prototype.createSavedExternallyJS = function() {

};

SavedExternally.prototype.toJS = function() {

    // for external saving
    if (this.experiment.exp_data.availableGroups){
        var groups = this.experiment.exp_data.availableGroups();

        var genders =[];
        groups.forEach(function (group) {
            if (group.enabledGender()){
                if (genders.indexOf(group.genderRequirement())==-1){
                    genders.push(group.genderRequirement());
                }
            }
        });
        if (genders.length==0 || (genders.indexOf("male")>-1 && genders.indexOf("female")>-1)){
            genders = ["All Genders"];
        }

        var countries =[];
        groups.forEach(function (group) {
            var subCoun = group.countryRequirement();
            subCoun.forEach(function (country) {
                if (group.enabledCountry()){
                    if (countries.indexOf(country)==-1){
                        countries.push(country);
                    }
                }

            });
        });
        if (countries.length==0){
            countries.push("All Locations");
        }


        var languages =[];
        groups.forEach(function (group) {
            var subCoun = group.languageRequirement();
            subCoun.forEach(function (country) {
                if (group.enabledLanguage()){
                    if (languages.indexOf(country)==-1){
                        languages.push(country);
                    }
                }

            });
        });
        if (languages.length==0){
            languages.push("All Languages");
        }


        var ages = "";
        var ageFinalMin = null;
        var ageFinalMax = null;
        groups.forEach(function (group) {
            if (group.enabledAge()){
                var ageMin = parseInt(group.ageRequirement()[0]);
                var ageMax =  parseInt(group.ageRequirement()[1]);
                if(ageFinalMin ==null || ageFinalMin>ageMin){
                    ageFinalMin =ageMin;
                }
                if(ageFinalMax ==null || ageFinalMax<ageMax){
                    ageFinalMax =ageMax;
                }
            }
        });
        if (ageFinalMin== null && ageFinalMax==null) {
            ages = "All Ages";
        }
        else if (ageFinalMax==120){
            ages =  ageFinalMin+" or older";
        }
        else if (ageFinalMin==0){
            ages = ageFinalMax+" or younger";
        }
        else if (ageFinalMax!= null  && ageFinalMin!=null){
            ages = ageFinalMin+"-"+ageFinalMax;
        }

        return {
            userName: uc.userdata.username(),
            isJointExp: this.experiment.exp_data.isJointExp(),
            countries:countries,
            ages:ages,
            languages:languages,
            genders:genders,
            numPartOfJointExp:this.experiment.exp_data.numPartOfJointExp(),
            translatedLanguages:this.experiment.exp_data.translatedLanguages(),
            translationsEnabled:this.experiment.exp_data.translationsEnabled(),
            totalNrSubjects: this.experiment.exp_run_data().subjCounterGlobal
        };
    }
    else{
        return {}
    }

};



