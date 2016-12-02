// � by Caspar Goeke and Holger Finger

/**
 * this class stores the information about a specific group of subjects and the corresponding sessions they have to do.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
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

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
SubjectGroup.prototype.setPointers = function(entitiesArr) {
    // convert ids to actual pointers:
    this.sessions(jQuery.map( this.sessions(), function( id ) {
        return entitiesArr.byId[id];
    } ));
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
SubjectGroup.prototype.reAddEntities = function(entitiesArr) {

    // add the direct child nodes:
    jQuery.each( this.sessions(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id()))
            entitiesArr.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        elem.reAddEntities(entitiesArr);
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {SubjectGroup}
 */
SubjectGroup.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.sessions(data.sessions);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
SubjectGroup.prototype.toJS = function() {
    return {
        id: this.id(),
        name: this.name(),
        type: this.type,
        sessions: jQuery.map( this.sessions(), function( elem ) { return elem.id(); } )
    };
};

