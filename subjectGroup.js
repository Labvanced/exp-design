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
    this.sessionTimeData = ko.observableArray([]).extend({sortById: null});
    this.editName =  ko.observable(false);
    
    this.genderRequirement = ko.observable('all');
    this.ageRequirement = ko.observableArray([0,120]); // min age, max age
    this.countryRequirement = ko.observableArray([]);
    this.languageRequirement = ko.observableArray([]);
    this.selfDefinedRequirements = ko.observableArray([]);

    this.enabledGender = ko.observable(false);
    this.enabledAge = ko.observable(false);
    this.enabledCountry = ko.observable(false);
    this.enabledLanguage = ko.observable(false);

};


SubjectGroup.prototype.addSession = function(session) {
    var sessionTimeSettings  = new SessionTimeData(this.expData);
    this.sessionTimeData.push(sessionTimeSettings);
    this.reAddEntities(this.expData.entities);

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

SubjectGroup.prototype.renameSession = function(idx,flag) {

    if (flag == "true"){
        this.sessions()[idx].editName(true);
    }
    else if (flag == "false"){
        this.sessions()[idx].editName(false);
    }
};


SubjectGroup.prototype.removeSession= function(idx) {
    this.sessionTimeData.splice(idx,1);
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

    this.sessionTimeData(jQuery.map( this.sessionTimeData(), function( id ) {
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

    // add the direct child nodes:
    jQuery.each( this.sessionTimeData(), function( index, elem ) {
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
    this.sessionTimeData(data.sessionTimeData);

    this.genderRequirement(data.genderRequirement);
    this.ageRequirement(data.ageRequirement);

    var countryRequirement = [];
    for (var i=0; i<data.countryRequirement.length; i++) {
        var country = countries_by_code[data.countryRequirement[i]];
        if (country) {
            countryRequirement.push(country);
        }
    }
    this.countryRequirement(countryRequirement);

    var languageRequirement = [];
    for (var i=0; i<data.languageRequirement.length; i++) {
        var language = languages_by_code[data.languageRequirement[i]];
        if (language) {
            languageRequirement.push(language);
        }
    }
    this.languageRequirement(languageRequirement);

    if (data.hasOwnProperty('enabledGender')) {
        this.enabledGender(data.enabledGender);
    }
    if (data.hasOwnProperty('enabledAge')) {
        this.enabledAge(data.enabledAge);
    }
    if (data.hasOwnProperty('enabledCountry')) {
        this.enabledCountry(data.enabledCountry);
    }
    if (data.hasOwnProperty('enabledLanguage')) {
        this.enabledLanguage(data.enabledLanguage);
    }

    this.selfDefinedRequirements(data.selfDefinedRequirements);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
SubjectGroup.prototype.toJS = function() {

    var countryRequirement = [];
    for (var i=0; i<this.countryRequirement().length; i++) {
        countryRequirement.push(this.countryRequirement()[i].code);
    }

    var languageRequirement = [];
    for (var i=0; i<this.languageRequirement().length; i++) {
        languageRequirement.push(this.languageRequirement()[i].code);
    }

    return {
        id: this.id(),
        name: this.name(),
        type: this.type,
        genderRequirement: this.genderRequirement(),
        ageRequirement:this.ageRequirement(),
        countryRequirement: countryRequirement,
        languageRequirement: languageRequirement,
        selfDefinedRequirements: this.selfDefinedRequirements(),
        enabledGender: this.enabledGender(),
        enabledAge: this.enabledAge(),
        enabledCountry: this.enabledCountry(),
        enabledLanguage: this.enabledLanguage(),
        sessions: jQuery.map( this.sessions(), function( elem ) { return elem.id(); } ),
        sessionTimeData: jQuery.map( this.sessionTimeData(), function( elem ) { return elem.id(); } )
    };
};

