// � by Caspar Goeke and Holger Finger

/**
 * This class stores a sequence of frames and pages.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var Sequence = function (expData) {
    this.expData = expData;
    this.currSelectedElement = ko.observable();
    this.parent = null;
    this.factorGroup = null;

    // serialized
    this.id = ko.observable(guid());
    this.type = "Sequence";
    this.name = ko.observable("Sequence");

    // sub-Structures (serialized below)
    this.elements = ko.observableArray().extend({sortById: null});

};

/**
 * Select a specific or multiple trial types.
 *
 * @param {object} selectionSpec - the specification of the trials that are selected:
 * 4 types possible:
 * { type: 'allTrials', factorGroup: facGroup_obj }
 * { type: 'factorLevel', factor: factor_obj, level: level_obj}
 * { type: 'condition', condition: condition_obj }
 * { type: 'trialVariation', trialVariation: trialVariation_obj }
 */
Sequence.prototype.selectTrialType = function(selectionSpec) {
    var elements = this.elements();
    for (var i=0; i<elements.length; i++){
        if (typeof elements[i].selectTrialType === 'function') {
            elements[i].selectTrialType(selectionSpec);
        }
    }
};

/**
 * sets the factor group:
 */
Sequence.prototype.setFactorGroup = function(factorGroup) {
    this.factorGroup = factorGroup;
};

Sequence.prototype.selectNextElement = function() {

    var elements = this.elements();
    var nextElement;

    if (!this.currSelectedElement()){
        nextElement = elements[0];
    }
    else {
        var index = elements.indexOf(this.currSelectedElement());
        nextElement = elements[index+1];
    }

    if (nextElement === undefined) {
        nextElement = "EndOfSequence";
    }

    this.currSelectedElement(nextElement);
    return nextElement;
};

Sequence.prototype.addNewSubElement = function(elem) {
    this.elements.push(elem);
    this.expData.entities.push(elem);
    elem.parent = this;
    if (this.parent.selectionSpec()) {
        elem.selectTrialType(this.parent.selectionSpec());
    }
};

Sequence.prototype.getElementById = function(id) {
    return  this.elements.byId[id];
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Sequence.prototype.setPointers = function(entitiesArr) {
    var self = this;

    // convert ids to actual pointers:
    this.elements(jQuery.map( this.elements(), function( id ) {
        var elem = entitiesArr.byId[id];
        elem.parent = self;
        return elem;
    } ));
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Sequence.prototype.reAddEntities = function(entitiesArr) {
    var self = this;

    // add the direct child nodes:
    jQuery.each( this.elements(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id()))
            entitiesArr.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {Sequence}
 */
Sequence.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.elements(data.elements);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
Sequence.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } )
    };
};
