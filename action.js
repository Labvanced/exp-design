// � by Caspar Goeke and Holger Finger


var ActionAssign = function(parent) {
    this.parent = parent;

    // serialized
    this.variableId = ko.observable('id-of-global-variable');
    this.setValue = ko.observable('string');
};
ActionAssign.prototype.type = "ActionAssign";
ActionAssign.prototype.label = "Assignment";

ActionAssign.prototype.run = function() {

};

ActionAssign.prototype.fromJS = function(data) {
    this.variableId(data.variableId);
    this.setValue(data.setValue);
    return this;
};

ActionAssign.prototype.toJS = function() {
    return {
        type: this.type,
        variableId: this.variableId(),
        setValue: this.setValue()
    };
};

//////////////////////

var ActionRecordRespTime = function(parent) {
    this.parent = parent;

    // serialized
    this.variableId = ko.observable('id-of-global-variable');

};
ActionRecordRespTime.prototype.type = "ActionRecordRespTime";
ActionRecordRespTime.prototype.label = "Rec.Resp.Time";

ActionRecordRespTime.prototype.run = function() {

};

ActionRecordRespTime.prototype.fromJS = function(data) {
    this.variableId(data.variableId);
    return this;
};

ActionRecordRespTime.prototype.toJS = function() {
    return {
        type: this.type,
        variableId: this.variableId()
    };
};

//////////////////////

var ActionRecordElementTag = function(parent) {
    this.parent = parent;

    // serialized
    this.variableId = ko.observable('id-of-global-variable');

};
ActionRecordElementTag.prototype.type = "ActionRecordElementTag";
ActionRecordElementTag.prototype.label = "Rec.Clicked.Elem.";

ActionRecordElementTag.prototype.run = function() {

};

ActionRecordElementTag.prototype.fromJS = function(data) {
    this.variableId(data.variableId);
    return this;
};

ActionRecordElementTag.prototype.toJS = function() {
    return {
        type: this.type,
        variableId: this.variableId()
    };
};


//////////////////////


var ActionNextFrame = function(parent) {
    this.parent = parent;

};
ActionNextFrame.prototype.type = "ActionNextFrame";
ActionNextFrame.prototype.label = "NextFrame";

ActionNextFrame.prototype.run = function() {

};

ActionNextFrame.prototype.fromJS = function(data) {
    return this;
};

ActionNextFrame.prototype.toJS = function() {
    return {
        type: this.type
    };
};

////////////////////////

function actionFactory(parent,type) {

    if (type == "ActionAssign"){
        var action = new ActionAssign(parent);
    }
    else if(type == "ActionRecordRespTime") {
        var action = new ActionRecordRespTime(parent);
    }
    else if(type == "ActionNextFrame") {
        var action = new ActionNextFrame(parent);
    }
    return action;
}