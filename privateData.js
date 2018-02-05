
var PrivateData = function(experiment) {
    this.moneyPerSubject = ko.observable(0);
    this.participationPassword = ko.observable(null);
    this.individualizedLinks =  ko.observableArray([]);
};

PrivateData.prototype.fromJS = function(data) {
    this.moneyPerSubject(data.moneyPerSubject);
    if  (data.hasOwnProperty("participationPassword")) {
        this.participationPassword(data.participationPassword);
    }
    if  (data.hasOwnProperty("individualizedLinks")) {
        this.individualizedLinks(data.individualizedLinks);
    }
};

PrivateData.prototype.toJS = function() {
    return {
        moneyPerSubject: this.moneyPerSubject(),
        participationPassword: this.participationPassword(),
        individualizedLinks: this.individualizedLinks()
    };
};
