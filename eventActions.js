// � by Caspar Goeke and Holger Finger



var ActionRecord = function(event) {
    this.event = event;


    var specialRecs = this.event.trigger().getParameterSpec();
    var specR =  [];
    for (var i = 0; i<specialRecs.length; i++){
        specR.push({
                recType: specialRecs[i],
                variable :ko.observable(null),
                isRecorded: ko.observable(false)
            });
    }

    // serialized
    this.specialRecordings = ko.observableArray(specR);
    this.selectedRecordings =  ko.observableArray([]);
};

ActionRecord.prototype.type = "ActionRecord";
ActionRecord.prototype.label = "Record";



ActionRecord.prototype.addRecording = function(type){
    var newRec={
        recType: type,
        variable :ko.observable(null),
        isRecorded: ko.observable(false)
    };
    this.selectedRecordings.push(newRec);

};


ActionRecord.prototype.setPointers = function(entitiesArr) {


};

ActionRecord.prototype.run = function(dataModel) {

    var blockId = player.getBlockId();
    var trialId = player.getTrialId();
    var recData = new RecData(this.variableId(), dataModel.name());

    player.addRecording(blockId,trialId,recData.toJS());

};

ActionRecord.prototype.fromJS = function(data) {
    var specialRecordings = [];
    var selectedRecordings = [];

    for (var i = 0 ;i <data.recTypesSpecial.length;i++){
      specialRecordings.push({
          recType: data.recTypesSpecial,
          variable :ko.observable(data.variablesSpecial),
          isRecorded: ko.observable(data.isRecSpecial)
      })
    }

    for (var i = 0 ;i <data.recTypesSelected.length;i++){
        selectedRecordings.push({
            recType: data.recTypesSelected,
            variable :ko.observable(data.variablesSelected),
            isRecorded: ko.observable(data.isRecSelected)
        })
    }

    this.specialRecordings(specialRecordings);
    this.selectedRecordings(selectedRecordings);


    return this;
};

