// � by Caspar Goeke and Holger Finger

var GlobalVar = function (expData) {
    this.expData = expData;

    this.id = ko.observable(guid());
    this.name = ko.observable("newVariable");
    this.type = "GlobalVar";
    this.subtype = ko.observable(GlobalVar.subtypes[0].text);
    this.dataType = ko.observable("undefined");
    this.scope = ko.observable(null);
    this.levels = ko.observableArray([]);
    this.editName =  ko.observable(false);
    this.subLevelEdit = ko.observable(false);
};

// enum: posssible variable subtypes..
GlobalVar.subtypes = [
        { id: 1, text: 'undefined' },
        { id: 2, text: 'factor' },
        { id: 3, text: 'stimulus property' },
        { id: 4, text: 'response' },
        { id: 5, text: 'response time' },
        { id: 6, text: 'randomization' },
        { id: 7, text: 'seperate trial type' },
        { id: 8, text: 'id' }
    ];


// enum: posssible origins for variables..
GlobalVar.originTypes = ['undefined', 'condition', 'randomization', 'response', 'variable'];

// enum: posssible datatypes..
GlobalVar.dataTypes = ['undefined', 'factor', 'numeric', 'string'];


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
        type: this.type,
        levels: jQuery.map( this.levels(), function( lvl ) { return lvl.toJS(); } )
    };
};

