// � by Caspar Goeke and Holger Finger

var GlobalVar = function (expData) {
    this.expData = expData;

    this.id = ko.observable(guid());
    this.name = ko.observable("newVariable");
    this.type = "GlobalVar";
    this.subtype = ko.observable(GlobalVar.subtypes[0].text);
    this.subtypeId = ko.observable(GlobalVar.subtypes[0].id);
    this.dataType = ko.observable("undefined");
    this.assigned = false;
    this.levels = ko.observableArray([]);
};

// enum: posssible variable subtypes..
GlobalVar.subtypes= [
        { id: 1, text: 'undefined' },
        { id: 2, text: 'factor' },
        { id: 3, text: 'stimulus property' },
        { id: 4, text: 'response' },
        { id: 5, text: 'response time' },
        { id: 6, text: 'randomization' }
    ];



GlobalVar.prototype.addSession = function(session) {
    return this.sessions.push(session);
};

GlobalVar.prototype.setPointers = function() {
    var self = this;

    // convert ids to actual pointers:
    this.sessions(jQuery.map( this.sessions(), function( id ) {
        return self.expData.entities.byId[id];
    } ));
};

GlobalVar.prototype.reAddEntities = function() {
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

GlobalVar.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.sessions(data.sessions);
    return this;
};

GlobalVar.prototype.toJS = function() {
    return {
        id: this.id(),
        name: this.name(),
        type: this.type,
        sessions: jQuery.map( this.sessions(), function( elem ) { return elem.id(); } )
    };
};

