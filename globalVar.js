// � by Caspar Goeke and Holger Finger

var GlobalVar = function (expData) {
    this.expData = expData;

    this.id = ko.observable(guid());
    this.name = ko.observable("newVariable");
    this.editName =  ko.observable(false);
    this.type = "GlobalVar";

    this.subtype = ko.observable("undefined");
    this.dataType = ko.observable("undefined");
    this.scale = ko.observable("undefined");
    this.scope = ko.observable("undefined");

    this.isFactor =  ko.observable(false);
    this.levels = ko.observableArray([]);
    this.subLevelEdit = ko.observable(false);
};

// enum: possible variable subtypes defined by us or user
GlobalVar.subtypes = ['undefined','id', 'randomization', 'condition', 'stimulus property', 'user decision', 'user response time',  'user questionnaire response'];

// further information defined by us
GlobalVar.dataTypes = ['undefined', 'string', 'numeric', 'boolean'];
GlobalVar.scales = ['undefined', 'nominal', 'ordinal', 'interval', 'ratio'];
GlobalVar.scopes = ['undefined','experiment','session', 'block', 'questionnaire', 'trial-loop', 'trial'];


GlobalVar.prototype.setPointers = function(entitiesArr) {

};

GlobalVar.prototype.addLevel = function() {
    var name = "level_"+(this.levels().length+1);
    var level = new Level(name);
    this.levels.push(level);
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
        type: this.type,
        levels: jQuery.map( this.levels(), function( lvl ) { return lvl.toJS(); } )
    };
};

