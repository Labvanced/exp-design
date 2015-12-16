// � by Caspar Goeke and Holger Finger

var SubjectGroup = function (expData) {
    this.expData = expData;

    this.id = ko.observable(guid());
    this.name = ko.observable("group_1");
    this.type = "SubjectGroup";
    this.sessions = ko.observableArray([]).extend({sortById: null});
    this.editName =  ko.observable(false);
};

SubjectGroup.prototype.addSession = function(session) {
    return this.sessions.push(session);
};

SubjectGroup.prototype.rename = function(idx,flag,data,event) {
    event.stopImmediatePropagation();
    if (flag == "true"){
        this.editName(true);
    }
    else if (flag == "false"){
        this.editName(false);
    }
};


SubjectGroup.prototype.createSession = function() {
    var session = new ExpSession(this.expData);
    var name = "session_" + (this.sessions().length+1);
    session.name(name);
    this.addSession(session);
};

SubjectGroup.prototype.renameSession = function(idx,flag) {

    if (flag == "true"){
        this.sessions()[idx].editName(true);
    }
    else if (flag == "false"){
        this.sessions()[idx].editName(false);
    }
};


SubjectGroup.prototype.removeSession= function(idx) {
    this.sessions.splice(idx,1);
};

SubjectGroup.prototype.setPointers = function() {
    var self = this;

    // convert ids to actual pointers:
    this.sessions(jQuery.map( this.sessions(), function( id ) {
        return self.expData.entities.byId[id];
    } ));
};

SubjectGroup.prototype.reAddEntities = function() {
    var self = this;

    // add the direct child nodes:
    jQuery.each( this.sessions(), function( index, elem ) {
        // check if they are not already in the list:
        if (!self.expData.entities.byId.hasOwnProperty(elem.id()))
            self.expData.entities.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        elem.reAddEntities();
    } );
};

SubjectGroup.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.sessions(data.sessions);
    return this;
};

SubjectGroup.prototype.toJS = function() {
    return {
        id: this.id(),
        name: this.name(),
        type: this.type,
        sessions: jQuery.map( this.sessions(), function( elem ) { return elem.id(); } )
    };
};

