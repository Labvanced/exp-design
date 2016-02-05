// � by Caspar Goeke and Holger Finger


var ActionChangeVar = function(parent) {
    this.parent = parent;

    // serialized
    this.variableId = ko.observable('id-of-global-variable');
    this.setValue = ko.observable('string');
};
ActionChangeVar.prototype.type = "ActionChangeVar";
ActionChangeVar.prototype.label = "Change Variable";

ActionChangeVar.prototype.run = function() {

};

ActionChangeVar.prototype.fromJS = function(data) {
    this.variableId(data.variableId);
    this.setValue(data.setValue);
    return this;
};

ActionChangeVar.prototype.toJS = function() {
    return {
        type: this.type,
        variableId: this.variableId(),
        setValue: this.setValue()
    };
};

//////////////////////

var ActionChangeProp = function(parent) {
    this.parent = parent;

    // serialized
    this.elemId = ko.observable(null);
    this.propName = ko.observable(null);
    this.setValue = ko.observable('string');
};

ActionChangeProp.prototype.type = "ActionChangeProp";
ActionChangeProp.prototype.label = "Change Property Of";

ActionChangeProp.prototype.run = function() {

};

ActionChangeProp.prototype.fromJS = function(data) {
    this.elemId(data.elemId);
    this.propName(data.propName);
    this.setValue(data.setValue);
    return this;
};

ActionChangeProp.prototype.toJS = function() {
    return {
        type: this.type,
        elemId: this.elemId(),
        propName: this.propName(),
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
ActionRecordElementTag.prototype.label = "RecordTag";

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

    if (type == "ActionChangeVar"){
        var action = new ActionChangeVar(parent);
    }
    else if(type == "ActionChangeProp") {
        var action = new ActionChangeProp(parent);
    }
    else if(type == "ActionRecordRespTime") {
        var action = new ActionRecordRespTime(parent);
    }
    else if(type == "ActionNextFrame") {
        var action = new ActionNextFrame(parent);
    }
    else if(type == "ActionRecordElementTag") {
        var action = new ActionRecordElementTag(parent);
    }
    return action;
}