var LikertElement= function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "LikertElement";
    this.questionText = ko.observable(new EditableTextElement(this.expData, this, '<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>'));
    this.startChoice= ko.observable(1);
    this.endChoice= ko.observable(5);
    this.startLabel = ko.observable(new EditableTextElement(this.expData, this, '<span style="font-size:16px;"><span style="font-family:Arial,Helvetica,sans-serif;">Left Label</span></span>'));
    this.endLabel = ko.observable(new EditableTextElement(this.expData, this, '<span style="font-size:16px;"><span style="font-family:Arial,Helvetica,sans-serif;">Right Label</span></span>'));
    this.choices= ko.observableArray([1,2,3,4,5]);

    this.variable = ko.observable();
    this.isRequired = ko.observable(false);

    this.showNums = ko.observable(true);
    this.margin = ko.observable(2);

    ///// not serialized
    this.selected = ko.observable(false);
    this.triedToSubmit = ko.observable(false);
    this.dataIsValid = ko.observable(false);
    /////
};

LikertElement.prototype.label = "Likert";
LikertElement.prototype.iconPath = "/resources/icons/tools/tool_rating.svg";
LikertElement.prototype.initWidth = 350;
LikertElement.prototype.initHeight = 120;

LikertElement.prototype.init = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[2]);
    globalVar.scale(GlobalVar.scales[1]);
    var name = this.parent.name();
    globalVar.name(name);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();
};

LikertElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'Likert');
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
LikertElement.prototype.getAllModifiers = function(modifiersArr) {
    this.questionText().getAllModifiers(modifiersArr);
    this.startLabel().getAllModifiers(modifiersArr);
    this.endLabel().getAllModifiers(modifiersArr);
};

LikertElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    this.questionText().setPointers(entitiesArr);
    this.startLabel().setPointers(entitiesArr);
    this.endLabel().setPointers(entitiesArr);
};

LikertElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.questionText().reAddEntities(entitiesArr);
    this.startLabel().reAddEntities(entitiesArr);
    this.endLabel().reAddEntities(entitiesArr);
};

LikertElement.prototype.selectTrialType = function(selectionSpec) {
    this.questionText().selectTrialType(selectionSpec);
    this.startLabel().selectTrialType(selectionSpec);
    this.endLabel().selectTrialType(selectionSpec);
};

LikertElement.prototype.dispose = function () {
  this.questionText().dispose();
  this.startLabel().dispose();
  this.endLabel().dispose();
};

LikertElement.prototype.getTextRefs = function(textArr, label){
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
    var startlabel = label + '.Start';
    this.startLabel().getTextRefs(textArr, startlabel);
    var endlabel = label + '.End';
    this.endLabel().getTextRefs(textArr, endlabel);
    return textArr;
};

LikertElement.prototype.isInputValid = function() {
    this.triedToSubmit(true);
    if (this.isRequired()==false){
        this.dataIsValid(true);
        return true
    }
    else{
        if (this.variable().value().value() == this.variable().startValue().value()){
            this.dataIsValid(false);
            return false;
        }
        else{
            this.dataIsValid(true);
            return true
        }
    }
};



LikertElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText().toJS(),
        startChoice: this.startChoice(),
        endChoice: this.endChoice(),
        startLabel: this.startLabel().toJS(),
        endLabel: this.endLabel().toJS(),
        choices: this.choices(),
        variable: variableId,
        isRequired: this.isRequired()
    };
};

LikertElement.prototype.fromJS = function(data) {
    this.type=data.type;
    if(data.questionText.hasOwnProperty('rawText')) {
        this.questionText = ko.observable(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
        this.startLabel = ko.observable(new EditableTextElement(this.expData, this, ''));
        this.startLabel().fromJS(data.startLabel);
        this.endLabel = ko.observable(new EditableTextElement(this.expData, this, ''));
        this.endLabel().fromJS(data.endLabel);
    }
    else{
        this.questionText = ko.observable(new EditableTextElement(this.expData, this, data.questionText));
        this.startLabel = ko.observable(new EditableTextElement(this.expData, this, data.startLabel));
        this.endLabel = ko.observable(new EditableTextElement(this.expData, this, data.endLabel));
    }
    this.startChoice(data.startChoice);
    this.endChoice(data.endChoice);
    this.choices(data.choices);
    this.variable(data.variable);
    if(data.hasOwnProperty('isRequired')) {
        this.isRequired(data.isRequired)
    }


};


function createLikertElementComponents() {
    ko.components.register('likert-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){

                    var self = this;

                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.choices = dataModel.choices;
                    this.startChoice = dataModel.startChoice;
                    this.endChoice = dataModel.endChoice;
                    this.startLabel = dataModel.startLabel;
                    this.endLabel = dataModel.endLabel;
                    this.values = [1,2,3,4,5,6,7,8,9,10,11,12];
                    this.showNums = dataModel.showNums;
                    this.margin = dataModel.margin;

                    this.finish = function() {
                        self.choices([]);
                        for (var i = self.startChoice();i<=self.endChoice();i++){
                            self.choices.push(i);
                        }
                    };

                    this.focus = function () {
                        self.dataModel.ckInstance.focus();
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

                return new viewModel(dataModel);
            }
        },
        template: {element: 'likert-editview-template'}

    });

    ko.components.register('likert-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.margin = dataModel.margin;
                    this.startChoice = dataModel.startChoice;
                    this.choices = dataModel.choices;
                    this.variable = dataModel.variable;
                    this.startLabel = dataModel.startLabel;
                    this.endLabel = dataModel.endLabel;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'likert-preview-template'}
    });

    ko.components.register('likert-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.startChoice = dataModel.startChoice;
                    this.endChoice = dataModel.endChoice;
                    this.startLabel = dataModel.startLabel;
                    this.endLabel = dataModel.endLabel;
                    this.choices = dataModel.choices;
                    this.variable = dataModel.variable;
                    this.showNums = dataModel.showNums;
                    this.margin = dataModel.margin;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'likert-playerview-template'}
    });
};
