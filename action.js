// � by Caspar Goeke and Holger Finger

var ActionChangeVar = function(event) {
    this.event = event;

    // serialized
    this.variableId = ko.observable(undefined);
    this.operatorType = ko.observable(undefined);
    this.argument = ko.observable('');
};
ActionChangeVar.prototype.type = "ActionChangeVar";
ActionChangeVar.prototype.label = "Change Var.";
ActionChangeVar.prototype.operatorTypes = ["Set to", "Increment by", "Decrement by", "Multiply by", "Divide by"];

ActionChangeVar.prototype.setPointers = function(entitiesArr) {

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

var ActionRecordRespTime = function(event) {
    this.event = event;

    // serialized
    this.variableId = ko.observable(undefined);

};
ActionRecordRespTime.prototype.type = "ActionRecordRespTime";
ActionRecordRespTime.prototype.label = "Rec. Time";

ActionRecordRespTime.prototype.setPointers = function(entitiesArr) {

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

var ActionRecordElementTag = function(event) {
    this.event = event;

    // serialized
    this.variableId = ko.observable(undefined);
    this.variable = null;

};
ActionRecordElementTag.prototype.type = "ActionRecordElementTag";
ActionRecordElementTag.prototype.label = "Record Tag";

ActionRecordElementTag.prototype.setPointers = function(entitiesArr) {


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



//////////////////////

var ActionRecordTagAndExitFrame = function(event) {
    this.event = event;

    // serialized
    this.variableId = ko.observable(undefined);
    this.variable = null;

};
ActionRecordTagAndExitFrame.prototype.type = "ActionRecordTagAndExitFrame";
ActionRecordTagAndExitFrame.prototype.label = "Record Tag And Leave";

ActionRecordTagAndExitFrame.prototype.setPointers = function(entitiesArr) {


};

ActionRecordTagAndExitFrame.prototype.run = function(dataModel) {

    var blockId = player.getBlockId();
    var trialId = player.getTrialId();
    var recData = new RecData(this.variableId(), dataModel.name());
    player.addRecording(blockId,trialId,recData.toJS());
    player.currentFrame.endFrame();
};

ActionRecordTagAndExitFrame.prototype.fromJS = function(data) {
    this.variableId(data.variableId);
    return this;
};




ActionRecordTagAndExitFrame.prototype.toJS = function() {
    return {
        type: this.type,
        variableId: this.variableId()
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
    // if (type == "ActionChangeVar"){
    //     var action = new ActionChangeVar(event);
    // }
    // else if(type == "ActionChangeProp") {
    //     var action = new ActionChangeProp(event);
    // }
    // else if(type == "ActionRecordRespTime") {
    //     var action = new ActionRecordRespTime(event);
    // }
    // else if(type == "ActionNextFrame") {
    //     var action = new ActionNextFrame(event);
    // }
    // else if(type == "ActionRecordElementTag") {
    //     var action = new ActionRecordElementTag(event);
    // }
    // else if(type == "ActionRecordTagAndExitFrame") {
    //     var action = new ActionRecordTagAndExitFrame(event);
    // }
    // else if(type == "ActionRecordQuestionaireResponse") {
    //     var action = new ActionRecordQuestionaireResponse(event);
    // }
    return action;
}