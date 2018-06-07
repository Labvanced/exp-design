// Copyright by Scicovery GmbH



/////////////////////////////////////////////////  ActionRecord  /////////////////////////////////////////////////// // depreciated!

/**
 * This action can record values (i.e. elementTag or reactiontime) into variables and sends them to the server.
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionRecord = function(event) {
    this.event = event;
    this.specialRecs = this.event.trigger().getParameterSpec();
    this.selectedRecordings =  ko.observableArray([]);
};

ActionRecord.prototype.type = "ActionRecord";
ActionRecord.prototype.label = "Save Response or Property";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionRecord.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionRecord.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, true, false, 'recording variable');
};

/**
 * add a new recording to the list.
 * @param {string} type - the type of the recording, such as "elementTag" or "reactionTime"
 */
ActionRecord.prototype.addRecording = function(type){
    var self = this;
    var newRec={
        recType: type,
        variable :ko.observable({
            isRecorded: ko.observable(true)
        }),
        tmpRecState: null
    };
    newRec.variable.subscribe(function(oldValue) {
        newRec.tmpRecState = oldValue.isRecorded();
    }, null, "beforeChange");

    newRec.variable.subscribe(function(oldValue) {
        oldValue.isRecorded(newRec.tmpRecState);
    }, this);

    this.selectedRecordings.push(newRec);

};

/**
 * This function is called when the parent event was triggered and the requirements are true. It creates the RecData and
 * sends them to the server.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionRecord.prototype.run = function(triggerParams) {
    var self = this;
    var selectedRecs = this.selectedRecordings();
    for (i = 0; i < selectedRecs.length; i++) {
        var name = selectedRecs[i].recType;
        var varToSave = selectedRecs[i].variable();
        var val;
        switch (name) {
            // mouse events
            case "Stimulus Name":
                val = triggerParams[0];
                break;
            case "Time From Stimulus Onset":  // change to onset of stimulus
                val = triggerParams[1];
                break;
            case "Stimulus Info":  // change to onset of stimulus
                val = triggerParams[2];
                break;
            case "Stimulus Visibility":
                val = triggerParams[3];
                break;
            case "Stimulus X-Position":
                val = triggerParams[4];
                break;
            case "Stimulus Y-Position":
                val = triggerParams[5];
                break;
            case "Stimulus Width":
                val = triggerParams[6];
                break;
            case "Stimulus Height":
                val = triggerParams[7];
                break;
            // keyboard events
            case "Id of Key":
                val = triggerParams[0];
                break;
            // frame properties
            case "Time From Frame Onset":
                val = triggerParams[1];
                break;
            // mouse properties
            case "Mouse X-Position":
                val = 0;
                break;
            // mouse properties
            case "Mouse Y-Position":
                val = 0;
                break;
        }

        varToSave.value().value(val);
    }


};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionRecord.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionRecord.prototype.setPointers = function(entitiesArr) {
    var i;
    var globVar;

    var selectedRecordings = this.selectedRecordings();
    for (i = 0; i<selectedRecordings.length; i++){
        if (selectedRecordings[i].variable()) {
            globVar = entitiesArr.byId[selectedRecordings[i].variable()];
            selectedRecordings[i].variable(globVar);
            this.setVariableBackRef(globVar);
        }
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionRecord.prototype.reAddEntities = function(entitiesArr) {

    var i;
    var selectedRec = this.selectedRecordings();
    for (i = 0; i<selectedRec.length; i++){
        if (selectedRec[i].variable()) {
            if (!entitiesArr.byId.hasOwnProperty(selectedRec[i].variable().id())) {
                entitiesArr.push(selectedRec[i].variable());
            }
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionRecord}
 */
