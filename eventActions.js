// � by Caspar Goeke and Holger Finger


/////////////////////////////////////////////////  ActionRecord  ///////////////////////////////////////////////////

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

ActionRecord.prototype.isValid = function(){
    return true;
};

ActionRecord.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, true, false, 'recording variable');
};

ActionRecord.prototype.addRecording = function(type){
    var newRec={
        recType: type,
        variable :ko.observable(null),
        isRecorded: ko.observable(false)
    };
    this.selectedRecordings.push(newRec);

};


ActionRecord.prototype.setPointers = function(entitiesArr) {
    var specialRecordings = this.specialRecordings();
    for (var i = 0; i<specialRecordings.length; i++){
        if (specialRecordings[i].variable()) {
            var globVar = entitiesArr.byId[specialRecordings[i].variable()];
            specialRecordings[i].variable(globVar);
            this.setVariableBackRef(globVar);
        }
    }

    var selectedRecordings = this.selectedRecordings();
    for (var i = 0; i<selectedRecordings.length; i++){
        if (selectedRecordings[i].variable()) {
            var globVar = entitiesArr.byId[selectedRecordings[i].variable()];
            selectedRecordings[i].variable(globVar);
            this.setVariableBackRef(globVar);
        }
    }
};

ActionRecord.prototype.reAddEntities = function(entitiesArr) {
    var specialRec = this.specialRecordings();
    for (var i = 0; i<specialRec.length; i++){
        if (specialRec[i].variable()) {
            entitiesArr.push(specialRec[i].variable());
        }
    }
    var selectedRec = this.selectedRecordings();
    for (var i = 0; i<selectedRec.length; i++){
        if (selectedRec[i].variable()) {
            entitiesArr.push(selectedRec[i].variable());
        }
    }
};

ActionRecord.prototype.run = function(recInput) {

    var blockId = player.getBlockId();
    var trialId = player.getTrialId();

    var specialRecs = this.specialRecordings();
    for (var i = 0; i < specialRecs.length; i++) {
        var valueToRecord = recInput[i];
        var varToSave = specialRecs[i].variable();
        if (specialRecs[i].isRecorded()) {
            varToSave.value(valueToRecord);
            var recData = new RecData(varToSave.id(), valueToRecord);
            player.addRecording(blockId, trialId, recData.toJS());
        }
    }

    var selectedRecs = this.selectedRecordings();
    for (var i = 0; i < selectedRecs.length; i++) {
        var name = selectedRecs[i].recType;
        var shouldBeRec = selectedRecs[i].isRecorded();
        var varToSave = selectedRecs[i].variable();

        switch (name) {
            case "elementTag":
                if (shouldBeRec) {
                    var tag = "TODO";
                    var recData = new RecData(varToSave.id(), tag);
                    player.addRecording(blockId, trialId, recData.toJS());
                }
                break;
            case "reactionTime":
                if (shouldBeRec) {
                    var reactionTime = "TODO";
                    var recData = new RecData(varToSave.id(), reactionTime);
                    player.addRecording(blockId, trialId, recData.toJS());
                }
                break;
        }
    }
};

ActionRecord.prototype.fromJS = function(data) {
    var specialRecordings = [];
    for (var i = 0; i < data.specialRecordings.length; i++) {
        var tmp = data.specialRecordings[i];
        specialRecordings.push({
            recType: tmp.recType,
            variable: ko.observable(tmp.variable),
            isRecorded: ko.observable(tmp.isRecorded)
        })
    }
    this.specialRecordings(specialRecordings);

    var selectedRecordings = [];
    for (var i = 0; i < data.selectedRecordings.length; i++) {
        var tmp = data.selectedRecordings[i];
        selectedRecordings.push({
            recType: tmp.recType,
            variable: ko.observable(tmp.variable),
            isRecorded: ko.observable(tmp.isRecorded)
        })
    }
    this.selectedRecordings(selectedRecordings);
    return this;
};

ActionRecord.prototype.toJS = function() {
    var specialRecordings = [];
    var specialRec = this.specialRecordings();
    for (var i = 0; i<specialRec.length; i++){
        var rec = specialRec[i];
        var varId = null;
        if (rec.variable()) {
            varId = rec.variable().id();
        }
        specialRecordings.push({
            recType: rec.recType,
            variable:  varId,
            isRecorded: rec.isRecorded()
        });
    }

    var selectedRecordings = [];
    var selectedRec = this.selectedRecordings();
    for (var i = 0; i<selectedRec.length; i++){
        var rec = selectedRec[i];
        var varId = null;
        if (rec.variable()) {
            varId = rec.variable().id();
        }
        selectedRecordings.push({
            recType: rec.recType,
            variable:  varId,
            isRecorded: rec.isRecorded()
        });
    }

    return {
        type: this.type,
        specialRecordings: specialRecordings,
        selectedRecordings: selectedRecordings
    };
};


////////////////////////////////////////  ActionSetElementProp  ///////////////////////////////////////////////////

var ActionSetElementProp = function(event) {
    this.event = event;
    this.target = ko.observable(null);
    this.changes = ko.observableArray([]);
    this.animate=ko.observable(false);
    this.animationTime=ko.observable(0);

    this.addProperty();

    var self= this;
    this.target.subscribe(function(newVal) {
        if (self.target() != newVal){
            self.animate(false);
            self.animationTime(0);
            self.changes([]);
            self.addProperty();
        }
    });
};


ActionSetElementProp.prototype.operatorTypes = ko.observableArray(["%", "+", "set"]);
ActionSetElementProp.prototype.type = "ActionSetElementProp";
ActionSetElementProp.prototype.label = "Set Element Prop.";

ActionSetElementProp.prototype.isValid = function(){
    return true;
};

