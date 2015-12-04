// � by Caspar Goeke and Holger Finger

var SubjectGroup = function (expData) {
    this.expData = expData;

    this.id = ko.observable(guid());
    this.name = ko.observable("newGroup");
    this.type = "SubjectGroup";
    this.sessions = ko.observableArray([]).extend({sortById: null});
};

SubjectGroup.prototype.addSession = function(session) {
    return this.sessions.push(session);
};


SubjectGroup.prototype.createSession = function() {
    var session = new ExpSession(this.expData);
    this.addSession(session);
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