ActionRecord.prototype.fromJS = function(data) {

    var i, tmp;


    var selectedRecordings = [];
    for (i = 0; i < data.selectedRecordings.length; i++) {
        tmp = data.selectedRecordings[i];
        selectedRecordings.push({
            recType: tmp.recType,
            variable: ko.observable(tmp.variable),
        });
    }
    this.selectedRecordings(selectedRecordings);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionRecord.prototype.toJS = function() {
    var rec, varId, i;


    var selectedRecordings = [];
    var selectedRec = this.selectedRecordings();
    for (i = 0; i<selectedRec.length; i++){
        rec = selectedRec[i];
        varId = null;
        if (rec.variable()) {
            varId = rec.variable().id();
        }
        selectedRecordings.push({
            recType: rec.recType,
            variable:  varId
        });
    }

    return {
        type: this.type,
        selectedRecordings: selectedRecordings
    };
};


////////////////////////////////////////  ActionSetElementProp  ///////////////////////////////////////////////////

/**
 * This action changes properties of a contentElement.
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionSetElementProp = function(event) {
    this.event = event;
    this.target = ko.observable(null);
    this.changes = ko.observableArray([]);
    this.animate = ko.observable(false);
    this.animationTime=ko.observable(0);
};


ActionSetElementProp.prototype.type = "ActionSetElementProp";
ActionSetElementProp.prototype.label = "Set Stimulus Property";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionSetElementProp.prototype.isValid = function(){
    return true;
};

/**
 * adds a new property that shall be changed.
 */
ActionSetElementProp.prototype.addProperty = function() {
    var newChange = new ActionSetElementPropChange(this);
    this.changes.push(newChange);
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionSetElementProp.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, false, true, 'Action Set Element Prop');
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It reads out the desired
 * changes and applies them to the properties.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */

ActionSetElementProp.prototype.run = function(triggerParams) {

    var changes = this.changes();
    var target = this.target();
    for (var i = 0; i <changes.length; i++){
        var property =  changes[i].property();
        var operatorType =  changes[i].operatorType();
        var changeType =  changes[i].changeType();
        var variable = changes[i].variable();

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

        var newValue;
        var changeValue;

        if (changeType == 'value'){
            changeValue = value;
        }
        else if (changeType == '%'){
            changeValue = (oldValue * (value/100));
        }
        else if (changeType == 'variable'){
            changeValue = parseFloat(variable.value().value());
        }

        if (operatorType== '='){
            newValue = changeValue;
        }
        else if (operatorType== '+'){
            newValue = oldValue + changeValue;
        }
        else if (operatorType== '-'){
            newValue = oldValue - changeValue;
        }
        else if (operatorType== '*'){
            newValue = oldValue * changeValue;
        }
        else if (operatorType== '/'){
            newValue = oldValue / changeValue;
        }

        target.modifier().selectedTrialView[property](newValue);
    }

};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionSetElementProp.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetElementProp.prototype.setPointers = function(entitiesArr) {
    var target = entitiesArr.byId[this.target()];
    this.target(target);

    var changes = this.changes();
    for (var i=0; i<changes.length; i++) {
        changes[i].setPointers(entitiesArr);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetElementProp.prototype.reAddEntities = function(entitiesArr) {
    var changes = this.changes();
    for (var i = 0; i <changes.length; i++) {
        var variable = changes[i].variable();
        if (variable) {
            if (!entitiesArr.byId.hasOwnProperty(variable.id())) {
                entitiesArr.push(variable);
            }
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionSetElementProp}
 */
ActionSetElementProp.prototype.fromJS = function(data) {
    this.animate(data.animate);
    this.animationTime(data.animationTime);
    this.target(data.target);

    var changes = [];
    for (var i = 0 ;i <data.changes.length;i++){
        var tmp = data.changes[i];
        var obj = new ActionSetElementPropChange(this);
        obj.fromJS(tmp);
        changes.push(obj);
    }
    this.changes(changes);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionSetElementProp.prototype.toJS = function() {

    var changes= [];
    var origChanges = this.changes();
    for (var i = 0; i<origChanges.length; i++){
        var obj = origChanges[i].toJS();
        changes.push(obj);
    }

    var targetId = null;
    if (this.target()) {
        targetId = this.target().id();
    }

    return {
        type: this.type,
        target: targetId,
        animate: this.animate(),
        animationTime:this.animationTime,
        changes: changes
    };
};


////////////////////////////////////////  ActionSetElementPropChange  ///////////////////////////////////////////////////

var ActionSetElementPropChange = function(parentAction) {
    this.parentAction = parentAction;

    this.property = ko.observable(null);
    this.operatorType = ko.observable(null);
    this.changeType = ko.observable(null);
    this.value = ko.observable(0);
    this.variable = ko.observable(null);
};

ActionSetElementPropChange.prototype.operatorTypes = ["=", "+", "-", "*", "/"];
ActionSetElementPropChange.prototype.changeTypes =  ["value", "%", "variable"];

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionSetElementPropChange.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

ActionSetElementPropChange.prototype.setPointers = function(entitiesArr) {
    if (this.changeType() == "variable") {
        var varId = this.variable();
        var globVar = entitiesArr.byId[varId];
        if (globVar) {
            this.variable(globVar);
            this.parentAction.setVariableBackRef(globVar);
        }
        else {
            this.variable(null);
        }
    }
    else {
        this.variable(null);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetElementPropChange.prototype.reAddEntities = function(entitiesArr) {

};

ActionSetElementPropChange.prototype.fromJS = function(data) {
    this.property(data.property);
    this.operatorType(data.operatorType);
    this.changeType(data.changeType);
    this.value(data.value);
    if (data.variable) {
        this.variable(data.variable);
    }
};

ActionSetElementPropChange.prototype.toJS = function() {
    var variable = this.variable();
    if (variable) {
        variable = variable.id();
    }

    return {
        property: this.property(),
        operatorType: this.operatorType(),
        changeType: this.changeType(),
        value: this.value(),
        variable: variable
    };
};




////////////////////////////////////////  ActionSetProp (new version) ///////////////////////////////////////////////////

var ActionSetProp = function(event) {
    this.event = event;

    // serialized
    this.refToObjectProperty = new RefToObjectProperty(event);
    this.operand = new OperandVariable(event);
};

ActionSetProp.prototype.type = "ActionSetProp";
ActionSetProp.prototype.label = "Set Object Property";

ActionSetProp.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 */
ActionSetProp.prototype.setVariableBackRef = function(){
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionSetProp.prototype.run = function(triggerParams) {
    var rValue = this.operand.getValue(triggerParams);
    this.refToObjectProperty.setValue(rValue);
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionSetProp.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetProp.prototype.setPointers = function(entitiesArr) {
    this.refToObjectProperty.setPointers(entitiesArr);
    this.operand.setPointers(entitiesArr);
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetProp.prototype.reAddEntities = function(entitiesArr) {
    if (this.operand && this.operand.reAddEntities) {
        this.operand.reAddEntities(entitiesArr);
    }
    if (this.refToObjectProperty && this.refToObjectProperty.reAddEntities) {
        this.refToObjectProperty.reAddEntities(entitiesArr);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionSetProp}
 */
ActionSetProp.prototype.fromJS = function(data) {
    this.refToObjectProperty.fromJS(data.refToObjectProperty);
    this.operand.fromJS(data.operand);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionSetProp.prototype.toJS = function() {
    return {
        type: this.type,
        refToObjectProperty: this.refToObjectProperty.toJS(),
        operand: this.operand.toJS()
    };
};










////////////////////////////////////////  ActionRecordData ///////////////////////////////////////////////////

var ActionRecordData = function(event) {
    this.event = event;
};

ActionRecordData.prototype.type = "ActionRecordData";
ActionRecordData.prototype.label = "Record Variables Instantly";

ActionRecordData.prototype.isValid = function(){
    return true;
};


/**s
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionRecordData.prototype.run = function(triggerParams) {
    player.recordData()
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionRecordData.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionRecordData.prototype.setPointers = function(entitiesArr) {
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionRecordData.prototype.reAddEntities = function(entitiesArr) {
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionRecordData}
 */
ActionRecordData.prototype.fromJS = function(data) {
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionRecordData.prototype.toJS = function() {
    return { type: this.type};
};





////////////////////////////////////////  ActionSelectFromArray ///////////////////////////////////////////////////

var ActionSelectFromArray = function(event) {
    this.event = event;

    // serialized
    this.inVarArr = ko.observable(null);
    this.inVarIndex = ko.observable(null);
    this.InsertOption = ko.observable("variable"); // either variable or fixed or end
    this.indexFixedVal = ko.observable(1);
    this.outVar = ko.observable(null);
};

ActionSelectFromArray.prototype.type = "ActionSelectFromArray";
ActionSelectFromArray.prototype.label = "Select From Array (Read)";

ActionSelectFromArray.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionSelectFromArray.prototype.setInVarArrBackRef = function(){
    this.inVarArr().addBackRef(this, this.event, false, true, 'array to select from');
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionSelectFromArray.prototype.setInVarIndexBackRef = function(){
    this.inVarIndex().addBackRef(this, this.event, false, true, 'as index');
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionSelectFromArray.prototype.setOutVarBackRef = function(){
    this.outVar().addBackRef(this, this.event, true, false, 'selected from array');
};

ActionSelectFromArray.prototype.removeInArrVariable = function(){
    this.inVarArr(null);
};

ActionSelectFromArray.prototype.removeInVariable = function(){
    this.inVarIndex(null);
};

ActionSelectFromArray.prototype.removeOutVariable = function(){
    this.outVar(null);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionSelectFromArray.prototype.run = function(triggerParams) {
    if (this.InsertOption()=='fixed') {
        var index = parseInt(this.indexFixedVal())-1;
    }
    else if (this.InsertOption()=='end'){
        var index = this.inVarArr().value().value().length-1;
    }
    else {
        var index = parseInt(this.inVarIndex().value().value())-1;
    }

    var value = this.inVarArr().value().getValueAt(index);
    if (this.outVar()) {
        this.outVar().value().setValue(value);
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionSelectFromArray.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSelectFromArray.prototype.setPointers = function(entitiesArr) {
    var inVarArr = entitiesArr.byId[this.inVarArr()];
    if (inVarArr){
        this.inVarArr(inVarArr);
        this.setInVarArrBackRef();
    }
    var inVarIndex = entitiesArr.byId[this.inVarIndex()];
    if (inVarIndex){
        this.inVarIndex(inVarIndex);
        this.setInVarIndexBackRef();
    }
    var outVar = entitiesArr.byId[this.outVar()];
    if (outVar){
        this.outVar(outVar);
        this.setOutVarBackRef();
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSelectFromArray.prototype.reAddEntities = function(entitiesArr) {
    if (this.inVarArr()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVarArr().id())) {
            entitiesArr.push(this.inVarArr());
        }
    }
    if (this.inVarIndex()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVarIndex().id())) {
            entitiesArr.push(this.inVarIndex());
        }
    }
    if (this.outVar()) {
        if (!entitiesArr.byId.hasOwnProperty(this.outVar().id())) {
            entitiesArr.push(this.outVar());
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionSelectFromArray}
 */
ActionSelectFromArray.prototype.fromJS = function(data) {
    this.inVarArr(data.inVarArr);
    this.inVarIndex(data.inVarIndex);
    this.outVar(data.outVar);
    if (data.hasOwnProperty('InsertOption')){
      this.InsertOption(data.InsertOption)
    }
    if (data.hasOwnProperty('indexFixedVal')){
        this.indexFixedVal(data.indexFixedVal)
    }

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionSelectFromArray.prototype.toJS = function() {
    var inVarArr = null;
    if (this.inVarArr()) {
        if (typeof this.inVarArr().id == 'function') {
            inVarArr = this.inVarArr().id();
        }
    }
    var inVarIndex = null;
    if (this.inVarIndex()) {
        if (typeof this.inVarIndex().id == 'function') {
            inVarIndex = this.inVarIndex().id();
        }
    }
    var outVar = null;
    if (this.outVar()) {
        if (typeof this.outVar().id == 'function') {
            outVar = this.outVar().id();
        }
    }
    return {
        type: this.type,
        inVarArr: inVarArr,
        inVarIndex: inVarIndex,
        outVar: outVar,
        InsertOption:this.InsertOption(),
        indexFixedVal:this.indexFixedVal()
    };
};



////////////////////////////////////////  ActionWriteToArray ///////////////////////////////////////////////////

var ActionWriteToArray = function(event) {
    this.event = event;

    // serialized
    this.inVarArr = ko.observable(null);
    this.inVarIndex = ko.observable(null);
    this.InsertOption = ko.observable("fixed");
    this.indexFixedVal = ko.observable(1);
    this.inVar = ko.observable(null);
};

ActionWriteToArray.prototype.type = "ActionWriteToArray";
ActionWriteToArray.prototype.label = "Change Array Entry (Write)";

ActionWriteToArray.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionWriteToArray.prototype.setInVarArrBackRef = function(){
    this.inVarArr().addBackRef(this, this.event, false, true, 'write to array');
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionWriteToArray.prototype.setInVarIndexBackRef = function(){
    this.inVarIndex().addBackRef(this, this.event, false, true, 'as index');
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionWriteToArray.prototype.setInVarBackRef = function(){
    this.inVar().addBackRef(this, this.event, true, false, 'selected from array');
};

ActionWriteToArray.prototype.removeInArrVariable = function(){
    this.inVarArr(null);
};

ActionWriteToArray.prototype.removeIndexVariable = function(){
    this.inVarIndex(null);
};

ActionWriteToArray.prototype.removeInVariable = function(){
    this.inVar(null);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionWriteToArray.prototype.run = function(triggerParams) {
    if (this.InsertOption()=='fixed') {
        var index = parseInt(this.indexFixedVal())-1;
    }
    else if (this.InsertOption()=='end'){
        var index = this.inVarArr().value().value().length-1;
    }
    else {
        var index = parseInt(this.inVarIndex().value().value())-1;
    }

    var value = this.inVar().value().value();
    if (this.inVarArr) {
        this.inVarArr().value().setValueAt(index,value);
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionWriteToArray.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionWriteToArray.prototype.setPointers = function(entitiesArr) {
    var inVarArr = entitiesArr.byId[this.inVarArr()];
    if (inVarArr){
        this.inVarArr(inVarArr);
        this.setInVarArrBackRef();
    }
    var inVarIndex = entitiesArr.byId[this.inVarIndex()];
    if (inVarIndex){
        this.inVarIndex(inVarIndex);
        this.setInVarIndexBackRef();
    }
    var inVar = entitiesArr.byId[this.inVar()];
    if (inVar){
        this.inVar(inVar);
        this.setInVarBackRef();
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionWriteToArray.prototype.reAddEntities = function(entitiesArr) {
    if (this.inVarArr()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVarArr().id())) {
            entitiesArr.push(this.inVarArr());
        }
    }
    if (this.inVarIndex()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVarIndex().id())) {
            entitiesArr.push(this.inVarIndex());
        }
    }
    if (this.inVar()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVar().id())) {
            entitiesArr.push(this.inVar());
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionWriteToArray}
 */
ActionWriteToArray.prototype.fromJS = function(data) {
    this.inVarArr(data.inVarArr);
    this.inVarIndex(data.inVarIndex);
    this.inVar(data.inVar);
    this.InsertOption(data.InsertOption);
    this.indexFixedVal(data.indexFixedVal);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionWriteToArray.prototype.toJS = function() {
    var inVarArr = null;
    if (this.inVarArr()) {
        if (typeof this.inVarArr().id == 'function') {
            inVarArr = this.inVarArr().id();
        }
    }
    var inVarIndex = null;
    if (this.inVarIndex()) {
        if (typeof this.inVarIndex().id == 'function') {
            inVarIndex = this.inVarIndex().id();
        }
    }
    var inVar = null;
    if (this.inVar()) {
        if (typeof this.inVar().id == 'function') {
            inVar = this.inVar().id();
        }
    }
    return {
        type: this.type,
        inVarArr: inVarArr,
        inVarIndex: inVarIndex,
        inVar: inVar,
        InsertOption:this.InsertOption(),
        indexFixedVal:this.indexFixedVal()
    };
};








////////////////////////////////////////  ActionModifyArray ///////////////////////////////////////////////////

var ActionModifyArray = function(event) {
    this.event = event;

    // serialized
    this.inVarArr = ko.observable(null);
    this.InsertOption = ko.observable("fixed");
    this.indexFixedVal = ko.observable(1);
    this.inVarIndex = ko.observable(null);
    this.insertVarList = ko.observableArray([]);
    this.insertVarLinkedOrNew = ko.observableArray([]);
    this.nrOfDeletions = ko.observable(0);
};

ActionModifyArray.prototype.type = "ActionModifyArray";
ActionModifyArray.prototype.label = "Add / Remove Entries (Splice)";

ActionModifyArray.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionModifyArray.prototype.setInVarArrBackRef = function(){
    this.inVarArr().addBackRef(this, this.event, false, true, 'modify to array');
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionModifyArray.prototype.setInVarIndexBackRef = function(){
    this.inVarIndex().addBackRef(this, this.event, false, true, 'as index');
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */

ActionModifyArray.prototype.setOutVarBackRefForOne = function(newVar){

    newVar.addBackRef(this, this.event, true, false, 'modify array');
};

ActionModifyArray.prototype.setOutVarBackRef = function(){
    var list = this.insertVarList();
    for (var i = 0; i<list.length; i++){
        list[i].addBackRef(this, this.event, true, false, 'modify array');
    }
};

ActionModifyArray.prototype.removeInArrVariable = function(){
    this.inVarArr(null);
};

ActionModifyArray.prototype.removeInVariable = function(){
    this.inVarIndex(null);
};

ActionModifyArray.prototype.removeOutVariable = function(){
    this.insertVarList([]);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionModifyArray.prototype.run = function(triggerParams) {
    if (this.InsertOption()=='fixed') {
        var index = parseInt(this.indexFixedVal())-1;
    }
    else if (this.InsertOption()=='end'){
        var index = this.inVarArr().value().value().length;
    }
    else {
        var index = parseInt(this.inVarIndex().value().value())-1;
    }

    var valueList = [];
    for (var i = 0; i<this.insertVarList().length;i++){
        // if value is linked put the variable inside
        if (this.insertVarLinkedOrNew()[i]()){
            valueList.push(this.insertVarList()[i].value());
        }
        // if if should not be linked add a new variable inside
        else{
            var newVar = new GlobalVar(this.insertVarList()[i].expData).fromJS(this.insertVarList()[i].toJS());
            newVar.value().value(this.insertVarList()[i].value().toJS());
            valueList.push(newVar.value());
        }

    }

    if (this.inVarArr()) {
        this.inVarArr().value().value().splice(index-1,parseInt(this.nrOfDeletions()));
        for (var i = 0; i<valueList.length; i++){
            this.inVarArr().value().value().splice(index,0,valueList[i]);
        }

    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionModifyArray.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionModifyArray.prototype.setPointers = function(entitiesArr) {
    var inVarArr = entitiesArr.byId[this.inVarArr()];
    if (inVarArr){
        this.inVarArr(inVarArr);
        this.setInVarArrBackRef();
    }
    var inVarIndex = entitiesArr.byId[this.inVarIndex()];
    if (inVarIndex){
        this.inVarIndex(inVarIndex);
        this.setInVarIndexBackRef();
    }


    var list = this.insertVarList();
    var newList = []
    for (var i = 0; i<list.length; i++){
        newList.push(entitiesArr.byId[list[i]]);
    }
    this.insertVarList(newList);
    this.setOutVarBackRef();

    var insertVarLinkedOrNew = [];
    for (var i = 0; i<this.insertVarLinkedOrNew().length; i++){
        insertVarLinkedOrNew.push(ko.observable(this.insertVarLinkedOrNew()[i]));
    }
    this.insertVarLinkedOrNew(insertVarLinkedOrNew);

    this.optionConverter();

};

ActionModifyArray.prototype.optionConverter = function() {
   if (this.insertVarLinkedOrNew().length==0) {
      var l =  this.insertVarList().length;
      for (var i = 0;i <l; i++){
          this.insertVarLinkedOrNew.push(ko.observable(true));
      }
   }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionModifyArray.prototype.reAddEntities = function(entitiesArr) {
    if (this.inVarArr()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVarArr().id())) {
            entitiesArr.push(this.inVarArr());
        }
    }
    if (this.inVarIndex()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVarIndex().id())) {
            entitiesArr.push(this.inVarIndex());
        }
    }
    var list = this.insertVarList();
    for (var i = 0; i<list.length; i++){
        if (!entitiesArr.byId.hasOwnProperty(list[i].id())) {
            entitiesArr.push(list[i]);
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionModifyArray}
 */
ActionModifyArray.prototype.fromJS = function(data) {
    this.inVarArr(data.inVarArr);
    this.inVarIndex(data.inVarIndex);
    this.insertVarList(data.insertVarList);
    this.nrOfDeletions(data.nrOfDeletions);
    this.InsertOption(data.InsertOption);
    this.indexFixedVal(data.indexFixedVal);

    if (data.hasOwnProperty("insertVarLinkedOrNew")) {
        this.insertVarLinkedOrNew(data.insertVarLinkedOrNew);
    }

    return this;

};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionModifyArray.prototype.toJS = function() {
    var inVarArr = null;
    if (this.inVarArr()) {
        if (typeof this.inVarArr().id == 'function') {
            inVarArr = this.inVarArr().id();
        }
    }
    var inVarIndex = null;
    if (this.inVarIndex()) {
        if (typeof this.inVarIndex().id == 'function') {
            inVarIndex = this.inVarIndex().id();
        }
    }
    var insertVarList = null;
    if (this.insertVarList()) {
        var list = this.insertVarList();
        var insertVarList = [];
        for (var i = 0; i<list.length; i++){
            insertVarList.push(list[i].id());
        }
    }

    var insertVarLinkedOrNew = [];
    for (var i = 0; i<this.insertVarLinkedOrNew().length; i++){
        insertVarLinkedOrNew.push(this.insertVarLinkedOrNew()[i]());
    }

    return {
        type: this.type,
        inVarArr: inVarArr,
        inVarIndex: inVarIndex,
        insertVarList: insertVarList,
        nrOfDeletions:this.nrOfDeletions(),
        InsertOption:this.InsertOption(),
        indexFixedVal:this.indexFixedVal(),
        insertVarLinkedOrNew:insertVarLinkedOrNew

    };
};







////////////////////////////////////////  ActionShuffleArray ///////////////////////////////////////////////////

var ActionShuffleArray = function(event) {
    this.event = event;
    // serialized
    this.inVarArr = ko.observable(null);
};

ActionShuffleArray.prototype.type = "ActionShuffleArray";
ActionShuffleArray.prototype.label = "Shuffle Array Entries";

ActionShuffleArray.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionShuffleArray.prototype.setInVarArrBackRef = function(){
    this.inVarArr().addBackRef(this, this.event, false, true, 'shuffle array');
};


ActionShuffleArray.prototype.removeInArrVariable = function(){
    this.inVarArr(null);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionShuffleArray.prototype.run = function(triggerParams) {

    if (this.inVarArr()) {
        this.inVarArr().value().setValue(this.event.parent.parent.factorGroup.expTrialLoop.reshuffle(this.inVarArr().value().value()));
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionShuffleArray.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionShuffleArray.prototype.setPointers = function(entitiesArr) {
    var inVarArr = entitiesArr.byId[this.inVarArr()];
    if (inVarArr){
        this.inVarArr(inVarArr);
        this.setInVarArrBackRef();
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionShuffleArray.prototype.reAddEntities = function(entitiesArr) {
    if (this.inVarArr()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVarArr().id())) {
            entitiesArr.push(this.inVarArr());
        }
    }

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionModifyArray}
 */
ActionShuffleArray.prototype.fromJS = function(data) {
    this.inVarArr(data.inVarArr);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionShuffleArray.prototype.toJS = function() {
    var inVarArr = null;
    if (this.inVarArr()) {
        if (typeof this.inVarArr().id == 'function') {
            inVarArr = this.inVarArr().id();
        }
    }

    return {
        type: this.type,
        inVarArr: inVarArr

    };
};







////////////////////////////////////////  ActionLoadFileIds ///////////////////////////////////////////////////

var ActionLoadFileIds = function(event) {
    this.event = event;

    // serialized
    this.files = ko.observableArray([]);
    this.outVarFileIds = ko.observable(null);
    this.outVarFileNames = ko.observable(null);
};

ActionLoadFileIds.prototype.type = "ActionLoadFileIds";
ActionLoadFileIds.prototype.label = "Load File Ids";

ActionLoadFileIds.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionLoadFileIds.prototype.setOutVarBackRef = function(){
    this.outVarFileIds().addBackRef(this, this.event, true, false, 'set file ids');
};
ActionLoadFileIds.prototype.setOutVarFileNamesBackRef = function(){
    this.outVarFileNames().addBackRef(this, this.event, true, false, 'set file names');
};

ActionLoadFileIds.prototype.removeOutVariable = function(){
    this.outVarFileIds(null);
};

ActionLoadFileIds.prototype.removeOutVariableFileNames = function(){
    this.outVarFileIds(null);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionLoadFileIds.prototype.run = function(triggerParams) {
    if (this.outVarFileIds()) {
        // clear array:
        var arrVarValue = this.outVarFileIds().value();
        arrVarValue.value([]);

        // fill values:
        jQuery.each(this.files(), function (idx, file) {
            arrVarValue.pushValue(file.id);
        });
    }
    if (this.outVarFileNames()) {
        // clear array:
        var arrVarNamesValue = this.outVarFileNames().value();
        arrVarNamesValue.value([]);

        // fill values:
        jQuery.each(this.files(), function (idx, file) {
            arrVarNamesValue.pushValue(file.name_original);
        });
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionLoadFileIds.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionLoadFileIds.prototype.setPointers = function(entitiesArr) {
    var outVarFileIds = entitiesArr.byId[this.outVarFileIds()];
    if (outVarFileIds){
        this.outVarFileIds(outVarFileIds);
        this.setOutVarBackRef();
    }
    var outVarFileNames = entitiesArr.byId[this.outVarFileNames()];
    if (outVarFileNames){
        this.outVarFileNames(outVarFileNames);
        this.setOutVarFileNamesBackRef();
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionLoadFileIds.prototype.reAddEntities = function(entitiesArr) {
    if (this.outVarFileIds()) {
        if (!entitiesArr.byId.hasOwnProperty(this.outVarFileIds().id())) {
            entitiesArr.push(this.outVarFileIds());
        }
    }
    if (this.outVarFileNames()) {
        if (!entitiesArr.byId.hasOwnProperty(this.outVarFileNames().id())) {
            entitiesArr.push(this.outVarFileNames());
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionLoadFileIds}
 */
ActionLoadFileIds.prototype.fromJS = function(data) {
    this.files(data.files);
    this.outVarFileIds(data.outVarFileIds);
    if (data.hasOwnProperty('outVarFileNames')) {
        this.outVarFileNames(data.outVarFileNames);
    }
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionLoadFileIds.prototype.toJS = function() {
    var outVarFileIds = null;
    if (this.outVarFileIds()) {
        if (typeof this.outVarFileIds().id == 'function') {
            outVarFileIds = this.outVarFileIds().id();
        }
    }
    var outVarFileNames = null;
    if (this.outVarFileNames()) {
        if (typeof this.outVarFileNames().id == 'function') {
            outVarFileNames = this.outVarFileNames().id();
        }
    }
    return {
        type: this.type,
        files: this.files(),
        outVarFileIds: outVarFileIds,
        outVarFileNames: outVarFileNames
    };
};


////////////////////////////////////////////   ActionJumpTo   /////////////////////////////////////////////////////

/**
 * This action jumps to another frame or next trial.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionJumpTo = function(event) {
    this.event = event;
    this.jumpType = ko.observable(null);
    this.frameToJump= ko.observable(null);
    this.taskToJumpId= ko.observable(null);
    this.trialToJumpId= ko.observable(null);
    this.blockToJumpId= ko.observable(null);
    this.conditionGroupIdx = ko.observable(null);
    this.checkRequired= ko.observable(null);

    this.alreadyTriggered = false;
};

ActionJumpTo.prototype.type = "ActionJumpTo";
ActionJumpTo.prototype.label = "Jump To";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionJumpTo.prototype.isValid = function(){
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionJumpTo.prototype.run = function(triggerParams) {

    if (this.alreadyTriggered) {
        // Prevent Bug due to double clicking leading to duplicate execution and jumping over trials etc.
        return;
    }

    // check validity only if the jump is to next frame
    if (this.checkRequired()){
        var isValid = true;
        var elements = player.currentFrame.frameData.elements();
        elements.forEach(function(element) {
            if (typeof element.content().isInputValid == "function"){
                if (!element.content().isInputValid()){
                    isValid = false;
                }
            }
        });
        // now display error message at navigation element
        var elements = player.currentFrame.frameData.elements();
        elements.forEach(function(element) {
            if(element.content() instanceof NaviElement){
                element.content().showSubmitError(!isValid);
            }
        });
    }

    if (isValid || !this.checkRequired()) {
        this.alreadyTriggered = true;

        if (this.jumpType() == "previousFrame"){
            player.currentFrame.endFrameAndGoBack();
        }
        else if (this.jumpType() == "nextFrame"){
            player.currentFrame.endFrame();
        }
        else if (this.jumpType() == "nextTrial"){
            player.currentFrame.finishFrame();
            player.startNextTrial()
        }
        else if (this.jumpType() == "nextTask"){
            player.currentFrame.finishFrame();
            player.recordData();
            player.jumpToNextTask();
        }
        else if (this.jumpType() == "nextBlock"){
            player.currentFrame.finishFrame();
            player.recordData();
            player.startNextBlock();
        }

        else if (this.jumpType() == "specificFrame"){
            player.currentFrame.goToCustomFrame(this.frameToJump());
        }
        else if (this.jumpType() == "specificTrial"){
            player.currentFrame.finishFrame();
            player.recordData();
            player.startSpecificTrial(this.trialToJumpId());
        }
        else if (this.jumpType() == "specificTask"){
            player.currentFrame.finishFrame();
            player.recordData();
            player.jumpToSpecificTask(this.taskToJumpId());
        }
        else if (this.jumpType() == "specificBlock"){
            player.currentFrame.finishFrame();
            player.recordData();
            player.jumpToSpecificBlock(this.blockToJumpId());
        }

        else if (this.jumpType() == "conditionGroup"){
           // Todo
        }
    }

};

/**
 * this function is called in the player when the frame starts. It sets up the knockout subscribers at the globalVars.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
ActionJumpTo.prototype.setupOnPlayerFrame = function(playerFrame) {
    this.alreadyTriggered = false;
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionJumpTo.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

ActionJumpTo.prototype.reAddEntities = function(entitiesArr) {
    if (this.jumpType() == "specificFrame") {
        if (this.frameToJump()) {
            if (!entitiesArr.byId.hasOwnProperty(this.frameToJump().id())) {
                entitiesArr.push(this.frameToJump());
            }
        }
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionJumpTo.prototype.setPointers = function(entitiesArr) {
    var frame = entitiesArr.byId[this.frameToJump()];
    this.frameToJump(frame);

    // converter for old studies
    if (this.checkRequired()=== null && this.jumpType() == "nextFrame"){
        this.checkRequired(true);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionJumpTo}
 */
ActionJumpTo.prototype.fromJS = function(data) {
    this.jumpType(data.jumpType);
    this.frameToJump(data.frameToJump);
    if (data.hasOwnProperty('taskToJumpId')){
        this.taskToJumpId(data.taskToJumpId);
    }
    if (data.hasOwnProperty('trialToJumpId')){
        this.trialToJumpId(data.trialToJumpId);
    }
    if (data.hasOwnProperty('conditionGroupIdx')){
        this.conditionGroupIdx(data.conditionGroupIdx);
    }
    if (data.hasOwnProperty('blockToJumpId')){
        this.blockToJumpId(data.blockToJumpId);
    }

    if (data.hasOwnProperty('checkRequired')){
        this.checkRequired(data.checkRequired);
    }


    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionJumpTo.prototype.toJS = function() {
    var frameToJump;
    if (this.frameToJump()){
        frameToJump = this.frameToJump().id();
    }
    else {
        frameToJump = null;
    }


    return {
        type: this.type,
        jumpType: this.jumpType(),
        frameToJump: frameToJump,
        taskToJumpId:this.taskToJumpId(),
        trialToJumpId:this.trialToJumpId(),
        conditionGroupIdx:this.conditionGroupIdx(),
        blockToJumpId:this.blockToJumpId(),
        checkRequired:this.checkRequired()

    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////   ActionDelayedActions   /////////////////////////////////////////////////////

/**
 * This action jumps to another frame or next trial.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionDelayedActions = function(event) {
    this.event = event;
    this.timeoutFcns = [];

    // serialized:
    this.delayInMs = ko.observable(1000);
    this.subActions = ko.observableArray([]);

    this.delayType = ko.observable('fixed');
    this.variable = ko.observable(null);
};

ActionDelayedActions.prototype.type = "ActionDelayedActions";
ActionDelayedActions.prototype.label = "Delayed Actions (Time Callback)";


ActionDelayedActions.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, true, false, 'Delayed Action');
};


ActionDelayedActions.prototype.removeVariable = function(){
    this.variable(null);
};


/**
 * recursively fill arr with all nested sub actions
 */
ActionDelayedActions.prototype.getAllActions = function(arr) {
    var actions = this.subActions();
    for (var i=0; i<actions.length; i++) {
        arr.push(actions[i]);
        if (typeof actions[i].getAllActions === "function") {
            actions[i].getAllActions(arr);
        }
    }
};

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionDelayedActions.prototype.isValid = function(){
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionDelayedActions.prototype.run = function(triggerParams) {
    var self = this;
    if (this.delayType() =='variable'){
        var delayInMs = parseInt(this.variable().getValue(triggerParams));
    }
    else{
        var delayInMs =   parseInt(this.delayInMs());
    }

    var timeoutFcn = setTimeout(function() {
        var actions = self.subActions();
        for (var i=0; i<actions.length; i++) {
            actions[i].run(triggerParams);
        }
    },delayInMs);
    this.timeoutFcns.push(timeoutFcn);
};


/**
 * this function is called in the player when the frame starts. It sets up the knockout subscribers at the globalVars.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
ActionDelayedActions.prototype.setupOnPlayerFrame = function(playerFrame) {
    jQuery.each( this.subActions(), function( index, action ) {
        if (typeof action.setupOnPlayerFrame === "function") {
            action.setupOnPlayerFrame(playerFrame);
        }
    } );
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionDelayedActions.prototype.destroyOnPlayerFrame = function(playerFrame) {
    jQuery.each( this.timeoutFcns, function( index, fcn ) {
        clearTimeout(fcn);
    } );
    jQuery.each( this.subActions(), function( index, action ) {
        action.destroyOnPlayerFrame(playerFrame);
    } );
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionDelayedActions.prototype.setPointers = function(entitiesArr) {

    var varToSet = entitiesArr.byId[this.variable()];
    if (varToSet){
        this.variable(varToSet);
        this.setVariableBackRef(varToSet);
    }

    jQuery.each( this.subActions(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionDelayedActions.prototype.reAddEntities = function(entitiesArr) {
    jQuery.each( this.subActions(), function( index, elem ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionDelayedActions}
 */
ActionDelayedActions.prototype.fromJS = function(data) {
    this.delayInMs(parseInt(data.delayInMs));

    var subActions = [];
    for (var i=0; i<data.subActions.length; i++) {
        var subAction = actionFactory(this.event, data.subActions[i].type);
        subAction.fromJS(data.subActions[i]);
        subActions.push(subAction);
    }
    this.subActions(subActions);

    if (data.hasOwnProperty("variable")){
        this.variable(data.variable);
    }
    if (data.hasOwnProperty("delayType")){
        this.delayType(data.delayType);
    }


    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionDelayedActions.prototype.toJS = function() {
    var subActions = this.subActions();
    var subActionsData = [];
    for (var i=0; i<subActions.length; i++) {
        subActionsData.push(subActions[i].toJS());
    }

    var varId = null;
    if (this.variable()) {
        if (typeof this.variable().id == 'function') {
            varId = this.variable().id();
        }
    }

    return {
        type: this.type,
        delayInMs: parseInt(this.delayInMs()),
        subActions: subActionsData,
        variable: varId,
        delayType:this.delayType()
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////   ActionStartRepeatedActions   /////////////////////////////////////////////////////

/**
 * This action jumps to another frame or next trial.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionStartRepeatedActions = function(event) {
    this.event = event;
    this.timeoutFcns = [];

    // serialized:
    this.allowMultiple = ko.observable(false); // should it be possible to start this repeatedAction again even if it is still running?
    this.startWithoutDelay = ko.observable(false); // should the subActions be run for the first time directly without waiting for the first delay?
    this.stopConditionEnabled = ko.observable(false); // is a stop condition enabled?
    this.stopCondition = ko.observable(null); // checked before each repetition, if enabled.
    this.delayInMs = ko.observable(1000);
    this.subActions = ko.observableArray([]);

    this.executionType = ko.observable('time');
};

ActionStartRepeatedActions.prototype.type = "ActionStartRepeatedActions";
ActionStartRepeatedActions.prototype.label = "Repeated Actions (While Loop)";

/**
 * recursively fill arr with all nested sub actions
 */
ActionStartRepeatedActions.prototype.getAllActions = function(arr) {
    var actions = this.subActions();
    for (var i=0; i<actions.length; i++) {
        arr.push(actions[i]);
        if (typeof actions[i].getAllActions === "function") {
            actions[i].getAllActions(arr);
        }
    }
};

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionStartRepeatedActions.prototype.isValid = function(){
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionStartRepeatedActions.prototype.run = function(triggerParams) {


    if (this.executionType() =='time'){
        var self = this;
        var start = new Date().getTime();
        var nextAt = start;
        var timeoutIdx = this.timeoutFcns.length;

        if (!this.allowMultiple()) {
            if (timeoutIdx > 0) {
                // this repeated action is already running, therefore do nothing:
                return;
            }
        }

        this.timeoutFcns.push(null);

        var scheduleNextRepetition = function() {

            // calculate time when next repetition should be scheduled:
            nextAt += self.delayInMs();
            var currTime = new Date().getTime();
            var waitingTime = nextAt - currTime;
            self.timeoutFcns[timeoutIdx] = setTimeout(runRepetition, waitingTime);

            if (waitingTime < 0) {
                console.warn("warning: ActionStartRepeatedActions cannot keep up with the desired delayInMs ("+self.delayInMs()+")")
            }

            // var drift = (currTime - start) % self.delayInMs();
            // console.log("drift: "+drift);

        };

        var runRepetition = function() {

            // check stopCondition.
            if (self.stopConditionEnabled()) {
                if (self.stopCondition().checkIfTrue(triggerParams)) {
                    return;
                }
            }

            // run all subActions:
            var actions = self.subActions();
            for (var i=0; i<actions.length; i++) {
                actions[i].run(triggerParams);
            }

            // schedule next repetition:
            scheduleNextRepetition();

        };

        if (this.startWithoutDelay()) {
            runRepetition();
        }
        else {
            scheduleNextRepetition();
        }
    }
    else{
        var stopping =  this.stopCondition().checkIfTrue(triggerParams);
        var actions = this.subActions();
        while (!stopping){
            for (var i=0; i<actions.length; i++) {
                actions[i].run(triggerParams);
            }
            stopping = this.stopCondition().checkIfTrue(triggerParams)
        }
    }


};


/**
 * this function is called in the player when the frame starts. It sets up the knockout subscribers at the globalVars.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
ActionStartRepeatedActions.prototype.setupOnPlayerFrame = function(playerFrame) {
    jQuery.each( this.subActions(), function( index, action ) {
        if (typeof action.setupOnPlayerFrame === "function") {
            action.setupOnPlayerFrame(playerFrame);
        }
    } );
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionStartRepeatedActions.prototype.destroyOnPlayerFrame = function(playerFrame) {
    jQuery.each( this.timeoutFcns, function( index, fcn ) {
        clearTimeout(fcn);
    } );
    jQuery.each( this.subActions(), function( index, action ) {
        action.destroyOnPlayerFrame(playerFrame);
    } );
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionStartRepeatedActions.prototype.setPointers = function(entitiesArr) {
    jQuery.each( this.subActions(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );

    if (this.stopCondition()) {
        this.stopCondition().setPointers(entitiesArr);
    }
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionStartRepeatedActions.prototype.reAddEntities = function(entitiesArr) {
    jQuery.each( this.subActions(), function( index, elem ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );

    if (this.stopCondition()) {
        this.stopCondition().reAddEntities(entitiesArr);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionStartRepeatedActions}
 */
ActionStartRepeatedActions.prototype.fromJS = function(data) {
    this.allowMultiple(data.allowMultiple);
    this.startWithoutDelay(data.startWithoutDelay);
    this.stopConditionEnabled(data.stopConditionEnabled);

    if (data.stopCondition) {
        var stopCondition = requirementFactory(this.event, data.stopCondition.type);
        stopCondition.fromJS(data.stopCondition);
        this.stopCondition(stopCondition);
    }

    this.delayInMs(parseInt(data.delayInMs));

    var subActions = [];
    for (var i=0; i<data.subActions.length; i++) {
        var subAction = actionFactory(this.event, data.subActions[i].type);
        subAction.fromJS(data.subActions[i]);
        subActions.push(subAction);
    }
    this.subActions(subActions);

    if(data.hasOwnProperty('executionType')) {
        this.executionType(data.executionType);
    }

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionStartRepeatedActions.prototype.toJS = function() {
    var subActions = this.subActions();
    var subActionsData = [];
    for (var i=0; i<subActions.length; i++) {
        subActionsData.push(subActions[i].toJS());
    }

    var stopCondition = null;
    if (this.stopCondition()) {
        stopCondition = this.stopCondition().toJS();
    }

    return {
        type: this.type,
        allowMultiple: this.allowMultiple(),
        startWithoutDelay: this.startWithoutDelay(),
        stopConditionEnabled: this.stopConditionEnabled(),
        stopCondition: stopCondition,
        delayInMs: parseInt(this.delayInMs()),
        subActions: subActionsData,
        executionType:this.executionType()
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





////////////////////////////////////////////   ActionConditional   /////////////////////////////////////////////////////

/**
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */



var ActionConditional = function(event) {
    this.event = event;

    // serialized:
    this.ifElseConditions = ko.observableArray([new ActionIfCondition(this.event)]);
    this.defaultSubActions =  ko.observableArray([]);
    this.defaultConditionActive = ko.observable(false);

};

ActionConditional.prototype.type = "ActionConditional";
ActionConditional.prototype.label = "Requirement Actions (If...Then)";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionConditional.prototype.isValid = function(){
    return true;
};

ActionConditional.prototype.deleteIfCondition = function(index){
   this.ifElseConditions.splice(index,1);
};


ActionConditional.prototype.copyIfCondition = function(index){
   var copyData =  this.ifElseConditions()[index].toJS();
   var newCondition = new ActionIfCondition(this.event);
   newCondition.fromJS(copyData);
   var entiriesArr = this.event.parent.expData.entities;
   newCondition.setPointers(entiriesArr);
   this.ifElseConditions.push(newCondition);
};



ActionConditional.prototype.addIfCondition = function(){
    this.ifElseConditions.push(new ActionIfCondition(this.event));
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionConditional.prototype.run = function(triggerParams) {
    var ifElseConditions = this.ifElseConditions();
    var foundTrueCase = false;
    var caseIndex = 0;
    while (foundTrueCase ==false && caseIndex<ifElseConditions.length){
        var requirement = ifElseConditions[caseIndex].requirement();
        var actionList = ifElseConditions[caseIndex].subActions();
        if (requirement==null || requirement.checkIfTrue(triggerParams)) {
            foundTrueCase = true;
            for (var j=0; j<actionList.length; j++) {
                actionList[j].run(triggerParams);
            }
        }
        caseIndex ++;
    }
    if (foundTrueCase==false && this.defaultConditionActive()){
        var actionList = this.defaultSubActions();
        for (var j=0; j<actionList.length; j++) {
            actionList[j].run(triggerParams);
        }
    }
};

/**
 * this function is called in the player when the frame starts. It sets up the knockout subscribers at the globalVars.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
ActionConditional.prototype.setupOnPlayerFrame = function(playerFrame) {
    jQuery.each( this.defaultSubActions(), function( index, action ) {
        if (typeof action.setupOnPlayerFrame === "function") {
            action.setupOnPlayerFrame(playerFrame);
        }
    } );
    jQuery.each( this.ifElseConditions(), function( index, condition ) {
        if (typeof condition.setupOnPlayerFrame === "function") {
            condition.setupOnPlayerFrame(playerFrame);
        }
    } );
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionConditional.prototype.destroyOnPlayerFrame = function(playerFrame) {
    jQuery.each( this.defaultSubActions(), function( index, action ) {
        action.destroyOnPlayerFrame(playerFrame);
    } );
    jQuery.each( this.ifElseConditions(), function( index, ifElseCond ) {
        ifElseCond.destroyOnPlayerFrame(playerFrame);
    } );
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionConditional.prototype.setPointers = function(entitiesArr) {
    jQuery.each( this.defaultSubActions(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
    jQuery.each( this.ifElseConditions(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionConditional.prototype.reAddEntities = function(entitiesArr) {
    jQuery.each( this.defaultSubActions(), function( index, elem ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );
    jQuery.each( this.ifElseConditions(), function( index, elem ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionConditional}
 */
ActionConditional.prototype.fromJS = function(data) {

    var defaultSubActions = [];
    for (var i=0; i<data.defaultSubActions.length; i++) {
        var subAction = actionFactory(this.event, data.defaultSubActions[i].type);
        subAction.fromJS(data.defaultSubActions[i]);
        defaultSubActions.push(subAction);
    }
    this.defaultSubActions(defaultSubActions);

    var ifElseConditions = [];
    for (var i=0; i<data.ifElseConditions.length; i++) {
        var ifCondition = new ActionIfCondition(this.event);
        ifCondition.fromJS(data.ifElseConditions[i]);
        ifElseConditions.push(ifCondition);
    }
    this.ifElseConditions(ifElseConditions);



    this.defaultConditionActive(data.defaultConditionActive);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionConditional.prototype.toJS = function() {
    var defaultSubActions = this.defaultSubActions();
    var defSubActions = [];
    for (var i=0; i<defaultSubActions.length; i++) {
        defSubActions.push(defaultSubActions[i].toJS());
    }
    var ifElseConditions = this.ifElseConditions();
    var ifConditions = [];
    for (var i=0; i<ifElseConditions.length; i++) {
        ifConditions.push(ifElseConditions[i].toJS());
    }

    return {
        type: this.type,
        defaultSubActions: defSubActions,
        ifElseConditions: ifConditions,
        defaultConditionActive: this.defaultConditionActive()
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





////////////////////////////////////////////   ActionIfCondition  /////////////////////////////////////////////////////

/**
 * This action jumps to another frame or next trial.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionIfCondition = function(event) {
    this.event = event;
    this.requirement = ko.observable(new RequirementAND(this.event));
    this.requirement().setParent(this);
    this.subActions = ko.observableArray([]);
};

ActionIfCondition.prototype.type = "ActionIfCondition";
ActionIfCondition.prototype.label = "If Condition";

/**
 * recursively fill arr with all nested sub actions
 */
ActionIfCondition.prototype.getAllActions = function(arr) {
    var actions = this.subActions();
    for (var i=0; i<actions.length; i++) {
        arr.push(actions[i]);
        if (typeof actions[i].getAllActions === "function") {
            actions[i].getAllActions(arr);
        }
    }
};

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionIfCondition.prototype.isValid = function(){
    return true;
};


/**
 * deletes all requirements.
 */
ActionIfCondition.prototype.deleteRequirement = function() {
    this.requirement(new RequirementAND(this));
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionIfCondition.prototype.run = function(triggerParams) {
    var self = this;
};

/**
 * this function is called in the player when the frame starts. It sets up the knockout subscribers at the globalVars.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
ActionIfCondition.prototype.setupOnPlayerFrame = function(playerFrame) {
    jQuery.each( this.subActions(), function( index, action ) {
        if (typeof action.setupOnPlayerFrame === "function") {
            action.setupOnPlayerFrame(playerFrame);
        }
    } );
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionIfCondition.prototype.destroyOnPlayerFrame = function(playerFrame) {
    jQuery.each( this.subActions(), function( index, action ) {
        action.destroyOnPlayerFrame(playerFrame);
    } );
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionIfCondition.prototype.setPointers = function(entitiesArr) {
    jQuery.each( this.subActions(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
    this.requirement().setPointers(entitiesArr);
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionIfCondition.prototype.reAddEntities = function(entitiesArr) {
    jQuery.each( this.subActions(), function( index, elem ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );
    this.requirement().reAddEntities(entitiesArr);
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionIfCondition}
 */
ActionIfCondition.prototype.fromJS = function(data) {

    var requirement = requirementFactory(this.event, data.requirement.type);
    requirement.fromJS(data.requirement);
    this.requirement(requirement);

    var subActions = [];
    for (var i=0; i<data.subActions.length; i++) {
        var subAction = actionFactory(this.event, data.subActions[i].type);
        subAction.fromJS(data.subActions[i]);
        subActions.push(subAction);
    }
    this.subActions(subActions);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionIfCondition.prototype.toJS = function() {
    var subActions = this.subActions();
    var subActionsData = [];
    for (var i=0; i<subActions.length; i++) {
        subActionsData.push(subActions[i].toJS());
    }

    var requirement = this.requirement().toJS();

    return {
        type: this.type,
        subActions: subActionsData,
        requirement: requirement
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







/////////////////////////////////////////////   ActionSetVariable    ////////////////////////////////////////////////

/**
 * This action allows to change the value of a variable.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */

var ActionSetVariable = function(event) {
    this.event = event;

    // serialized
    this.variable = ko.observable(null);
    this.operand = ko.observable(new OperandVariable(event));
};
ActionSetVariable.prototype.type = "ActionSetVariable";
ActionSetVariable.prototype.label = "Set / Record Variable";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionSetVariable.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionSetVariable.prototype.setVariableBackRef = function(variable){
    var self = this;
    variable.addBackRef(this, this.event, true, false, 'set variable', function(globalVar) {
        self.removeVariable();
    });
};

ActionSetVariable.prototype.removeVariable = function(){
    this.variable(null);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionSetVariable.prototype.run = function(triggerParams) {
    var rValue = this.operand().getValue(triggerParams);
    if (this.variable()) {
        this.variable().setValue(rValue);
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionSetVariable.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetVariable.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        var varToSet = entitiesArr.byId[this.variable()];
        if (varToSet) {
            this.variable(varToSet);
            this.setVariableBackRef(varToSet);
        }
        else {
            console.log("warning: missing variable!")
            this.variable(null);
        }
    }
    this.operand().setPointers(entitiesArr);
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetVariable.prototype.reAddEntities = function(entitiesArr) {
    if (this.variable()) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }
    if (this.operand() && this.operand().reAddEntities) {
        this.operand().reAddEntities(entitiesArr);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionSetVariable}
 */
ActionSetVariable.prototype.fromJS = function(data) {
    this.variable(data.variable);
    var operand = new OperandVariable(this.event);
    operand.fromJS(data.operand);
    this.operand(operand);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionSetVariable.prototype.toJS = function() {
    var varId = null;
    if (this.variable()) {
        if (typeof this.variable().id == 'function') {
            varId = this.variable().id();
        }
    }
    return {
        variable: varId,
        operand: this.operand().toJS(),
        type: this.type
    };
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/////////////////////////////////////////////   ActionModifyVariable    ////////////////////////////////////////////////

/**
 * This action allows to change the value of a variable.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionModifyVariable = function(event) {
    this.event = event;

    this.variable = ko.observable(null);
    this.operatorType = ko.observable(null);
    this.changeType = ko.observable(null);
    this.value = ko.observable(null);
    this.operatorTypes = ko.observableArray(["=", "+", "-", "*", "/"]);
    this.changeTypes =  ko.observableArray(["value", "%","variable"]);

    var self= this;

    this.variable.subscribe(function(newVal) {
        if (self.variable() != newVal){
            self.operatorType(null);
            self.changeType(null);
            self.value(null);
        }
    });



    this.operatorType.subscribe(function(newVal) {
        if (newVal == "=") {
            self.changeTypes(["value", "%", "variable"]);
            if (self.variable() && self.variable() instanceof GlobalVar) {
                self.value(self.variable().startValue().value());
            }
        }
        else if (newVal == "*" || newVal == "/") {
            self.changeTypes(["value", "variable"]);
            self.value(1);
        }
        else if (newVal){
            self.changeTypes(["value","%", "variable"]);
            self.value(0);
        }

    });

    this.changeType.subscribe(function(newVal) {
        if (newVal == "%" && self.operatorType()=="=") {
            self.value(100);
        }
        else if (newVal == "value" && self.operatorType()=="=") {
            if (self.variable() && self.variable() instanceof GlobalVar) {
                self.value(self.variable().startValue().value());
            }
        }
    });

};
ActionModifyVariable.prototype.type = "ActionModifyVariable";
ActionModifyVariable.prototype.label = "Modify Variable";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionModifyVariable.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionModifyVariable.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, true, false, 'modify variable');
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionModifyVariable.prototype.run = function(triggerParams) {


    var operatorType =  this.operatorType();
    var changeType =  this.changeType();
    // make sure to calculate on numeric
    var value =  this.value();

    // make sure to calculate on numeric
    var oldValue = this.variable().value();
    if (typeof oldValue  === 'string'){
        oldValue = Number(oldValue);
    }
    if (typeof value  === 'string'){
        value = Number(value);
    }
    var newValue;

    if (operatorType== '='){
        if (changeType== 'value'){
            newValue = value;
        }
        else if (operatorType== '%'){
            newValue = oldValue * (value/100);
        }
        else if (operatorType== 'variable'){
            newValue = parseFloat(value.value());
        }
    }
    else if (operatorType== '+'){
        if (changeType== 'value'){
            newValue = oldValue + value;
        }
        else if (operatorType== '%'){
            newValue = oldValue + (oldValue * (value/100));
        }
        else if (operatorType== 'variable'){
            newValue = oldValue + parseFloat(value.value());
        }
    }
    else if (operatorType== '-'){
        if (changeType== 'value'){
            newValue = oldValue - value;
        }
        else if (operatorType== '%'){
            newValue = oldValue - (oldValue * (value/100));
        }
        else if (operatorType== 'variable'){
            newValue = oldValue - parseFloat(value.value());
        }
    }
    else if (operatorType== '*'){
        if (changeType== 'value'){
            newValue = oldValue * value;
        }
        else if (operatorType== '%'){
            newValue = oldValue * (oldValue * (value/100));
        }
        else if (operatorType== 'variable'){
            newValue = oldValue * parseFloat(value.value());
        }
    }
    else if (operatorType== '/'){
        if (changeType== 'value'){
            newValue = oldValue / value;
        }
        else if (operatorType== '%'){
            newValue = oldValue / (oldValue * (value/100));
        }
        else if (operatorType== 'variable'){
            newValue = oldValue / parseFloat(value.value());
        }
    }
    this.variable().value(newValue);
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionModifyVariable.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionModifyVariable.prototype.setPointers = function(entitiesArr) {

    var mainVariable = entitiesArr.byId[this.variable()];
    this.variable(mainVariable);

    if (entitiesArr.byId[this.value()]){
        var valueVariable = entitiesArr.byId[this.value()];
        this.value(valueVariable);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionModifyVariable.prototype.reAddEntities = function(entitiesArr) {
    if (this.variable()) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }
    if (this.value()) {
        if (!entitiesArr.byId.hasOwnProperty(this.value().id())) {
            entitiesArr.push(this.value());
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionModifyVariable}
 */
ActionModifyVariable.prototype.fromJS = function(data) {

    this.variable(data.variable);
    this.operatorType(data.operatorType);
    this.changeType(data.changeType);
    this.value(data.value);
    this.operatorTypes(data.operatorTypes);
    this.changeTypes(data.changeTypes);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionModifyVariable.prototype.toJS = function() {
    var value = null;
    if (this.value() && this.value().hasOwnProperty("id")){
        value = this.value.id();
    }
    else {
        value = this.value();
    }
    return {
        variable: this.variable().id(),
        operatorType: this.operatorType(),
        changeType: this.changeType(),
        value: value,
        operatorTypes: this.operatorTypes(),
        changeTypes: this.changeTypes(),
        type: this.type

    };
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/////////////////////////////////////////////   ActionDrawRandomNumber    ////////////////////////////////////////////////

/**
 * This action sets the value of a variable to a random number drawn from a specified distribution.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionDrawRandomNumber = function(event) {
    this.event = event;

    // serialized
    this.variable = ko.observable(null);
    this.discrete = ko.observable(false);
    this.multiple = ko.observable(false);
    this.replacement = ko.observable(false);
    this.numDraws = ko.observable(1);
    this.distribution = ko.observable('Uniform');
    this.distributionParam1 = ko.observable(0).extend({ numeric: 4 }); // i.e. lower bound of Uniform or mean of Gaussian
    this.distributionParam2 = ko.observable(1).extend({ numeric: 4 }); // i.e. upper bound of Uniform or std of Gaussian
};
ActionDrawRandomNumber.prototype.type = "ActionDrawRandomNumber";
ActionDrawRandomNumber.prototype.label = "Draw Random Number";
ActionDrawRandomNumber.prototype.continousDistributions = ["Uniform", "Gaussian"];
ActionDrawRandomNumber.prototype.discreteDistributions = ["Uniform"];


/**
 * This function is called when the parent event was triggered and the requirements are true. It draws a random number
 * and saves it into the globalVar.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionDrawRandomNumber.prototype.run = function(triggerParams) {
    var value;
    if (this.discrete()) { // draw from discrete distribution

        if (this.multiple()) { // draw multiple values at the same time

            if (this.replacement()) { // draw with replacement

                var numDraws = this.numDraws();
                var randNums = [];
                if (this.distribution() == "Uniform") {
                    for (var k = 0; k < numDraws; k++) {
                        var min = this.distributionParam1();
                        var max = this.distributionParam2();
                        max += 1;
                        value = Math.floor( Math.random() * (max - min) + min );
                        if (value > max) {
                            value = max;
                        }
                        randNums.push(value);
                    }
                }
                this.variable().value().setValue(randNums);

            }
            else { // without replacement

                var randNums = [];
                if (this.distribution() == "Uniform") {
                    var min = this.distributionParam1();
                    var max = this.distributionParam2();
                    var randNumsPossible = [];
                    for (var k = min; k <= max; k++) {
                        value = k;
                        randNumsPossible.push(value);
                    }
                    var numDraws = this.numDraws();
                    while (randNums.length < numDraws) {
                        var randNumsTmp = ExpTrialLoop.prototype.reshuffle(randNumsPossible);
                        randNums = randNums.concat(randNumsTmp);
                    }
                    randNums = randNums.slice(0, numDraws);
                }
                this.variable().value().setValue(randNums);

            }

        }
        else { // single

            if (this.distribution() == "Uniform") {
                var min = this.distributionParam1();
                var max = this.distributionParam2();
                max += 1;
                value = Math.floor( Math.random() * (max - min) + min );
                if (value > max) {
                    value = max;
                }
                this.variable().value().setValue(value);
            }

        }
    }
    else { // continuous

        if (this.multiple()) { // draw multiple values at the same time
            var randNums = [];
            for (var k = 0, len = this.numDraws(); k < numDraws; k++) {
                randNums.push(this.drawFromContinous());
            }
            this.variable().value().setValue(randNums);
        }
        else {
            this.variable().value().setValue(this.drawFromContinous());
        }

    }

};

/**
 * draw a single value from a continous distribution.
 * @returns {*}
 */
ActionDrawRandomNumber.prototype.drawFromContinous = function(){
    var value = null;
    if (this.distribution() == "Uniform") {
        var min = this.distributionParam1();
        var max = this.distributionParam2();
        value = Math.random() * (max - min) + min;
    }
    else if (this.distribution() == "Gaussian") {
        var mean = this.distributionParam1();
        var std = this.distributionParam2();
        value = mean + randn_marsaglia_polar() * std;
    }
    return value;
};

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionDrawRandomNumber.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionDrawRandomNumber.prototype.setVariableBackRef = function(variable){
    if (variable) {
        variable.addBackRef(this, this.event, true, false, 'Save Random Num');
    }
};

/**
 * draws a Gaussian distributed random number (randn) using Box-Muller transform.
 *
 * @returns {number}
 */
function randn_bm() {
    var u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
    var v = 1 - Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

/**
 * creates a Gaussian random number generator (randn) with marsaglia_polar algorithm.
 *
 * randn_marsaglia_polar is a function that generates and returns new randn numbers.
 */
var randn_marsaglia_polar = (function() {
    var y2;
    var isSpareReady = false;

    /**
     * draws a gaussian distributed random number (randn) with marsaglia_polar algorithm
     *
     * @returns {number}
     */
    function randn_mp() {
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

    return randn_mp;
})();

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionDrawRandomNumber.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionDrawRandomNumber.prototype.setPointers = function(entitiesArr) {
    if (this.variable()){
        var globVar = entitiesArr.byId[this.variable()];
        this.variable(globVar);
        this.setVariableBackRef(globVar);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionDrawRandomNumber.prototype.reAddEntities = function(entitiesArr) {
    if (this.variable()) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionDrawRandomNumber}
 */
ActionDrawRandomNumber.prototype.fromJS = function(data) {
    this.variable(data.variable);
    if(data.hasOwnProperty('discrete')) {
        this.discrete(data.discrete);
    }
    if(data.hasOwnProperty('multiple')) {
        this.multiple(data.multiple);
    }
    if(data.hasOwnProperty('replacement')) {
        this.replacement(data.replacement);
    }
    if(data.hasOwnProperty('numDraws')) {
        this.numDraws(data.numDraws);
    }
    this.distribution(data.distribution);
    this.distributionParam1(data.distributionParam1);
    this.distributionParam2(data.distributionParam2);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionDrawRandomNumber.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }
    return {
        type: this.type,
        variable: variableId,
        discrete: this.discrete(),
        multiple: this.multiple(),
        replacement: this.replacement(),
        numDraws: this.numDraws(),
        distribution: this.distribution(),
        distributionParam1: this.distributionParam1(),
        distributionParam2: this.distributionParam2()
    };
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////  ActionControlWebGazer/  //////////////////////////////////////////////

/**
 * This action allows to clear WG's data.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionControlWebGazer = function(event) {
    this.event = event;

    // serialized
    this.actionType = ko.observable("clear");

};


ActionControlWebGazer.prototype.type = "ActionControlWebGazer";
ActionControlWebGazer.prototype.label = "Control Eyetracking";
ActionControlWebGazer.prototype.actionTypes = ["start","pause","end","clear"];



/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionControlWebGazer.prototype.isValid = function(){
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It starts or stops
 * playback of audio or video files in the player.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionControlWebGazer.prototype.run = function(triggerParams) {

    if (this.actionType() == 'start') {
        if (!player.eyetrackerLoaded) {
            player.eyetrackerLoaded = true;

            function weightedRidgeNoMouseReg() {
                tmp = new webgazer.reg.WeightedRidgeReg();
                tmp.trailTime = -Infinity;
                return tmp;
            }

            webgazer.addRegressionModule("weightedRidgeNoMouse", weightedRidgeNoMouseReg);

            webgazer.trailTime=-Infinity;
            webgazer.setRegression('weightedRidgeNoMouse') /* currently must set regression and tracker   use ridge or weightedRidge*/
                .setTracker('clmtrackr')
                .setGazeListener(function(data, clock) {
                    if (data) {
                        player.currentFrame.triggerEyetracking(data);
                    }
                })
                .begin();
            //.showPredictionPoints(true); /* shows a square every 100 milliseconds where current prediction is */
            webgazer.trailTime=-Infinity;
        }
    }
    else if (this.actionType() == 'end') {
        if (player.eyetrackerLoaded) {
            webgazer.clearGazeListener();
            webgazer.end();
            player.eyetrackerLoaded = false;
        }
    }
    else if (this.actionType() == 'pause') {
        webgazer.pause();
    }
    else if (this.actionType() == 'clear') {
        webgazer.clearData();
    }

};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionControlWebGazer.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlWebGazer.prototype.setPointers = function(entitiesArr) {
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlWebGazer.prototype.reAddEntities = function(entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionControlWebGazer}
 */
ActionControlWebGazer.prototype.fromJS = function(data) {
    this.actionType(data.actionType);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionControlWebGazer.prototype.toJS = function() {
    return {
        type: this.type,
        actionType: this.actionType()
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////






/////////////////////////////////////////////////  ActionControlAV/  //////////////////////////////////////////////

/**
 * This action allows to start or stop the playback of audio or video elements.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionControlAV = function(event) {
    this.event = event;

    // serialized
    this.target = ko.observable(null);
    this.actionType = ko.observable(null);

};


ActionControlAV.prototype.type = "ActionControlAV";
ActionControlAV.prototype.label = "Control Audio/Video Obj";
ActionControlAV.prototype.actionTypes = ["start","pause","end"];



/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionControlAV.prototype.isValid = function(){
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It starts or stops
 * playback of audio or video files in the player.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionControlAV.prototype.run = function(triggerParams) {

    if (this.target()) {
        var elem = $(player.currentFrame.frameView.viewElements.byId[this.target().id()].div).find("audio, video");

        if (elem.length > 0) {
            if (this.actionType() == 'start') {
                elem[0].play();
            }
            else if (this.actionType() == 'end') {
                elem[0].pause();
                elem[0].currentTime = 0;
            }
            else if (this.actionType() == 'pause') {
                elem[0].pause();
            }
        }
    }

};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionControlAV.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlAV.prototype.setPointers = function(entitiesArr) {
    this.target(entitiesArr.byId[this.target()]);
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlAV.prototype.reAddEntities = function(entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionControlAV}
 */
ActionControlAV.prototype.fromJS = function(data) {
    this.target(data.target);
    this.actionType(data.actionType);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionControlAV.prototype.toJS = function() {
    var targetId = null;
    if (this.target()) {
        targetId = this.target().id();
    }
    return {
        type: this.type,
        target: targetId,
        actionType: this.actionType()
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////  ActionControlAV/  //////////////////////////////////////////////

/**
 * This action allows to start or stop the playback of audio or video elements.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionControlElement = function(event) {
    this.event = event;

    // serialized
    this.target = ko.observable(null);
    this.actionType = ko.observable(null);

};


ActionControlElement.prototype.type = "ActionControlElement";
ActionControlElement.prototype.label = "Control Upload/Recording Obj";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionControlElement.prototype.isValid = function(){
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It starts or stops
 * playback of audio or video files in the player.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionControlElement.prototype.run = function(triggerParams) {
    if (this.target()) {
        var viewElem = player.currentFrame.frameView.viewElements.byId[this.target().id()];
        if (viewElem) {
            viewElem.dataModel.executeAction(this.actionType());
        }
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionControlElement.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlElement.prototype.setPointers = function(entitiesArr) {
    this.target(entitiesArr.byId[this.target()]);
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlElement.prototype.reAddEntities = function(entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionControlElement}
 */
ActionControlElement.prototype.fromJS = function(data) {
    this.target(data.target);
    this.actionType(data.actionType);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionControlElement.prototype.toJS = function() {
    var targetId = null;
    if (this.target()) {
        targetId = this.target().id();
    }
    return {
        type: this.type,
        target: targetId,
        actionType: this.actionType()
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////





/////////////////////////////////////////////////  ActionControlTimer ///////////////////////////////////////////////

/**
 * This action allows to start or stop the playback of audio or video elements.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionControlTimer = function(event) {
    this.event = event;

    // serialized
    this.timerVar = ko.observable(null);
    this.actionType = ko.observable(null);
    this.updateRate =  ko.observable(50);// in milli seconds
    this.updateValue = ko.observable(null);

    // not serialized
    this.referencesToTriggers = [];

};


ActionControlTimer.prototype.type = "ActionControlTimer";
ActionControlTimer.prototype.label = "Control Timer";
ActionControlTimer.prototype.actionTypes = ["countUp","countDown","set","pause"];



/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionControlTimer.prototype.isValid = function(){
    return true;
};

ActionControlTimer.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, true, false, 'control timer');
};


ActionControlTimer.prototype.removeVariable = function(){
    this.timerVar(null);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It starts or stops
 * playback of audio or video files in the player.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionControlTimer.prototype.run = function(triggerParams) {
    if (this.timerVar()) {
        if (this.actionType() == 'countUp') {
            this.timerVar().value().startCountup();
        }
        else if (this.actionType() == 'countDown') {
            this.timerVar().value().startCountdown();
        }
        else if (this.actionType() == 'set') {
            var updateValue = parseInt(this.updateValue());
            this.timerVar().value().setValue(updateValue);
        }
        else if (this.actionType() == 'pause') {
            this.timerVar().value().pause();
        }
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionControlTimer.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlTimer.prototype.setPointers = function(entitiesArr) {
    var timerVar = entitiesArr.byId[this.timerVar()];
    if (timerVar){
        this.timerVar(timerVar);
        this.setVariableBackRef(timerVar);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlTimer.prototype.reAddEntities = function(entitiesArr) {
    if (this.timerVar()) {
        if (!entitiesArr.byId.hasOwnProperty(this.timerVar().id())) {
            entitiesArr.push(this.timerVar());
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionControlTimer}
 */
ActionControlTimer.prototype.fromJS = function(data) {
    this.timerVar(data.timerVar);
    this.actionType(data.actionType);
    this.updateValue(data.updateValue);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionControlTimer.prototype.toJS = function() {
    var timerVar = null;
    if (this.timerVar()) {
        timerVar = this.timerVar().id();
    }
    return {
        type: this.type,
        timerVar: timerVar,
        actionType: this.actionType(),
        updateValue: this.updateValue()
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////  ActionEndSession  //////////////////////////////////////////

/**
 * This action end the session, sends end session time and leaves the fullscreen.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionEndSession = function(event) {
    this.event = event;
    this.showEndPage = ko.observable(true);
    this.recordDataBeforeFinish =  ko.observable(true);

};
ActionEndSession.prototype.type = "ActionEndSession";
ActionEndSession.prototype.label = "End Session";



/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionEndSession.prototype.isValid = function(){
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It records the answers
 * of a questionaire and directly sends them to the server.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionEndSession.prototype.run = function(triggerParams) {
    if(this.recordDataBeforeFinish){
        player.recordData();
    }
    player.finishSession(this.showEndPage());
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionEndSession.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionEndSession.prototype.setPointers = function(entitiesArr) {

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionEndSession.prototype.reAddEntities = function(entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionRecordQuestionaireResponse}
 */
ActionEndSession.prototype.fromJS = function(data) {
    this.showEndPage(data.showEndPage);
    if(data.hasOwnProperty('recordDataBeforeFinish')) {
        this.recordDataBeforeFinish(data.recordDataBeforeFinish);
    }
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionEndSession.prototype.toJS = function() {
    return {
        type: this.type,
        showEndPage: this.showEndPage(),
        recordDataBeforeFinish:this.recordDataBeforeFinish()
    };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////





//////////////////////////////////////  ActionRecordQuestionaireResponse  //////////////////////////////////////////// depreciated!

/**
 * This action records the response from a questionaire element.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionRecordQuestionaireResponse = function(event) {
    this.event = event;

    // serialized
    this.variableId = ko.observable(undefined);
    this.variable = null;

};
ActionRecordQuestionaireResponse.prototype.type = "ActionRecordQuestionaireResponse";
ActionRecordQuestionaireResponse.prototype.label = "Record Questionaire Answer";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionRecordQuestionaireResponse.prototype.isValid = function(){
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It records the answers
 * of a questionaire and directly sends them to the server.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionRecordQuestionaireResponse.prototype.run = function(triggerParams) {
    var blockId = player.getBlockId();
    var trialId = player.getTrialId();
    var resp = triggerParams.questionElement.content.answer;
    var recData = new RecData();
    recData.addRecording(this.variable);
    player.addRecording(blockId,trialId,recData.toJS());
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionRecordQuestionaireResponse.prototype.destroyOnPlayerFrame = function(playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionRecordQuestionaireResponse.prototype.setPointers = function(entitiesArr) {

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionRecordQuestionaireResponse.prototype.reAddEntities = function(entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionRecordQuestionaireResponse}
 */
ActionRecordQuestionaireResponse.prototype.fromJS = function(data) {
    this.variableId(data.variableId);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionRecordQuestionaireResponse.prototype.toJS = function() {
    return {
        type: this.type,
        variableId: this.variableId()
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////  ActionDistributeVariable  //////////////////////////////////////////

/**
 * This action distributes variables to other players within a joint experiment.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionDistributeVariable = function(event) {
    var self = this;

    this.event = event;

    // serialized
    this.variable = ko.observable(null);
    this.operand = ko.observable(new OperandVariable(event));
    this.playersToDistributeToMode = ko.observable("All");
    this.playersToDistributeTo = this.initPlayersToDistributeTo();
    this.blockVarUntilDone = ko.observable(true);
    this.isInitialized = false;

};

ActionDistributeVariable.prototype.type = "ActionDistributeVariable";
ActionDistributeVariable.prototype.label = "Distribute Variable";

/**
 * If an array is passed to this function, it is assumed to contain only playerIds of players who are selected (for fromJS)
 * @param playerArray
 */
ActionDistributeVariable.prototype.initPlayersToDistributeTo = function(playerArray) {

    var observableArray = ko.observableArray(null);

    for(var i=0; i<this.event.parent.expData.numPartOfJointExp(); i++){
        var isSelected;
        if(!playerArray || playerArray.includes(i)){
            isSelected = true;
        } else{
            isSelected = false;
        }
        observableArray.push({
            playerId: (i+1),
            isSelected: ko.observable(isSelected)
        });
    }
    return observableArray;
};

ActionDistributeVariable.prototype.isValid = function(){
    return true;
};

ActionDistributeVariable.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, true, false, 'dist variable');
};

// like ActionSetVariable
ActionDistributeVariable.prototype.fromJS = function(data) {
    this.variable(data.variable);
    this.operand(null);
    this.playersToDistributeTo(null);
    this.playersToDistributeToMode(null);
    this.blockVarUntilDone(null);

    if(data.operand){
        var operand = new OperandVariable(this.event);
        operand.fromJS(data.operand);
        this.operand(operand);
    }

    if(data.playersToDistributeTo){
        this.playersToDistributeTo = this.initPlayersToDistributeTo(data.playersToDistributeTo);
    }

    if(data.playersToDistributeToMode){
        this.playersToDistributeToMode(data.playersToDistributeToMode);
    }

    if(data.hasOwnProperty('blockVarUntilDone')) { // because of boolean value
        this.blockVarUntilDone(data.blockVarUntilDone);
    }

    return this;
};

// like ActionSetVariable
ActionDistributeVariable.prototype.toJS = function(data) {
    var varId = null;
    var operand = null;
    var playersToDistributeTo = null;
    var playersToDistributeToMode = null;
    var blockVarUntilDone = false;

    if (this.variable()) {
        varId = this.variable().id();
    }

    if (this.operand()){
        operand = this.operand().toJS();
    }

    if (this.playersToDistributeTo()){
        var playersToDistributeToArray = [];
        // jQuery mapping?
        for(var i=0; i<this.playersToDistributeTo().length;i++){
            if(this.playersToDistributeTo()[i].isSelected()){
                playersToDistributeToArray.push(i);
            }
        }
        playersToDistributeTo = playersToDistributeToArray;
    }

    if(this.playersToDistributeToMode()){
        playersToDistributeToMode = this.playersToDistributeToMode();
    }

    if(this.hasOwnProperty('blockVarUntilDone')) { // because of boolean value
        blockVarUntilDone = this.blockVarUntilDone();
    }

    return {
        variable: varId,
        operand: operand,
        playersToDistributeTo: playersToDistributeTo,
        playersToDistributeToMode: playersToDistributeToMode,
        blockVarUntilDone: blockVarUntilDone,
        type: this.type
    };
};

ActionDistributeVariable.prototype.setPointers = function(entitiesArr){
    var varToSet = entitiesArr.byId[this.variable()];
    if (varToSet){
        this.variable(varToSet);
    }
    this.operand().setPointers(entitiesArr);
};

ActionDistributeVariable.prototype.reAddEntities = function(entitiesArr) {
    // add operand:
    if (this.operand() && this.operand().reAddEntities){
        this.operand().reAddEntities(entitiesArr);
    }

    // add variable:
    if (this.variable()) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }
};

ActionDistributeVariable.prototype.run = function(triggerParams) {
    var self = this;

    var operandValueToSend = null;
    if(self.operand){
        operandValueToSend = self.operand().getValue();
    }

    // jQuery mapping?
    var playersToDistributeToArray = [];
    for(var i=0; i<self.playersToDistributeTo().length;i++){
        if(self.playersToDistributeToMode()=="All" || self.playersToDistributeTo()[i].isSelected()){
            playersToDistributeToArray.push(self.playersToDistributeTo()[i].playerId);
        }
    }

    //console.log("try to distribute variable '" + self.variable().name() + "'");

    player.socket.emit('distribute variable',
        {
            variable:  {name: self.variable().name(), id: self.variable().id()},
            operandValue: operandValueToSend,
            playersToDistributeTo: playersToDistributeToArray,
            blockVarUntilDone: self.blockVarUntilDone()
        }
    );
};

ActionDistributeVariable.prototype.destroyOnPlayerFrame = function() {
};






////////////////////////////////////////  ActionMathAndStats ///////////////////////////////////////////////////

var ActionMathAndStats = function(event) {
    var self = this;
    this.event = event;

    // serialized
    this.operationType = ko.observable('Array Operations');
    this.inputs = ko.observableArray([]);
    this.outputs = ko.observableArray([]);
    this.functionKey = ko.observable(ActionMathAndStats.prototype.arrayOperations[9].key); // sum as start value

    // computed
    this.currentFunctions = ko.computed(function(){
        if (self.operationType()== "Array Operations"){
            return ActionMathAndStats.prototype.arrayOperations;
        }
        else if(self.operationType()== "Linear Algebra"){
            return ActionMathAndStats.prototype.algebraOerations;
        }
        else if(self.operationType()== "Statistical Tests"){
            return ActionMathAndStats.prototype.statisticalOerations;
        }
    });

    // not serialized
    this.backRefsIn = {};
    this.backRefsOut ={};

    this.resetValues();
    this.testOutcome = ko.observable(null);

};

ActionMathAndStats.prototype.resetValues = function(){
    var self = this;

    // remove old variable references
    this.inputs().forEach(function (entry,idx) {
        if (entry() instanceof GlobalVar){
            self.removeInVariable(idx);
        }
    });

    this.outputs().forEach(function (entry,idx) {
        if (entry() instanceof GlobalVar){
            self.removeOutVariable(idx);
        }
    });

    // reset values
    var function_spec = this.getFcnSpec();
    if (function_spec){
        var inp = [];
        function_spec.inputs.forEach(function (entry) {
            inp.push(ko.observable(entry.value));
        });
        this.inputs(inp);

        var out = [];
        function_spec.outputs.forEach(function (entry) {
            out.push(ko.observable(entry.value));
        });
        this.outputs(out);
    }
    else{
        this.inputs([]);
        this.outputs([]);
    }

};

ActionMathAndStats.prototype.isValid = function(){
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionMathAndStats.prototype.setInVarBackRef = function(idx){
    if (this.inputs()[idx] instanceof GlobalVar){
        this.backRefsIn[idx] = this.inputs()[idx].addBackRef(this, this.event, false, true, 'math & statistics');
    }
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionMathAndStats.prototype.setOutVarBackRef = function(idx){
    if (this.outputs()[idx] instanceof GlobalVar){
        this.backRefsOut[idx] = this.outputs()[idx].addBackRef(this, this.event, true, false, 'math & statistics');
    }
};

ActionMathAndStats.prototype.removeInVariable = function(idx){
    if (this.inputs()[idx] instanceof GlobalVar && this.backRefsIn[idx]){
        this.inputs()[idx].removeBackRef(this.backRefsIn[idx]);
        delete this.backRefsIn[idx]
    }
};

ActionMathAndStats.prototype.removeOutVariable = function(idx){
    if (this.outputs()[idx] instanceof GlobalVar && this.backRefsOut[idx]){
        this.outputs()[idx].removeBackRef(this.backRefsOut[idx]);
        delete this.backRefsOut[idx]
    }
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionMathAndStats.prototype.run = function(triggerParams) {
    var self = this;
    var func_spec = this.getFcnSpec();
    if (func_spec){
        var inputData = [];
        this.inputs().forEach(function (input) {
            var inp = input();
            if (inp instanceof GlobalVar){
                inp = inp.getValueAsJS();
            }
            if ($.isNumeric(inp)){
                inp = parseFloat(inp);
            }
            inputData.push(inp);
        });
        if (inputData.length>0){
            var globalVarOutput = self.outputs()[0]();// ToDo  change outcome to more variables in the future
            var outcome =  func_spec.operation.apply(null, inputData);
            globalVarOutput.setValue(outcome);
            self.testOutcome(globalVarOutput.getValueAsJS());
        }
        else{
            console.log("Warning: No input data specified for Math & Stats Action")
        }
    }

};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionMathAndStats.prototype.destroyOnPlayerFrame = function(playerFrame) {

};

ActionMathAndStats.prototype.getFcnSpec = function() {
    return ActionMathAndStats.prototype.allOperationsByKey[this.functionKey()];
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionMathAndStats.prototype.setPointers = function(entitiesArr) {

    var self = this;

    // reset values
    var function_spec = this.getFcnSpec();
    if (function_spec){
        var inputs_orig = self.inputs();
        function_spec.inputs.forEach(function (entry, idx) {
            var inputObs = inputs_orig[idx];
            var inputVal = inputObs();
            if (inputVal && inputVal.hasOwnProperty("globalVarId")) {
                inputObs(entitiesArr.byId[inputVal.globalVarId]);
            }
        });
        this.inputs().forEach(function (entry, idx) {
            if (entry instanceof GlobalVar){
                self.setInVarBackRef(idx);
            }
        });

        var out_original = self.outputs();
        function_spec.outputs.forEach(function (entry, idx) {
            var outputObs = out_original[idx];
            var outputVal = outputObs();
            if (outputVal && outputVal.hasOwnProperty("globalVarId")) {
                outputObs(entitiesArr.byId[outputVal.globalVarId]);
            }
        });
        this.outputs().forEach(function (entry, idx) {
            if (entry instanceof GlobalVar){
                self.setOutVarBackRef(idx);
            }
        });
    }
    else{
        this.inputs([]);
        this.outputs([]);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionMathAndStats.prototype.reAddEntities = function(entitiesArr) {

    this.inputs().forEach(function (entry) {
        if (entry instanceof GlobalVar) {
            if (!entitiesArr.byId.hasOwnProperty(entry.id())) {
                entitiesArr.push(entry);
            }
        }
    });

    this.outputs().forEach(function (entry) {
        if (entry instanceof GlobalVar) {
            if (!entitiesArr.byId.hasOwnProperty(entry.id())) {
                entitiesArr.push(entry);
            }
        }
    });

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionModifyArray}
 */
ActionMathAndStats.prototype.fromJS = function(data) {
    this.inputs(jQuery.map( data.inputs, function( val ) {
        return ko.observable(val);
    }));
    this.outputs(jQuery.map( data.outputs, function( val ) {
        return ko.observable(val);
    }));
    this.operationType(data.operationType);
    this.functionKey(data.functionKey);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionMathAndStats.prototype.toJS = function() {
    var inputs = [];
    this.inputs().forEach(function (entry) {
        if (entry() instanceof GlobalVar) {
            inputs.push({
                globalVarId: entry().id()
            });
        }
        else {
            inputs.push(entry());
        }
    });

    var outputs = [];
    this.outputs().forEach(function (entry) {
        if (entry() instanceof GlobalVar) {
            outputs.push({
                globalVarId: entry().id()
            });
        }
        else {
            outputs.push(entry());
        }
    });

    return {
        type: this.type,
        operationType: this.operationType(),
        functionKey: this.functionKey(),
        inputs: inputs,
        outputs: outputs
    };
};



ActionMathAndStats.prototype.type = "ActionMathAndStats";
ActionMathAndStats.prototype.label = "Math & Statistics";
ActionMathAndStats.prototype.operationTypes = ["Array Operations", "Linear Algebra", "Statistical Tests"];


ActionMathAndStats.prototype.statisticalOerations = [

];
ActionMathAndStats.prototype.algebraOerations = [

];


ActionMathAndStats.prototype.arrayOperations = [

    // with parameters
    {
        key: "variance",
        name: 'variance',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "varianceSelection",
                dataFormats: ["scalar"],
                dataTypes: ["boolean"],
                booleanText: 'Use Sample Variance',
                relationGlobalVar: "cannotBeGlobalVar",
                required: false,
                value: false,
                formType: "boolean"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.variance.apply(null, arguments)
        }

    },

    {
        key: "stdev",
        name: 'stdev',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "stdSelection",
                dataFormats: ["scalar"],
                dataTypes: ["boolean"],
                booleanText: "Use Sample Standard Deviation",
                relationGlobalVar: "cannotBeGlobalVar",
                required: false,
                value: false,
                formType: "boolean"
            }

        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.stdev.apply(null, arguments)
        }
    },


    {
        key: 'quantiles',
        name: 'quantiles',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "inputArray2",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.quantiles.apply(null, arguments)
        }
    },

    {
        key: "percentile",
        name: 'percentile',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "percentileScore",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                minimumValue: 0,
                maximumValue: 1,
                relationGlobalVar: "canBeGlobalVar",
                required: true,
                value: 0.5,
                formType: "numericInput"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.percentile.apply(null, arguments)
        }
    },

    {
        key: "percentileOfScore",
        name: 'percentileOfScore',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "percentileScore",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                minimumValue: 0,
                maximumValue: 1,
                relationGlobalVar: "canBeGlobalVar",
                required: false,
                value: 0.5,
                formType: "numericInput"
            },
            {
                name: "percentileComparison",
                dataFormats: ["scalar"],
                dataTypes: ["string"],
                selectionValues: ['less or equal', 'less'],
                relationGlobalVar: "cannotBeGlobalVar",
                required: false,
                value: 'less or equal',
                formType: "categorical"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.percentileOfScore.apply(null, arguments);
        }
    },

    {
        key: "histogram",
        name: 'histogram',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "numberOfBins",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                minimumValue: 0,
                maximumValue: Infinity,
                relationGlobalVar: "canBeGlobalVar",
                required: false,
                value: 5,
                formType: "numericInput"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.histogram.apply(null, arguments);
        }
    },

    {
        key: "covariance",
        name: 'covariance',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "inputArray2",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.covariance.apply(null, arguments);
        }
    },

    {
        key: "corrcoeff",
        name: 'corrcoeff',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "inputArray2",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.corrcoeff.apply(null, arguments);
        }
    },

    {
        key: "spearmancoeff",
        name: 'spearmancoeff',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "inputArray2",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.spearmancoeff.apply(null, arguments);
        }
    },
    //////////////////////////////////////
    // without parameters


    {
        key: "sum",
        name: 'sum',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.sum.apply(null, arguments);
        }
    },

    {
        key: "sumsqrd",
        name: 'sumsqrd',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.sumsqrd.apply(null, arguments);
        }
    },

    {
        key: "sumsqerr",
        name: 'sumsqerr',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.sumsqerr.apply(null, arguments);
        }
    },

    {
        key: "sumrow",
        name: 'sumrow',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.sumrow.apply(null, arguments);
        }
    },

    {
        key: "product",
        name: 'product',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.product.apply(null, arguments);
        }
    },

    {
        key: "min",
        name: 'min',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.min.apply(null, arguments);
        }
    },


    {
        key: "max",
        name: 'max',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.max.apply(null, arguments);
        }
    },

    {
        key: "mean",
        name: 'mean',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.mean.apply(null, arguments);
        }
    },

    {
        key: "meansqerr",
        name: 'meansqerr',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.meansqerr.apply(null, arguments);
        }
    },

    {
        key: "geomean",
        name: 'geomean',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.geomean.apply(null, arguments);
        }
    },

    {
        key: "median",
        name: 'median',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.median.apply(null, arguments);
        }
    },

    {
        key: "cumsum",
        name: 'cumsum',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.cumsum.apply(null, arguments);
        }

    },

    {
        key: "cumprod",
        name: 'cumprod',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.cumprod.apply(null, arguments);
        }
    },

    {
        key: "diff",
        name: 'diff',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.diff.apply(null, arguments);
        }
    },

    {
        key: "rank",
        name: 'rank',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.rank.apply(null, arguments);
        }
    },

    {
        key: "mode",
        name: 'mode',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar","array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.mode.apply(null, arguments);
        }
    },

    {
        key: "range",
        name: 'range',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.range.apply(null, arguments);
        }
    },

    {
        key: "pooledvariance",
        name: 'pooledvariance',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.pooledvariance.apply(null, arguments);
        }
    },

    {
        key: "deviation",
        name: 'deviation',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.deviation.apply(null, arguments);
        }

    },

    {
        key: "pooledstdev",
        name: 'pooledstdev',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.pooledstdev.apply(null, arguments);
        }
    },

    {
        key: "meandev",
        name: 'meandev',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.meandev.apply(null, arguments);
        }
    },

    {
        key: "meddev",
        name: 'meddev',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.meddev.apply(null, arguments);
        }
    },

    {
        key: "skewness",
        name: 'skewness',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.skewness.apply(null, arguments);
        }
    },

    {
        key: "kurtosis",
        name: 'kurtosis',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.kurtosis.apply(null, arguments);
        }
    },

    {
        key: "coeffvar",
        name: 'coeffvar',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null

            }
        ],
        operation: function () {
            return jStat.coeffvar.apply(null, arguments);
        }
    },

    {
        key: "quartiles",
        name: 'quartiles',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null

            }
        ],
        operation: function () {
            return jStat.quartiles.apply(null, arguments);
        }
    }
];


ActionMathAndStats.prototype.allOperations = ActionMathAndStats.prototype.statisticalOerations.concat(
    ActionMathAndStats.prototype.algebraOerations,
    ActionMathAndStats.prototype.arrayOperations);

ActionMathAndStats.prototype.allOperationsByKey = {};
for (var i=0; i<ActionMathAndStats.prototype.allOperations.length; i++) {
    var op = ActionMathAndStats.prototype.allOperations[i]
    ActionMathAndStats.prototype.allOperationsByKey[op.key] = op;
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Factory method that creates a new action based on the given action type.
 *
 * @param {ExpEvent} event - the parent event of the new action.
 * @param {string} type - the type of the Action (i.e. "ActionRecordQuestionaireResponse")
 * @returns {Action}
 */
function actionFactory(event,type) {
    var action = new window[type](event);
    return action;
}