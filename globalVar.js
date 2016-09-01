// � by Caspar Goeke and Holger Finger

var GlobalVar = function (expData) {
    this.expData = expData;

    // serialized:
    this.id = ko.observable(guid());
    this.type = "GlobalVar";
    this.name = ko.observable("newVariable");
    this.subtype = ko.observable("undefined");
    this.dataType = ko.observable("undefined");
    this.scale = ko.observable("undefined");
    this.scope = ko.observable("undefined");
    this.isFactor =  ko.observable(false);
    this.isInteracting = ko.observable(false);
    this.levels = ko.observableArray([]);

    // not serialized:
    this.editName =  ko.observable(false);
    this.subLevelEdit = ko.observable(false);
    this.value = ko.observable(null);
    this.backRefs = ko.observableArray([]).extend({sortById: null});
};

// enum definitions:
GlobalVar.subtypes = ['custom','id', 'sequence', 'condition', 'stimulus property', 'user decision', 'user response time',  'user questionnaire response','physiological recording'];
GlobalVar.scales = ['undefined', 'nominal', 'ordinal', 'interval', 'ratio'];
GlobalVar.dataTypes = ['undefined', 'string', 'numeric', 'boolean', 'categorical', 'datetime'];
GlobalVar.scopes = ['undefined', 'participant','session','block','task','trial'];
GlobalVar.depOrIndepVar = [true, false];
GlobalVar.isRecorded = [true, false];
GlobalVar.isUserWritable = [true, false];

GlobalVar.prototype.setPointers = function(entitiesArr) {

};

GlobalVar.prototype.addBackRef = function(entity, parentNamedEntity, isWritten, isRead, refLabel) {
    this.backRefs.push({
        id: entity.id(),
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

GlobalVar.prototype.getValue = function() {
    this.value();
};

GlobalVar.prototype.addLevel = function() {
    var name = "level_"+(this.levels().length+1);
    var level = new Level(name);
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


GlobalVar.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.subtype(data.subtype);
    this.dataType(data.dataType);
    this.scale(data.scale);
    this.scope(data.scope);
    this.isFactor(data.isFactor);
    this.isInteracting(data.isInteracting);

    this.levels(jQuery.map( data.levels, function( lvlData ) {
        return (new Level()).fromJS(lvlData);
    } ));
    return this;
};

GlobalVar.prototype.toJS = function() {
    return {
        id: this.id(),
        name: this.name(),
        subtype: this.subtype(),
        dataType: this.dataType(),
        scale: this.scale(),
        scope: this.scope(),
        isFactor: this.isFactor(),
        isInteracting: this.isInteracting(),

        type: this.type,
        levels: jQuery.map( this.levels(), function( lvl ) { return lvl.toJS(); } )
    };
};

