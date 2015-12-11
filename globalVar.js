// � by Caspar Goeke and Holger Finger

var GlobalVar = function (expData) {
    this.expData = expData;

    this.id = ko.observable(guid());
    this.name = ko.observable("newVariable");
    this.type = "GlobalVar";
    this.subtype = ko.observable(GlobalVar.subtypes[0].text);
    this.dataType = ko.observable("undefined");
    this.assigned = ko.observable(false);
    this.levels = ko.observableArray([]);
    this.editName =  ko.observable(false);
};

// enum: posssible variable subtypes..
GlobalVar.subtypes= [
        { id: 1, text: 'undefined' },
        { id: 2, text: 'factor' },
        { id: 3, text: 'stimulus property' },
        { id: 4, text: 'response' },
        { id: 5, text: 'response time' },
        { id: 6, text: 'randomization' },
        { id: 7, text: 'seperate trial type' }
    ];


GlobalVar.prototype.setPointers = function() {
};

GlobalVar.prototype.addLevel = function() {
    var level = {
        name:"level_"+(this.levels().length+1),
        editName:  ko.observable(false)

    };
    this.levels.push(level);
};

GlobalVar.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.subtype(data.subtype);
    this.dataType(data.dataType);
    this.levels(data.levels);
    return this;
};

GlobalVar.prototype.toJS = function() {
    return {
        id: this.id(),
        name: this.name(),
        subtype: this.subtype(),
        dataType: this.dataType(),
        type: this.type,
        levels: this.levels()
    };
};

