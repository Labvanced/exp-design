// � by Caspar Goeke and Holger Finger

/**
 * global variables are used to store recordings and experimental state within the player. Variables are defined in the
 * editor to specify logical operations and recordings for experiments.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var GlobalVar = function (expData) {
    var self = this;
    this.expData = expData;

    // serialized:
    this.id = ko.observable(guid());
    this.type = "GlobalVar";
    this.name = ko.observable("newVariable");
    this.dataType = ko.observable('undefined');
    this.scale = ko.observable('undefined');
    this.scope = ko.observable("undefined");
    this.dataFormat = ko.observable("scalar");
    this.description = ko.observable('variable description');

    this.isFactor =  ko.observable(false);
    this.isInteracting = ko.observable(false); // TODO: remove
    this.levels = ko.observableArray([]);

    this.isRecorded = ko.observable(true);

    this.resetAtTrialStart = ko.observable(false);

    this.recordAtTrialEnd = ko.observable(false);  // is this still needed?

    this.startValue = ko.observable(null);
    this.recType = ko.observable('overwrite'); // overwrite or timeseries


    this.isNameEditable = true; // this is set to false for variables that are created by our platform
    this.isScaleEditable = true; // this is set to false for variables that are created by our platform
    this.isDataTypeEditable = true; // this is set to false for variables that are created by our platform

    // not serialized:
    this.editName =  ko.observable(false);
    this.subLevelEdit = ko.observable(false);
    this.value = ko.observable(null);
    this.backRefs = ko.observableArray([]).extend({sortById: null});
    this.recValue = null; // takes care of buffering

    this.shortName = ko.computed(function() {
        if (self.name()){
            return (self.name().length > 13 ? self.name().substring(0, 12) + '...' : self.name());
        }
        else return '';

    });

    this.unused =  ko.observable(true);
    this.calcUnused();

};


// enum definitions:
GlobalVar.scales = ['nominal', 'ordinal', 'interval', 'ratio','undefined'];
GlobalVar.dataTypes = ['string', 'numeric', 'boolean', 'categorical', 'datetime', 'time','timer', 'structure','undefined'];
GlobalVar.scopes = ['subject','session','task','trial','undefined'];
GlobalVar.dataFormats = ['scalar','array'];
GlobalVar.depOrIndepVar = [true, false];
GlobalVar.isRecorded = [true, false];
GlobalVar.isUserWritable = [true, false];
GlobalVar.recTypes = ['overwrite', 'timeseries']; // open to discussion

// definition of what scales allowed for each datatype:
GlobalVar.allowedScalePerDataType = {
    'undefined': ['nominal', 'ordinal', 'interval', 'ratio','undefined'],
    'string': ['nominal', 'ordinal','undefined'],
    'numeric': ['ordinal', 'interval', 'ratio','undefined'],
    'boolean': ['nominal','undefined'],
    'categorical': ['nominal','undefined'],
    'datetime': ['ordinal', 'interval', 'ratio','undefined'],
    'time': ['ordinal', 'interval', 'ratio','undefined'],
    'timer': ['interval', 'ratio','undefined'],
    'structure': ['undefined']
};

// now create the inverted mapping:
GlobalVar.allowedDataTypePerScale = {
    'undefined': ['undefined', 'string', 'numeric', 'boolean', 'categorical', 'datetime','time', 'timer','structure'],
    'nominal': ['string', 'boolean', 'categorical'],
    'ordinal': ['string', 'numeric', 'datetime','time'],
    'interval': ['numeric', 'datetime','time', 'timer'],
    'ratio': ['numeric', 'datetime', 'time','timer']
};

// definition of icons for each datatype:
GlobalVar.iconPerDataType = {
    'undefined': "/resources/icons/variables/structure.svg",
    'string': "/resources/icons/variables/string.svg",
    'numeric': "/resources/icons/variables/numeric.svg",
    'boolean': "/resources/icons/variables/boolean.svg",
    'categorical': "/resources/icons/variables/categorical.svg",
    'datetime': "/resources/icons/variables/datetime.svg",
    'time': "/resources/icons/variables/datetime.svg",
    'timer': "/resources/icons/variables/timer.svg",
    'structure': "/resources/icons/variables/structure.svg"
};
GlobalVar.iconArrayPerDataType = {
    'undefined': "/resources/icons/variables/array/structure.svg",
    'string': "/resources/icons/variables/array/string.svg",
    'numeric': "/resources/icons/variables/array/numeric.svg",
    'boolean': "/resources/icons/variables/array/boolean.svg",
    'categorical': "/resources/icons/variables/array/categorical.svg",
    'datetime': "/resources/icons/variables/array/datetime.svg",
    'time': "/resources/icons/variables/array/datetime.svg",
    'timer': "/resources/icons/variables/array/timer.svg",
    'structure': "/resources/icons/variables/array/structure.svg"
};

GlobalVar.prototype.getIconPath = function() {
    if (this.dataFormat() === "array") {
        return GlobalVar.iconArrayPerDataType[this.dataType()];
    }
    else {
        return GlobalVar.iconPerDataType[this.dataType()];
    }
};

GlobalVar.prototype.initProperties = function(dataType, scope, scale, name) {
    this.dataType(dataType);
    this.scope(scope);
    this.scale(scale);
    this.name(name);
    return this;
};

GlobalVar.prototype.changeDataType = function(dataType) {
    this.dataType(dataType);

    // convert old value to new value:
    var oldStartValue = this.startValue();
    var oldValue = this.value();
    this.resetStartValue();
    if (oldStartValue.value()!=null){
        this.startValue().setValue(oldStartValue);
    }
    if (oldValue.value()!=null) {
        this.value().setValue(oldValue);
    }
};

GlobalVar.prototype.initValue = function() {
    this.value(this.createValueFromDataType());
    this.resetValueToStartValue();
};

GlobalVar.prototype.resetValueToStartValue = function() {
    this.value().fromJS(this.startValue().toJS());
};

GlobalVar.prototype.resetStartValue = function() {
    var startValue = this.createValueFromDataType();
    this.startValue(startValue);
    this.initValue();
};

GlobalVar.prototype.createScalarValueFromDataType = function() {
    switch (this.dataType()) {
        case 'string':
            return new GlobalVarValueString(this);
        case 'numeric':
            return new GlobalVarValueNumeric(this);
        case 'boolean':
            return new GlobalVarValueBoolean(this);
        case 'categorical':
            return new GlobalVarValueCategorical(this);
        case 'datetime':
            return new GlobalVarValueDatetime(this);
        case 'time':
            return new GlobalVarValueTime(this);
        case 'timer':
            return new GlobalVarValueTimer(this);
        case 'structure':
            return new GlobalVarValueStructure(this);
        case 'undefined':
            return new GlobalVarValueUndefined(this);
    }
};

GlobalVar.prototype.createValueFromDataType = function() {
    if (this.dataFormat() == "array") {
        var val = new GlobalVarValueArray(this);
        // add a first element to the empty array:
        val.value.push(this.createScalarValueFromDataType());
        return val;
    }
    else {
        return this.createScalarValueFromDataType();
    }
};

GlobalVarRef = function (entity, parentNamedEntity, isWritten, isRead, refLabel) {
    this.entity =  entity;
    this.parentNamedEntity =  parentNamedEntity;
    this.isWritten =  isWritten;
    this.isRead = isRead;
    this.refLabel = refLabel;
};

GlobalVar.prototype.addBackRef = function(entity, parentNamedEntity, isWritten, isRead, refLabel) {
    // only add back references in editor for variables view:
    if (window.uc!==undefined && (uc instanceof Client)) {
        var obj = new GlobalVarRef(entity, parentNamedEntity, isWritten, isRead, refLabel);
        this.backRefs.push(obj);
        this.calcUnused();
        return obj;
    }

};

GlobalVar.prototype.removeBackRef = function(entity) {
    var backRefs = this.backRefs();
    if(entity instanceof GlobalVarRef){
        for (var k = 0; k < backRefs.length; k++) {
            if (backRefs[k] == entity) {
                this.backRefs.splice(k, 1);
                this.calcUnused();
                break;
            }
        }
    }
    else {
        for (var k = 0; k < backRefs.length; k++) {
            if (backRefs[k].entity == entity) {
                this.backRefs.splice(k, 1);
                this.calcUnused();
                break;
            }
        }
    }

};

GlobalVar.prototype.calcUnused = function() {
    if (this.backRefs().length>0){
        if (this.backRefs().length==1 && this.backRefs()[0].refLabel=="workspace variable"){
            this.unused(true);
        }
        else{
            this.unused(false);
        }
    }
    else{
        this.unused(true);
    }
};

/**
 * this function needs to be called in the player always when the value changes so that recordings are made.
 * @param val
 */
