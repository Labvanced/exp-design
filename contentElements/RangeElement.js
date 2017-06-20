
var RangeElement= function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "RangeElement";
    this.questionText= ko.observable('<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');
    this.minChoice= ko.observable(1);
    this.maxChoice= ko.observable(5);
    this.startLabel= ko.observable('<span style="font-size:16px;"><span style="font-family:Arial,Helvetica,sans-serif;">label 1</span></span>');
    this.endLabel= ko.observable('<span style="font-size:16px;"><span style="font-family:Arial,Helvetica,sans-serif;">label 2</span></span>');


    this.variable = ko.observable();

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

RangeElement.prototype.label = "Range";
RangeElement.prototype.iconPath = "/resources/icons/tools/tool_slider.svg";
RangeElement.prototype.modifiableProp = ["questionText","startLabel","endLabel"];
RangeElement.prototype.dataType =      [ "string","string","string"];
RangeElement.prototype.initWidth = 500;
RangeElement.prototype.initHeight = 100;

RangeElement.prototype.init = function() {

    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[2]);
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
    modifiersArr.push(this.modifier());
};

RangeElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    this.modifier().setPointers(entitiesArr);
};

RangeElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.modifier().reAddEntities(entitiesArr);
};

RangeElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

RangeElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText(),
        minChoice: this.minChoice(),
        maxChoice: this.maxChoice(),
        startLabel: this.startLabel(),
        endLabel: this.endLabel(),
        variable: variableId,
        modifier: this.modifier().toJS()
    };
};

RangeElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.minChoice(data.minChoice);
    this.maxChoice(data.maxChoice);
    this.startLabel(data.startLabel);
    this.endLabel(data.endLabel);
    this.variable(data.variable);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};


function createRangeComponents() {
    ko.components.register('range-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){

                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;
                    this.minChoice = dataModel.minChoice;
                    this.maxChoice = dataModel.maxChoice;
                    this.startLabel = dataModel.startLabel;
                    this.endLabel = dataModel.endLabel;

                    this.focus = function () {
                        this.dataModel().ckInstance.focus()
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
                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;
                    this.sliderValue =  ko.observable(this.dataModel().variable().startValue().value());

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
                    this.dataModel = ko.observable(dataModel);
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
