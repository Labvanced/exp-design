// © by Caspar Goeke and Holger Finger

var SubjectGroup = function () {

    this.sessions = ko.observableArray([]);

    this.name = ko.observable("newGroup");
    var session1 = new Session();
    this.sessions.push(session1);
};


SubjectGroup.prototype.setPointers = function() {
    this.sessions.setPointers();
};

SubjectGroup.prototype.fromJS = function(group_data) {
    var sessions = [];
    if (group_data.hasOwnProperty('sessions')) {
        for (var i= 0, len=group_data.sessions.length; i<len; i++) {
            this.sessions.push(new Session());
            sessions[i].fromJS(group_data.sessions[i]);
        }
    }
    this.sessions(sessions);
    return this;
};



SubjectGroup.prototype.toJS = function() {
    return {
        sessions: this.sessions.toJS()
    };
};