GlobalVar.prototype.notifyValueChanged = function() {
    if (this.value()) {
        if (this.recType()=='timeseries') {
            if (!this.recValue) {
                this.recValue = [];
            }
            this.recValue.push({
                timeStamp: new Date().getTime(),
                value: this.value().toJS()
            });
        }
    }
};

/**
 * This is used by the player to retireve the recording at the end of a trial
 */
GlobalVar.prototype.getRecAtEndOfTrial = function() {
    if(this.recType()=='overwrite'){
        return this.value().toJS();
    } else if(this.recType()=='timeseries'){
        var recValue = this.recValue;
        this.recValue = [];
        return recValue;
    }
};

GlobalVar.prototype.getValue = function() {
    // TODO: check datatypes and maybe convert here...
    return this.value().value();
};

/**
 * modify the value either by a supplying a globalVarValue instance or a javascript string or number
 * @param valueObj
 */
GlobalVar.prototype.setValue = function(valueObj) {
    this.value().setValue(valueObj);
};

GlobalVar.prototype.addLevel = function() {
    var level = new Level(this);
    level.name("level_"+(this.levels().length+1));
    level.levelIdx = this.levels().length;
    this.levels.push(level);
    return level;
};

GlobalVar.prototype.removeLevel = function(idx) {
    this.levels.splice(idx,1);
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
    this.calcUnused()
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {GlobalVar}
 */
GlobalVar.prototype.fromJS = function(data) {
    var self = this;
    this.id(data.id);
    this.name(data.name);
    this.dataType(data.dataType);
    this.scale(data.scale);
    this.scope(data.scope);
    if (data.hasOwnProperty('dataFormat')) {
        this.dataFormat(data.dataFormat);
    }
    this.isFactor(data.isFactor);
    this.isRecorded(data.isRecorded);
    this.isInteracting(data.isInteracting);
    if (data.hasOwnProperty('resetAtTrialStart')) {
        this.resetAtTrialStart(data.resetAtTrialStart);
    }
    if (data.hasOwnProperty('recordAtTrialEnd')) {
        this.recordAtTrialEnd(data.recordAtTrialEnd);
    }
    if (data.hasOwnProperty('recType')) {
        this.recType(data.recType);
    }
    if (data.hasOwnProperty('startValue')) {
        var startValue = this.createValueFromDataType();
        if (startValue) {
            startValue.fromJS(data.startValue);
            this.startValue(startValue);
            this.initValue();
        }
        else {
            console.log("error: startValue.type is not found");
        }
    }
    else {
        this.resetStartValue();
    }
    if (data.hasOwnProperty('description')) {
        this.description(data.description);
    }



    this.levels(jQuery.map( data.levels, function( lvlData, index ) {
        var lvl = new Level(self);
        lvl.levelIdx = index;
        lvl.fromJS(lvlData);
        return lvl;
    } ));
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
GlobalVar.prototype.toJS = function() {
    var startValue = null;
    if (this.startValue()){
        startValue = this.startValue().toJS();
    }
    return {
        id: this.id(),
        name: this.name(),
        dataType: this.dataType(),
        scale: this.scale(),
        scope: this.scope(),
        dataFormat: this.dataFormat(),
        isFactor: this.isFactor(),
        isInteracting: this.isInteracting(),
        description:this.description(),

        resetAtTrialStart: this.resetAtTrialStart(),
        recordAtTrialEnd: this.recordAtTrialEnd(),
        startValue: startValue,
        isRecorded:this.isRecorded(),
        recType: this.recType(),

        type: this.type,
        levels: jQuery.map( this.levels(), function( lvl ) { return lvl.toJS(); } )
    };
};

