// � by Caspar Goeke and Holger Finger


var ActionChangeVar = function(parent) {
    this.parent = parent;

    // serialized
    this.variableId = ko.observable(undefined);
    this.operatorType = ko.observable(undefined);
    this.argument = ko.observable('');
};
ActionChangeVar.prototype.type = "ActionChangeVar";
ActionChangeVar.prototype.label = "Change Var.";
ActionChangeVar.prototype.operatorTypes = ["Set to", "Increment by", "Decrement by", "Multiply by", "Divide by"];

ActionChangeVar.prototype.setPointers = function() {

};

ActionChangeVar.prototype.run = function() {

};

ActionChangeVar.prototype.fromJS = function(data) {
    this.variableId(data.variableId);
    this.operatorType(data.operatorType);
    this.argument(data.argument);
    return this;
};

ActionChangeVar.prototype.toJS = function() {
    return {
        type: this.type,
        variableId: this.variableId(),
        operatorType: this.operatorType(),
        argument: this.argument()
    };
};

//////////////////////

var ActionChangeProp = function(parent) {
    this.parent = parent;

    // serialized
    this.elem = ko.observable(null);
    this.propName = ko.observable(null);
    this.operatorType = ko.observable();
    this.argument = ko.observable('');
};

ActionChangeProp.prototype.type = "ActionChangeProp";
ActionChangeProp.prototype.label = "Change Prop.";
ActionChangeProp.prototype.operatorTypes = ["Set to", "Increment by", "Decrement by", "Multiply by", "Divide by"];

ActionChangeProp.prototype.setPointers = function() {
    this.elem(this.parent.parent.expData.entities.byId[this.elem()])
};

ActionChangeProp.prototype.run = function() {

};

ActionChangeProp.prototype.fromJS = function(data) {
    this.elem(data.elem);
    this.propName(data.propName);
    this.operatorType(data.operatorType);
    this.argument(data.argument);
    return this;
};

ActionChangeProp.prototype.toJS = function() {
    if (this.elem()) {
        var elemId = this.elem().id();
    }
    else {
        var elemId = undefined;
    }
    return {
        type: this.type,
        elem: elemId,
        propName: this.propName(),
        operatorType: this.operatorType(),
        argument: this.argument()
    };
};

//////////////////////

var ActionRecordRespTime = function(parent) {
    this.parent = parent;

    // serialized
    this.variableId = ko.observable(undefined);

};
ActionRecordRespTime.prototype.type = "ActionRecordRespTime";
ActionRecordRespTime.prototype.label = "Rec. Time";

ActionRecordRespTime.prototype.setPointers = function() {

};

ActionRecordRespTime.prototype.run = function() {
    var currTime = Date.now();
    var respTime = currTime-player.currentFrame.startedTime;

    var blockId = player.getBlockId();
    var trialId = player.getTrialId();
    var recData = new RecData(this.variableId(), respTime);

    player.addRecording(blockId,trialId,recData.toJS());
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
    this.variableId = ko.observable(undefined);
    this.variable = null;

};
ActionRecordElementTag.prototype.type = "ActionRecordElementTag";
ActionRecordElementTag.prototype.label = "Record Tag";

ActionRecordElementTag.prototype.setPointers = function() {


};

ActionRecordElementTag.prototype.run = function(dataModel) {

    var blockId = player.getBlockId();
    var trialId = player.getTrialId();
    var recData = new RecData(this.variableId(), dataModel.name());

    player.addRecording(blockId,trialId,recData.toJS());

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
ActionNextFrame.prototype.label = "Next Frame";

ActionNextFrame.prototype.setPointers = function() {

};

ActionNextFrame.prototype.run = function() {
    player.currentFrame.endFrame();
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