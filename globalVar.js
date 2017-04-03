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
    this.dataType = ko.observable(null);
    this.scale = ko.observable(null);
    this.scope = ko.observable("undefined");
    this.isFactor =  ko.observable(false);
    this.isInteracting = ko.observable(false); // TODO: remove
    this.levels = ko.observableArray([]);

    this.isRecorded = ko.observable(true);

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

    this.recType = ko.observable('overwrite'); // maybe last and series?
    this.recValue = null; // takes care of buffering

    this.shortName = ko.computed(function() {
        if (self.name()){
            return (self.name().length > 13 ? self.name().substring(0, 12) + '...' : self.name());
        }
        else return ''

    });

    // subscribe to value for buffering
    this.value.subscribe(function (newValue) {
        if(self.recType()=='overwrite'){
            if(!self.recValue){
                self.recValue = ko.observable(newValue);
            }
            else{
                self.recValue(newValue);
            }
        } else if(self.recType()=='stack'){
            if(!self.recValue){
                self.recValue = ko.observableArray([]);
            }
            var rec = {
              timeStamp:    new Date().getTime(),
              value:        newValue
            };

            this.recValue.push(rec);
        }
    }, this);

};


// enum definitions:
GlobalVar.scales = ['nominal', 'ordinal', 'interval', 'ratio','undefined'];
GlobalVar.dataTypes = ['string', 'numeric', 'boolean', 'categorical', 'datetime', 'timer', 'structure','undefined'];
GlobalVar.scopes = ['subject','task','trial'];
GlobalVar.depOrIndepVar = [true, false];
GlobalVar.isRecorded = [true, false];
GlobalVar.isUserWritable = [true, false];
GlobalVar.recTypes = ['overwrite', 'stack']; // open to discussion

// definition of what scalesallowed for each datatype:
GlobalVar.allowedScalePerDataType = {
    'undefined': ['nominal', 'ordinal', 'interval', 'ratio','undefined'],
    'string': ['nominal', 'ordinal','undefined'],
    'numeric': ['ordinal', 'interval', 'ratio','undefined'],
    'boolean': ['nominal','undefined'],
    'categorical': ['nominal','undefined'],
    'datetime': ['ordinal', 'interval', 'ratio','undefined'],
    'timer': ['interval', 'ratio','undefined'],
    'structure': ['undefined']
};





// now create the inverted mapping:
GlobalVar.allowedDataTypePerScale = {
    'undefined': ['undefined', 'string', 'numeric', 'boolean', 'categorical', 'datetime', 'timer','structure'],
    'nominal': ['string', 'boolean', 'categorical'],
    'ordinal': ['string', 'numeric', 'datetime'],
    'interval': ['numeric', 'datetime', 'timer'],
    'ratio': ['numeric', 'datetime', 'timer']
};



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

GlobalVar.prototype.addLevel = function() {
    var level = new Level(this);
    level.name("level_"+(this.levels().length+1));
    level.levelIdx = this.levels().length;
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
    var self = this;
    this.id(data.id);
    this.name(data.name);
    this.dataType(data.dataType);
    this.scale(data.scale);
    this.scope(data.scope);
    this.isFactor(data.isFactor);
    this.isRecorded(data.isRecorded);
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
        isRecorded:this.isRecorded(),

        type: this.type,
        levels: jQuery.map( this.levels(), function( lvl ) { return lvl.toJS(); } )
    };
};

