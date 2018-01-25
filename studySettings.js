var StudySettings = function (expData) {
    this.expData = expData;

    this.studySettings = this.expData.studySettings;
    this.timeZoneOffset = ko.observable(0);
    this.bgColor = ko.observable('#ffffff')
    this.allowSTRGQ = ko.observable(true);
};
StudySettings.prototype.timezones = ["-11", "-10", "-9", "-8", "-7", "-6", "-5", "-4", "-3", "-2", "-1", "0","+1","+2","+3","+4","+5","+6","+7","+8","+9","+10","+11","+12"];


StudySettings.prototype.setPointers = function(entitiesArr) {

};

StudySettings.prototype.reAddEntities = function(entitiesArr) {

};




StudySettings.prototype.fromJS = function(data) {
    this.timeZoneOffset(data.timeZoneOffset);
    if (data.hasOwnProperty("bgColor")){
        this.bgColor(data.bgColor);
    }
    if (data.hasOwnProperty("allowSTRGQ")){
        this.allowSTRGQ(data.allowSTRGQ);
    }



};


StudySettings.prototype.toJS = function() {
    var data = {
        timeZoneOffset: this.timeZoneOffset(),
        bgColor:this.bgColor(),
        allowSTRGQ:this.allowSTRGQ()
    };
    return data;
};
