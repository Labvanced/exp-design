// � by Caspar Goeke and Holger Finger

/**
 * a level of a factor.
 *
 * @param {string} name - the name of the level
 * @constructor
 */
var Level = function (name) {
    this.type = "Level";
    this.name = ko.observable(name);
    this.editName =  ko.observable(false);

};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Level.prototype.setPointers = function(entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {Level}
 */
Level.prototype.fromJS = function(data) {

    this.name(data.name);
    this.type = data.type;
    this.editName(data.editName);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
Level.prototype.toJS = function() {
    return {

        name: this.name(),
        type: this.type,
        editName: this.editName()
    };
};

