
var PrivateData = function(experiment) {
    this.moneyPerSubject = ko.observable(0);
};

PrivateData.prototype.fromJS = function(data) {
    this.moneyPerSubject(data.moneyPerSubject);
};

PrivateData.prototype.toJS = function() {
    return {
        moneyPerSubject: this.moneyPerSubject()
    };
};