ActionRecord.prototype.toJS = function() {
    var recTypesSpecial =[];
    var variablesSpecial =[];
    var isRecSpecial =[];
    for (var i = 0 ;i <this.specialRecordings().length;i++){
        recTypesSpecial[i] =   this.specialRecordings()[i].recType;
        if  (this.specialRecordings()[i].variable()){
            variablesSpecial[i] =   this.specialRecordings()[i].variable().id();
        }
        else{
            variablesSpecial[i] = null;
        }

        isRecSpecial[i] =   this.specialRecordings()[i].isRecorded();
    }


    var recTypesSelected=[];
    var variablesSelected =[];
    var isRecSelected =[];
    for (var i = 0 ;i <this.selectedRecordings().length;i++){
        recTypesSelected[i] =   this.selectedRecordings()[i].recType;
        if  (this.selectedRecordings()[i].variable()){
            variablesSelected[i] =   this.selectedRecordings()[i].variable().id();
        }
        else{
            variablesSelected[i] = null;
        }

        isRecSelected[i] =   this.selectedRecordings()[i].isRecorded();
    }

    return {
        type: this.type,
        recTypesSpecial: recTypesSpecial,
        variablesSpecial: variablesSpecial,
        isRecSpecial: isRecSpecial,
        recTypesSelected: recTypesSpecial,
        variablesSelected: variablesSpecial,
        isRecSelected: isRecSpecial
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



var ActionSetVariable = function(event) {
    this.event = event;

    // serialized
   // this.variableId = ko.observable(undefined);
  //  this.argument = ko.observable('');


};
ActionSetVariable.prototype.type = "ActionSetVariable";
ActionSetVariable.prototype.label = "Set Variable";
ActionSetVariable.prototype.operatorTypes = ["Set to", "Increment by", "Decrement by", "Multiply by", "Divide by"];



ActionSetVariable.prototype.setPointers = function(entitiesArr) {

};

ActionSetVariable.prototype.run = function() {

};

ActionSetVariable.prototype.fromJS = function(data) {
    this.variableId(data.variableId);
    this.operatorType(data.operatorType);
    this.argument(data.argument);
    return this;
};

ActionSetVariable.prototype.toJS = function() {
    return {
        type: this.type,
        variableId: this.variableId(),
        operatorType: this.operatorType(),
        argument: this.argument()
    };
};



////////////////////////////////////////  ActionSetElementProp  ///////////////////////////////////////////////////

var ActionSetElementProp = function(event) {
    this.event = event;

    this.changes = ko.observableArray([null]);
    this.target = ko.observable(null);
    this.property= ko.observable(null);
    this.operatorType=  ko.observable(null);
    this.value=ko.observable(0);
    this.animate=ko.observable(false);
    this.animationTime=ko.observable(0);


    var self = this;

    this.target.subscribe(function(newVal) {
        self.property(null);
        self.operatorType(null);
        self.value(0);
        self.animate(false);
        self.animationTime(0);
    });


    this.property.subscribe(function(newVal) {
        self.operatorType(null);
        self.value(0);
        self.animate(false);
        self.animationTime(0);
    });

    this.operatorType.subscribe(function(newVal) {

        if (newVal == "PercentChange") {
            self.value(100);
            self.animate(false);
            self.animationTime(0);
        }
        else  if (newVal == "AbsChange") {
            self.value(0);
            self.animate(false);
            self.animationTime(0);
        }

        else  if (newVal == "SetValue") {
            var currentValue = self.event.parent.elements.byId[self.target()][self.property()]();
            self.value(currentValue);
            self.animate(false);
            self.animationTime(0);
        }

    });


};

ActionSetElementProp.prototype.operatorTypes = ko.observableArray(["PercentChange", "AbsChange", "SetValue"]);

ActionSetElementProp.prototype.type = "ActionSetElementProp";

ActionSetElementProp.prototype.label = "Set Element Prop.";



ActionSetElementProp.prototype.run = function() {

};

ActionSetElementProp.prototype.fromJS = function(data) {
    this.elem(data.elem);
    this.propName(data.propName);
    this.operatorType(data.operatorType);
    this.argument(data.argument);
    return this;
};

ActionSetElementProp.prototype.toJS = function() {
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


var ActionJumpTo = function(event) {
    this.event = event;

};
ActionJumpTo.prototype.type = "ActionJumpTo";
ActionJumpTo.prototype.label = "Jump To";

ActionJumpTo.prototype.setPointers = function(entitiesArr) {

};

ActionJumpTo.prototype.run = function() {
    player.currentFrame.endFrame();
};

ActionJumpTo.prototype.fromJS = function(data) {
    return this;
};

ActionJumpTo.prototype.toJS = function() {
    return {
        type: this.type
    };
};

//////////////////////




//////////////////////


var ActionControlAV = function(event) {
    this.event = event;

};
ActionControlAV.prototype.type = "ActionControlAV";
ActionControlAV.prototype.label = "Control AV";

ActionControlAV.prototype.setPointers = function(entitiesArr) {

};

ActionControlAV.prototype.run = function() {

};

ActionControlAV.prototype.fromJS = function(data) {
    return this;
};

ActionControlAV.prototype.toJS = function() {
    return {
        type: this.type
    };
};

//////////////////////



//////////////////////


var ActionControlTimer = function(event) {
    this.event = event;

};
ActionControlTimer.prototype.type = "ActionControlTimer";
ActionControlTimer.prototype.label = "Control Timer";

ActionControlTimer.prototype.setPointers = function(entitiesArr) {

};

ActionControlTimer.prototype.run = function() {

};

ActionControlTimer.prototype.fromJS = function(data) {
    return this;
};

ActionControlTimer.prototype.toJS = function() {
    return {
        type: this.type
    };
};

//////////////////////








////////////////  Questionnaire RECORDINGS //////////////////////

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