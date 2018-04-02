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
    this.workspaceVars = ko.observableArray([]).extend({sortById: null});

    // sub-Structures (serialized below)
    this.elements = ko.observableArray().extend({sortById: null});

};

Sequence.prototype.dispose = function() {
    this.elements().forEach(function (elem){
        elem.dispose();
    });
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


Sequence.prototype.getDeepCopyForPlayer = function() {
    var self = this;

    var entitiesArr = ko.observableArray([]).extend({sortById: null});
    this.reAddEntities(entitiesArr);
    entitiesArr.push(this);

    // loop through array and create deep copies
    var entitiesArrCopy = jQuery.map(entitiesArr(), function (entity) {
        if ( entity instanceof GlobalVar || entity instanceof Factor) { // no deep copy of global variables so that we can keep state across frames.
            return entity;
        }
        else {
            var entityJson = entity.toJS();
            return entityFactory(entityJson, self.expData);
        }
    });
    var entitiesArrCopyObs = ko.observableArray([]).extend({sortById: null});
    entitiesArrCopyObs(entitiesArrCopy);
    jQuery.each( entitiesArrCopy, function( index, elem ) {
        elem.setPointers(entitiesArrCopyObs);
    } );

    // find this frame:
    var deepCopy = entitiesArrCopyObs.byId[this.id()];
    deepCopy.parent = this.parent;
    deepCopy.factorGroup = this.factorGroup;

    return deepCopy;
};

/**
 * sets the factor group:
 */
Sequence.prototype.setFactorGroup = function(factorGroup) {
    this.factorGroup = factorGroup;
};

Sequence.prototype.selectFirstElement = function() {
    this.currSelectedElement(this.elements()[0]);
};

Sequence.prototype.selectPreviousElement = function() {

    var elements = this.elements();
    var nextElement;

    if (!this.currSelectedElement()){
        nextElement = elements[0];
    }
    else {
        var index = elements.indexOf(this.currSelectedElement());
        if (index >0){
            nextElement = elements[index-1];
        }
        else{
            nextElement = elements[index];
        }
    }

    this.currSelectedElement(nextElement);
    return nextElement;
};

Sequence.prototype.selectCustomElement = function(frame) {

    this.currSelectedElement(frame);
    return frame;
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
        nextElement = {
            type:"EndOfSequence"
        };
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
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
Sequence.prototype.getAllModifiers = function(modifiersArr) {
    jQuery.each( this.elements(), function( index, elem ) {
        if (elem.getAllModifiers) {
            elem.getAllModifiers(modifiersArr);
        }
    } );
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


    // convert ids to actual pointers:
    this.workspaceVars(jQuery.map( this.workspaceVars(), function( id ) {
        return entitiesArr.byId[id];
    } ));

    // converter to add all old existing factors to workspace only in editor
   if(window.uc!==undefined){
       this.addAllRemainingFactorToWorkspace();
   }


};

Sequence.prototype.addVariableToWorkspace = function(variable) {
    var isExisting = this.workspaceVars.byId[variable.id()];
    if (!isExisting) {
        this.workspaceVars.push(variable);
    }
};

Sequence.prototype.removeVariableFromWorkspace = function(variable) {
    var isExisting = this.workspaceVars.byId[variable.id()];
    if (isExisting) {
        var idx = this.workspaceVars.indexOf(variable);
        this.workspaceVars().splice(idx,1);
    }

};

Sequence.prototype.addAllRemainingFactorToWorkspace = function(variable) {
    var self = this;
    this.factorGroup.factors().forEach(function (factor) {
        var variable = factor.globalVar();
        var isExisting = self.workspaceVars.byId[variable.id()];
        if (!isExisting) {
            self.workspaceVars.push(variable);
        }
    })
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

    // add the direct child nodes:
    jQuery.each( this.workspaceVars(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id())) {
            entitiesArr.push(elem);
        }
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
    if (data.hasOwnProperty("workspaceVars")) {
        this.workspaceVars(data.workspaceVars);
    }
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
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } ),
        workspaceVars: jQuery.map( this.workspaceVars(), function( variable ) { return variable.id(); } )
    };
};
