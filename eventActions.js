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
    var specialRecordings = this.specialRecordings();
    for (var i = 0; i<specialRecordings.length; i++){
        var globVar = entitiesArr.byId[specialRecordings[i].variable()];
        specialRecordings[i].variable(globVar);
    }

    var selectedRecordings = this.selectedRecordings();
    for (var i = 0; i<selectedRecordings.length; i++){
        var globVar = entitiesArr.byId[selectedRecordings[i].variable()];
        selectedRecordings[i].variable(globVar);
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

ActionRecord.prototype.run = function(dataModel) {

    var blockId = player.getBlockId();
    var trialId = player.getTrialId();
    var recData = new RecData(this.variableId(), dataModel.name());

    player.addRecording(blockId,trialId,recData.toJS());

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
    this.target = ko.observable(null);
    this.changes = ko.observableArray([]);
    this.animate=ko.observable(false);
    this.animationTime=ko.observable(0);

    var self= this;
    this.propertyList = ko.computed(function() {
        if(self.target()){

            var target = self.target();
            var select= "numeric";
            var proList = target.modifiableProp;
            var proListDataType = target.dataType;
            var numericOnly = self.getAllIndexes(proListDataType,select,proList);
            var proListSub = target.content().modifiableProp;
            var proListSubDataType = target.content().dataType;
            var numericOnly2 = self.getAllIndexes(proListSubDataType,select,proListSub);

            var completeList = numericOnly.concat(numericOnly2);
            return ko.utils.arrayMap(completeList, function(list) {
                return list;
            });
        }
        else{
            return ko.utils.arrayMap([], function(item) {
                return item;
            });
        }

    });

    this.addProperty();


    this.target.subscribe(function(newVal) {
        self.animate(false);
        self.animationTime(0);
        self.changes([]);
        self.addProperty();

    });

    /**

     **/


};


ActionSetElementProp.prototype.getAllIndexes = function(list1,val,list2) {
    var indexes = [], i = -1;
    while ((i = list1.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }

    var arr = $.grep(list2, function(n, i) {
        return $.inArray(i, indexes) !=-1;
    });

    return arr
};


ActionSetElementProp.prototype.operatorTypes = ko.observableArray(["%", "+", "set"]);
ActionSetElementProp.prototype.type = "ActionSetElementProp";
ActionSetElementProp.prototype.label = "Set Element Prop.";


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
            var currentValue = self.event.parent.elements.byId[self.target()][prop()]();
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

};

ActionSetElementProp.prototype.fromJS = function(data) {
    this.animate(data.animate);
    this.animationTime(data.animationTime);
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