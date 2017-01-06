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
    
    
    this.countries = ko.observableArray(this.country_list);
    this.currentSelectedCountry = ko.observable(null);
    this.currentSelectedLanguage = ko.observable(null);

};

SubjectGroup.prototype.country_list = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia","Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];


SubjectGroup.prototype.addSession = function(session) {
    var sessionTimeSettings  = new SessionTimeData(this.expData);
    this.sessionTimeData.push(sessionTimeSettings);
    
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
    this.countryRequirement(data.countryRequirement);
    this.languageRequirement(data.languageRequirement);
    this.selfDefinedRequirements(data.selfDefinedRequirements);
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
        genderRequirement: this.genderRequirement(),
        ageRequirement:this.ageRequirement(),
        countryRequirement: this.countryRequirement(),
        languageRequirement: this.languageRequirement(),
        selfDefinedRequirements: this.selfDefinedRequirements(),
        sessions: jQuery.map( this.sessions(), function( elem ) { return elem.id(); } ),
        sessionTimeData: jQuery.map( this.sessionTimeData(), function( elem ) { return elem.id(); } )
    };
};

