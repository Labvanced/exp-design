var StudySettings = function (expData) {
    this.expData = expData;

    this.originalLanguage =  ko.observable('English');
    this.translations = ko.observableArray(['English']);

    this.currentLanguage = ko.observable(0); // current select languge
    var self = this;
    this.originalLanguage.subscribe(function(newVal) {
        if (self.translations()[0]) {
            self.translations.splice(0, 1);
        }
        self.translations.splice(0,0,newVal);

    });

    this.translations.subscribe(function(newVal) {
        var test = 1;
    });
};



StudySettings.prototype.setPointers = function(entitiesArr) {

};

StudySettings.prototype.reAddEntities = function(entitiesArr) {

};


StudySettings.prototype.fromJS = function(data) {
    this.originalLanguage(data.originalLanguage);
    this.translations(data.translations);
};


StudySettings.prototype.toJS = function() {
    var data = {
        originalLanguage: this.originalLanguage(),
        translations: this.translations()
    };
    return data;
};
