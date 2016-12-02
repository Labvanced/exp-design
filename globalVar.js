// � by Caspar Goeke and Holger Finger

/**
 * global variables are used to store recordings and experimental state within the player. Variables are defined in the
 * editor to specify logical operations and recordings for experiments.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var GlobalVar = function (expData) {
    this.expData = expData;

    // serialized:
    this.id = ko.observable(guid());
    this.type = "GlobalVar";
    this.name = ko.observable("newVariable");
    this.dataType = ko.observable("undefined");
    this.scale = ko.observable("undefined");
    this.scope = ko.observable("undefined");
    this.isFactor =  ko.observable(false);
    this.isInteracting = ko.observable(false);
    this.levels = ko.observableArray([]);

    this.resetAtTrialStart = ko.observable(false);
    this.recordAtTrialEnd = ko.observable(false);
    this.startValue = ko.observable(null);

    this.isNameEditable = true; // this is set to false for variables that are created by our platform
    this.isScaleEditable = true; // this is set to false for variables that are created by our platform
    this.isDataTypeEditable = true; // this is set to false for variables that are created by our platform

    // not serialized:
    this.editName =  ko.observable(false);
    this.subLevelEdit = ko.observable(false);
    this.value = ko.observable(null);
    this.backRefs = ko.observableArray([]).extend({sortById: null});
};

// enum definitions:
GlobalVar.scales = ['undefined', 'nominal', 'ordinal', 'interval', 'ratio'];
GlobalVar.dataTypes = ['undefined', 'string', 'numeric', 'boolean', 'categorical', 'datetime', 'timer', 'structure'];
GlobalVar.scopes = ['subject','task','trial'];
GlobalVar.depOrIndepVar = [true, false];
GlobalVar.isRecorded = [true, false];
GlobalVar.isUserWritable = [true, false];

// definition of what dataTypes are allowed for each scale:
GlobalVar.allowedDataTypePerScale = {
    'undefined': ['undefined', 'string', 'numeric', 'boolean', 'categorical', 'datetime', 'timer'],
    'nominal': ['undefined', 'string', 'numeric', 'boolean', 'categorical'],
    'ordinal': ['undefined', 'numeric', 'boolean', 'categorical', 'datetime'],
    'interval': ['undefined', 'numeric', 'datetime', 'timer'],
    'ratio': ['undefined', 'numeric', 'datetime', 'timer']
};
// now create the inverted mapping:
GlobalVar.allowedScalePerDataType = {};
for (var i=0; i<GlobalVar.dataTypes.length; i++){
    GlobalVar.allowedScalePerDataType[GlobalVar.dataTypes[i]] = [];
}
for (var i=0; i<GlobalVar.scales.length; i++){
    var allowedDataTypes = GlobalVar.allowedDataTypePerScale[GlobalVar.scales[i]];
    for (var j=0; j<allowedDataTypes.length; j++){
        GlobalVar.allowedScalePerDataType[allowedDataTypes[j]].push(GlobalVar.scales[i]);
    }
}

GlobalVar.prototype.initProperties = function(dataType, scope, scale, name) {
    this.dataType(dataType);
    this.scope(scope);
    this.scale(scale);
    this.name(name);
    return this;
};

GlobalVar.prototype.resetValue = function() {
    this.value(this.startValue());
};

GlobalVar.prototype.addBackRef = function(entity, parentNamedEntity, isWritten, isRead, refLabel) {
    this.backRefs.push({
        entity: entity,
        parentNamedEntity: parentNamedEntity,
        isWritten: isWritten,
        isRead: isRead,
        refLabel: refLabel
    });
};

GlobalVar.prototype.removeBackRef = function(entity) {
    var backRefs = this.backRefs();
    for (var k=0; k<backRefs.length; k++){
        if (backRefs[k].id == entity.id()) {
            this.backRefs.splice(k, 1);
            break;
        }
    }
};

GlobalVar.prototype.setValue = function(val) {
    // TODO: dataType conversions
    this.value(val);
};

GlobalVar.prototype.getValue = function() {
    // TODO: dataType conversions
    return this.value();
};

GlobalVar.prototype.addLevel = function(factor) {
    var name = "level_"+(this.levels().length+1);
    var level = new Level(name,factor);
    this.levels.push(level);
    return level;
};


GlobalVar.prototype.removeLevel = function() {
    this.levels.pop();
};


GlobalVar.prototype.renameLevel = function(idxLevel,flag) {

    if (flag == "true"){
        this.levels()[idxLevel].editName(true);
        this.subLevelEdit(true);
    }
    else if (flag == "false"){
        this.levels()[idxLevel].editName(false);
        this.subLevelEdit(false);
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
GlobalVar.prototype.setPointers = function(entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVar.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.dataType(data.dataType);
    this.scale(data.scale);
    this.scope(data.scope);
    this.isFactor(data.isFactor);
    this.isInteracting(data.isInteracting);

    if (data.hasOwnProperty('resetAtTrialStart')) {
        this.resetAtTrialStart(data.resetAtTrialStart);
    }
    if (data.hasOwnProperty('recordAtTrialEnd')) {
        this.recordAtTrialEnd(data.recordAtTrialEnd);
    }
    if (data.hasOwnProperty('startValue')) {
        this.startValue(data.startValue);
    }

    this.levels(jQuery.map( data.levels, function( lvlData ) {
        return (new Level()).fromJS(lvlData);
    } ));
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVar.prototype.toJS = function() {
    return {
        id: this.id(),
        name: this.name(),
        dataType: this.dataType(),
        scale: this.scale(),
        scope: this.scope(),
        isFactor: this.isFactor(),
        isInteracting: this.isInteracting(),

        resetAtTrialStart: this.resetAtTrialStart(),
        recordAtTrialEnd: this.recordAtTrialEnd(),
        startValue: this.startValue(),

        type: this.type,
        levels: jQuery.map( this.levels(), function( lvl ) { return lvl.toJS(); } )
    };
};

