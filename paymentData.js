
var PaymentData = function(experiment) {
    this.moneyPerSubject = ko.observable(0);
};

PaymentData.prototype.fromJS = function(data) {
    this.moneyPerSubject(data.moneyPerSubject);
};

PaymentData.prototype.toJS = function() {
    return {
        moneyPerSubject: this.moneyPerSubject()
    };
};
