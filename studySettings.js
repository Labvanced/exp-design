var StudySettings = function (expData) {
    this.expData = expData;

    this.studySettings = this.expData.studySettings;
    this.originalLanguage =  ko.observable('English');
    this.currentLanguage = ko.observable(0); // current select languge
    this.timeZoneOffset = ko.observable(0);
};
StudySettings.prototype.timezones = ["-11", "-10", "-9", "-8", "-7", "-6", "-5", "-4", "-3", "-2", "-1", "0","+1","+2","+3","+4","+5","+6","+7","+8","+9","+10","+11","+12"];


StudySettings.prototype.setPointers = function(entitiesArr) {

};

StudySettings.prototype.reAddEntities = function(entitiesArr) {

};




StudySettings.prototype.fromJS = function(data) {
    this.originalLanguage(data.originalLanguage);
    this.currentLanguage(data.currentLanguage);
    this.timeZoneOffset(data.timeZoneOffset);

};


StudySettings.prototype.toJS = function() {
    var data = {
        originalLanguage: this.originalLanguage(),
        currentLanguage: this.currentLanguage(),
        timeZoneOffset: this.timeZoneOffset()
    };
    return data;
};
