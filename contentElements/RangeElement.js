
var RangeElement= function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "RangeElement";
    this.questionText = ko.observable(null); // EditableTextElement
    this.minChoice= ko.observable(1);
    this.maxChoice= ko.observable(5);
    this.startLabel = ko.observable(null); // EditableTextElement
    this.endLabel = ko.observable(null); // EditableTextElement
    this.showNumber = ko.observable(true);
    this.variable = ko.observable();
    this.enableTitle= ko.observable(true);

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

RangeElement.prototype.label = "Range";
RangeElement.prototype.iconPath = "/resources/icons/tools/tool_slider.svg";
RangeElement.prototype.dataType =      [ ];
RangeElement.prototype.modifiableProp = [ ];
RangeElement.prototype.initWidth = 500;
RangeElement.prototype.initHeight = 100;

RangeElement.prototype.init = function() {

    this.questionText(new EditableTextElement(this.expData, this, '<p><span style="font-size:20px;">Your Question</span></p>'));
    this.questionText().init();
    this.startLabel(new EditableTextElement(this.expData, this, '<p><span style="font-size:16px;">label 1</span></p>'));
    this.startLabel().init();
    this.endLabel(new EditableTextElement(this.expData, this, '<p><span style="font-size:16px;">label 2</span></p>'));
    this.endLabel().init();

    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope('trial');
    globalVar.scale(GlobalVar.scales[2]);
    var name = this.parent.name();
    globalVar.name(name);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();



};



RangeElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'Range');
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
RangeElement.prototype.getAllModifiers = function(modifiersArr) {
    this.questionText().getAllModifiers(modifiersArr);
    this.startLabel().getAllModifiers(modifiersArr);
    this.endLabel().getAllModifiers(modifiersArr);
};

RangeElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    this.questionText().setPointers(entitiesArr);
    this.startLabel().setPointers(entitiesArr);
    this.endLabel().setPointers(entitiesArr);
};

RangeElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.questionText().reAddEntities(entitiesArr);
    this.startLabel().reAddEntities(entitiesArr);
    this.endLabel().reAddEntities(entitiesArr);
};

RangeElement.prototype.selectTrialType = function(selectionSpec) {
    this.questionText().selectTrialType(selectionSpec);
    this.startLabel().selectTrialType(selectionSpec);
    this.endLabel().selectTrialType(selectionSpec);
};

RangeElement.prototype.dispose = function () {
    this.questionText().dispose();
    this.startLabel().dispose();
    this.endLabel().dispose();
};

RangeElement.prototype.getTextRefs = function(textArr, label){
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
    var startlabel = label + '.Start';
    this.startLabel().getTextRefs(textArr, startlabel);
    var endlabel = label + '.End';
    this.endLabel().getTextRefs(textArr, endlabel);
    return textArr;
};

RangeElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText().toJS(),
        minChoice: this.minChoice(),
        maxChoice: this.maxChoice(),
        startLabel: this.startLabel().toJS(),
        endLabel: this.endLabel().toJS(),
        showNumber: this.showNumber(),
        variable: variableId,
        enableTitle:this.enableTitle()
    };
};

RangeElement.prototype.fromJS = function(data) {
    this.type=data.type;
    if(data.questionText.hasOwnProperty('rawText')) {
        this.questionText(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
        this.startLabel(new EditableTextElement(this.expData, this, ''));
        this.startLabel().fromJS(data.startLabel);
        this.endLabel(new EditableTextElement(this.expData, this, ''));
        this.endLabel().fromJS(data.endLabel);
    }
    else{
        this.questionText(new EditableTextElement(this.expData, this, data.questionText));
        this.startLabel(new EditableTextElement(this.expData, this, data.startLabel));
        this.endLabel(new EditableTextElement(this.expData, this, data.endLabel));
    }
    this.minChoice(data.minChoice);
    this.maxChoice(data.maxChoice);
    this.variable(data.variable);
    if (data.hasOwnProperty("showNumber")) {
        this.showNumber(data.showNumber);
    }
    if(data.hasOwnProperty('enableTitle')){
        this.enableTitle(data.enableTitle);
    }
};


function createRangeComponents() {
    ko.components.register('range-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){

                    var self = this;

                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.minChoice = dataModel.minChoice;
                    this.maxChoice = dataModel.maxChoice;
                    this.startLabel = dataModel.startLabel;
                    this.endLabel = dataModel.endLabel;

                    this.focus = function () {
                        this.dataModel.ckInstance.focus();
                    };

                    this.relinkCallback = function() {
                        var frameData = self.dataModel.parent.parent;
                        var variableDialog = new AddNewVariable(self.dataModel.expData, function (newVariable) {
                            frameData.addVariableToLocalWorkspace(newVariable);
                            self.dataModel.variable(newVariable);
                            self.dataModel.setVariableBackRef(newVariable);
                        }, frameData);
                        variableDialog.show();
                    };
                    
                };

                return new viewModel(dataModel)
            }
        },
        template: {element: 'range-editview-template'}
    });

    ko.components.register('range-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){

                    var self = this;
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.sliderValue =  ko.observable(this.dataModel.variable().startValue().value());

                    this.minChoice = dataModel.minChoice;
                    this.maxChoice = dataModel.maxChoice;
                    this.startLabel = dataModel.startLabel;
                    this.endLabel = dataModel.endLabel;

                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'range-preview-template'}
    });

    ko.components.register('range-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.minChoice = dataModel.minChoice;
                    this.maxChoice = dataModel.maxChoice;
                    this.startLabel = dataModel.startLabel;
                    this.endLabel = dataModel.endLabel;
                    this.answer = dataModel.answer;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'range-playerview-template'}
    });
};