ActionSetElementProp.prototype.addProperty = function() {

    var prop = ko.observable(null);
    var operator = ko.observable(null);
    var value = ko.observable(0);
    var self = this;

    prop.subscribe(function(newVal) {
        operator(null);
        value(0);
    });

    operator.subscribe(function(newVal) {

        if (newVal == "%") {
            value(100);
        }
        else  if (newVal == "+") {
            value(0);
        }
        else  if (newVal == "set") {
            var currentValue = self.target()[prop()]();
            value(currentValue);
        }

    });

    var addObj = {
        property: prop,
        operatorType: operator,
        value: value

    };

    this.changes.push(addObj);
};


ActionSetElementProp.prototype.setPointers = function(entitiesArr) {
    var target = entitiesArr.byId[this.target()];
    this.target(target);
};

ActionSetElementProp.prototype.reAddEntities = function(entitiesArr) {

};


ActionSetElementProp.prototype.run = function() {

    var changes = this.changes();
    var target = this.target();
    for (var i = 0; i <changes.length; i++){
        var property =  changes[i].property();
        var operatorType =  changes[i].operatorType();

        // make sure to calculate on numeric
        var value =  changes[i].value();

        //var oldValue = target[property]();
        var oldValue = target.modifier().selectedTrialView[property]();

        if (typeof oldValue  === 'string'){
            oldValue = Number(oldValue);
        }
        if (typeof value  === 'string'){
            value = Number(value);
        }

        if (operatorType== '+'){
            var newValue = oldValue + value;
        }
        else if (operatorType== '%'){
            var newValue = oldValue * (value/100);
        }
        else if (operatorType== 'set'){
            var newValue = value;
        }
        //target[property](newValue);
        target.modifier().selectedTrialView[property](newValue);
    }

};

ActionSetElementProp.prototype.fromJS = function(data) {
    this.animate(data.animate);
    this.animationTime(data.animationTime);
    this.target(data.target);

    var changes = [];
    for (var i = 0 ;i <data.changes.length;i++){
        var obj = {
            property :   ko.observable(data.changes[i].property),
            operatorType :   ko.observable(data.changes[i].operatorType),
            value:   ko.observable(data.changes[i].value)
        };
        changes.push(obj);
    }
    this.changes(changes);

    return this;
};

ActionSetElementProp.prototype.toJS = function() {


    var changes= [];
    for (var i = 0 ;i <this.changes().length;i++){
        var obj = {
            property :   this.changes()[i].property(),
            operatorType :   this.changes()[i].operatorType(),
            value:   this.changes()[i].value()
        };
        changes.push(obj);
    }

    return {
        type: this.type,
        target: this.target().id(),
        animate: this.animate(),
        animationTime:this.animationTime,
        changes:changes
    };
};


////////////////////////////////////////////   ActionJumpTo   /////////////////////////////////////////////////////


var ActionJumpTo = function(event) {
    this.event = event;
    this.jumpType = ko.observable(null);
    this.frameToJump= ko.observable(null)
};

ActionJumpTo.prototype.type = "ActionJumpTo";
ActionJumpTo.prototype.label = "Jump To";

ActionJumpTo.prototype.isValid = function(){
    return true;
};

ActionJumpTo.prototype.setPointers = function(entitiesArr) {
    var frame = entitiesArr.byId[this.frameToJump()];
    this.frameToJump(frame);
};

ActionJumpTo.prototype.run = function() {
    if (this.jumpType() == "nextFrame"){
        player.currentFrame.endFrame();
    }

};

ActionJumpTo.prototype.fromJS = function(data) {
    this.jumpType(data.jumpType);
    this.frameToJump(data.frameToJump);
    return this;
};

ActionJumpTo.prototype.toJS = function() {

    if (this.frameToJump()){
        var frameToJump = this.frameToJump().id()
    }
    else{
        var frameToJump = null;
    }

    return {
        type: this.type,
        jumpType: this.jumpType(),
        frameToJump: frameToJump

    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/////////////////////////////////////////////   ActionSetVariable    ////////////////////////////////////////////////

var ActionSetVariable = function(event) {
    this.event = event;

    // serialized
    // this.variableId = ko.observable(undefined);
    //  this.argument = ko.observable('');


};
ActionSetVariable.prototype.type = "ActionSetVariable";
ActionSetVariable.prototype.label = "Set Variable";
ActionSetVariable.prototype.operatorTypes = ["Set to", "Increment by", "Decrement by", "Multiply by", "Divide by"];

ActionSetVariable.prototype.isValid = function(){
    return true;
};

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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////  ActionControlAV/  //////////////////////////////////////////////
var ActionControlAV = function(event) {
    this.event = event;

};
ActionControlAV.prototype.type = "ActionControlAV";
ActionControlAV.prototype.label = "Control AV";

ActionControlAV.prototype.isValid = function(){
    return true;
};

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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////  ActionControlTimer  //////////////////////////////////////////////


var ActionControlTimer = function(event) {
    this.event = event;

};
ActionControlTimer.prototype.type = "ActionControlTimer";
ActionControlTimer.prototype.label = "Control Timer";

ActionControlTimer.prototype.isValid = function(){
    return true;
};

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////  ActionRecordQuestionaireResponse  //////////////////////////////////////////

var ActionRecordQuestionaireResponse = function(event) {
    this.event = event;

    // serialized
    this.variableId = ko.observable(undefined);
    this.variable = null;

};
ActionRecordQuestionaireResponse.prototype.type = "ActionRecordQuestionaireResponse";
ActionRecordQuestionaireResponse.prototype.label = "Record Questionaire Answer";

ActionRecordQuestionaireResponse.prototype.isValid = function(){
    return true;
};

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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function actionFactory(event,type) {
    var action = new window[type](event);
    return action;
}