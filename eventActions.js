// � by Caspar Goeke and Holger Finger



var ActionRecord = function(event) {
    this.event = event;

    // serialized
    this.variableId = ko.observable(undefined);
    this.variable = null;

};

ActionRecord.prototype.type = "Record";
ActionRecord.prototype.label = "Record";



ActionRecord.prototype.setPointers = function(entitiesArr) {


};

ActionRecord.prototype.run = function(dataModel) {

    var blockId = player.getBlockId();
    var trialId = player.getTrialId();
    var recData = new RecData(this.variableId(), dataModel.name());

    player.addRecording(blockId,trialId,recData.toJS());

};

ActionRecord.prototype.fromJS = function(data) {
    this.variableId(data.variableId);
    return this;
};




ActionRecord.prototype.toJS = function() {
    return {
        type: this.type,
        variableId: this.variableId()
    };
};


//////////////////////



var ActionSetVariableTo = function(event) {
    this.event = event;

    // serialized
    this.variableId = ko.observable(undefined);
    this.operatorType = ko.observable(undefined);
    this.argument = ko.observable('');
};
ActionSetVariableTo.prototype.type = "ActionSetVariableTo";
ActionSetVariableTo.prototype.label = "Change Var.";
ActionSetVariableTo.prototype.operatorTypes = ["Set to", "Increment by", "Decrement by", "Multiply by", "Divide by"];

ActionSetVariableTo.prototype.setPointers = function(entitiesArr) {

};

ActionSetVariableTo.prototype.run = function() {

};

ActionSetVariableTo.prototype.fromJS = function(data) {
    this.variableId(data.variableId);
    this.operatorType(data.operatorType);
    this.argument(data.argument);
    return this;
};

ActionSetVariableTo.prototype.toJS = function() {
    return {
        type: this.type,
        variableId: this.variableId(),
        operatorType: this.operatorType(),
        argument: this.argument()
    };
};

//////////////////////

var ActionChangeProp = function(event) {
    this.event = event;

    // serialized
    this.elem = ko.observable(null);
    this.propName = ko.observable(null);
    this.operatorType = ko.observable();
    this.argument = ko.observable('');
};

ActionChangeProp.prototype.type = "ActionChangeProp";
ActionChangeProp.prototype.label = "Change Prop.";
ActionChangeProp.prototype.operatorTypes = ["Set to", "Increment by", "Decrement by", "Multiply by", "Divide by"];

ActionChangeProp.prototype.setPointers = function(entitiesArr) {
    this.elem(entitiesArr.byId[this.elem()])
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


var ActionNextFrame = function(event) {
    this.event = event;

};
ActionNextFrame.prototype.type = "ActionNextFrame";
ActionNextFrame.prototype.label = "Next Frame";

ActionNextFrame.prototype.setPointers = function(entitiesArr) {

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

//////////////////////

var ActionRecordQuestionaireResponse = function(event) {
    this.event = event;

    // serialized
    this.variableId = ko.observable(undefined);
    this.variable = null;

};
ActionRecordQuestionaireResponse.prototype.type = "ActionRecordQuestionaireResponse";
ActionRecordQuestionaireResponse.prototype.label = "Record Questionaire Answer";

ActionRecordQuestionaireResponse.prototype.setPointers = function(entitiesArr) {

};

ActionRecordQuestionaireResponse.prototype.run = function(dataModel) {

    var blockId = player.getBlockId();
    var trialId = player.getTrialId();
    var resp = dataModel.content.answer;
    var recData = new RecData(this.variableId(), resp);
    player.addRecording(blockId,trialId,recData.toJS());

};

ActionRecordQuestionaireResponse.prototype.fromJS = function(data) {
    this.variableId(data.variableId);
    return this;
};




ActionRecordQuestionaireResponse.prototype.toJS = function() {
    return {
        type: this.type,
        variableId: this.variableId()
    };
};


////////////////////////

function actionFactory(event,type) {
    var action = new window[type](event);
    return action;
}