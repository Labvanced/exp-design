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
        if (varToSave) {
            varToSave.value(valueToRecord);
        }
        if (specialRecs[i].isRecorded()) {
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


ActionSetElementProp.prototype.operatorTypes = ko.observableArray(["%", "+", "set", "variable"]);
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
        else  if (newVal == "variable") {
            value(null);
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

    var changes = this.changes();
    for (var i=0; i<changes.length; i++) {
        if (changes[i].operatorType() == "variable") {
            var varId = changes[i].value();
            var globVar = entitiesArr.byId[varId];
            changes[i].value(globVar);
            this.setVariableBackRef(globVar);
        }
    }
};

ActionSetElementProp.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, false, true, 'Action Set Element Prop');
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
        else if (operatorType== 'variable'){
            var newValue = parseFloat(value.value());
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
        var tmp = data.changes[i];
        var obj = {
            property :   ko.observable(tmp.property),
            operatorType :   ko.observable(tmp.operatorType),
            value:   ko.observable(tmp.value)
        };
        changes.push(obj);
    }
    this.changes(changes);

    return this;
};

ActionSetElementProp.prototype.toJS = function() {

    var changes= [];
    var origChanges = this.changes();
    for (var i = 0; i<origChanges.length; i++){
        var currChanges = origChanges[i];
        var value = currChanges.value();
        if (currChanges.operatorType() == "variable" && value) {
            value = value.id();
        }
        var obj = {
            property: currChanges.property(),
            operatorType: currChanges.operatorType(),
            value: value
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


/////////////////////////////////////////////   ActionDrawRandomNumber    ////////////////////////////////////////////////

var ActionDrawRandomNumber = function(event) {
    this.event = event;

    // serialized
    this.variable = ko.observable(null);
    this.distribution = ko.observable('Uniform');
    this.distributionParam1 = ko.observable(0).extend({ numeric: 4 }); // i.e. lower bound of Uniform or mean of Gaussian
    this.distributionParam2 = ko.observable(1).extend({ numeric: 4 }); // i.e. upper bound of Uniform or std of Gaussian
};
ActionDrawRandomNumber.prototype.type = "ActionDrawRandomNumber";
ActionDrawRandomNumber.prototype.label = "Draw Random Number";
ActionDrawRandomNumber.prototype.distributions = ["Uniform", "Gaussian"];
ActionDrawRandomNumber.prototype.distributionParamLabels = {
    "Uniform": ["min", "max"],
    "Gaussian": ["mean", "std"]
};

ActionDrawRandomNumber.prototype.isValid = function(){
    return true;
};

ActionDrawRandomNumber.prototype.setPointers = function(entitiesArr) {
    if (this.variable()){
        var globVar = entitiesArr.byId[this.variable()];
        this.variable(globVar);
        this.setVariableBackRef(globVar);
    }
};

ActionDrawRandomNumber.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, true, false, 'Action Draw Random Number');
};

// Standard Normal variate using Box-Muller transform.
function randn_bm() {
    var u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
    var v = 1 - Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

// randn with marsaglia_polar algorithm:
var randn_marsaglia_polar = (function() {
    var y2;
    var isSpareReady = false;
    return function() {
        var y1;
        if(isSpareReady) {
            y1 = y2;
            isSpareReady = false;
        }
        else {
            var x1, x2, w;
            do {
                x1 = 2.0 * Math.random() - 1.0;
                x2 = 2.0 * Math.random() - 1.0;
                w  = x1 * x1 + x2 * x2;
            } while( w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            isSpareReady = true;
        }
        return y1;
    }
})();

ActionDrawRandomNumber.prototype.run = function() {
    if (this.distribution() == "Uniform") {
        var min = this.distributionParam1();
        var max = this.distributionParam2();
        var value = Math.random() * (max - min) + min;
        this.variable().value(value);
    }
    else if (this.distribution() == "Gaussian") {
        var mean = this.distributionParam1();
        var std = this.distributionParam2();
        var value = mean + randn_marsaglia_polar() * std;
        this.variable().value(value);
    }
};

ActionDrawRandomNumber.prototype.fromJS = function(data) {
    this.variable(data.variable);
    this.distribution(data.distribution);
    this.distributionParam1(data.distributionParam1);
    this.distributionParam2(data.distributionParam2);
    return this;
};

ActionDrawRandomNumber.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }
    return {
        type: this.type,
        variable: variableId,
        distribution: this.distribution(),
        distributionParam1: this.distributionParam1(),
        distributionParam2: this.distributionParam2()
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