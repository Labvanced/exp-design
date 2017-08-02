var StudySettings = function (expData) {
    this.expData = expData;

    this.originalLanguage =  ko.observable('English');
    this.currentLanguage = ko.observable(0); // current select languge
};



StudySettings.prototype.setPointers = function(entitiesArr) {

};

StudySettings.prototype.reAddEntities = function(entitiesArr) {

};


StudySettings.prototype.fromJS = function(data) {
    this.originalLanguage(data.originalLanguage);
    this.currentLanguage(data.currentLanguage);
};


StudySettings.prototype.toJS = function() {
    var data = {
        originalLanguage: this.originalLanguage(),
        currentLanguage: this.currentLanguage()
    };
    return data;
};
