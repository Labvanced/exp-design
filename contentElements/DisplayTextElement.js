
var DisplayTextElement = function(expData) {
    var self  = this;
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "DisplayTextElement";
    this.text = ko.observable(null); // is EditableTextElement

    ///// not serialized
    this.variablesInText = ko.observableArray();
    this.selected = ko.observable(false);
    this.editText = ko.observable(false);
    /////
};

DisplayTextElement.prototype.label = "DisplayText";
DisplayTextElement.prototype.iconPath = "/resources/icons/tools/tool_text.svg";
DisplayTextElement.prototype.dataType =      [ ];
DisplayTextElement.prototype.modifiableProp = [ ];
DisplayTextElement.prototype.initWidth = 500;
DisplayTextElement.prototype.initHeight = 80;


DisplayTextElement.prototype.init = function() {
    var self = this;
    this.text(new EditableTextElement(this.expData, this, '<p><span style="font-size:24px;">You can display your custom text here.</span></p>'));
    this.text().init();
    this.text().globalVarIds.subscribe(function(val) {
        self.recalcTextVariables();
    });
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
DisplayTextElement.prototype.getAllModifiers = function(modifiersArr) {
    this.text().getAllModifiers(modifiersArr);
};

DisplayTextElement.prototype.setPointers = function(entitiesArr) {
    this.text().setPointers(entitiesArr);
    this.recalcTextVariables();
    var self = this;
    this.text().globalVarIds.subscribe(function(val) {
        self.recalcTextVariables();
    });
};

DisplayTextElement.prototype.recalcTextVariables = function() {
    var variables = [];
    if (this.text()){
        var textVarIds = this.text().globalVarIds();
        for (var i= 0; i<textVarIds.length; i++){
            variables.push(ko.observable(this.expData.entities.byId[textVarIds[i]]));
        }
    }
    this.variablesInText(variables);
};

DisplayTextElement.prototype.reAddEntities = function(entitiesArr) {
    this.text().reAddEntities(entitiesArr);
};

DisplayTextElement.prototype.selectTrialType = function(selectionSpec) {
    this.editText(false); // This line is important! Otherwise, bug resets text when clicking on DefaultTrial!
    this.text().selectTrialType(selectionSpec);
};

DisplayTextElement.prototype.dispose = function () {
    this.text().dispose();
};

DisplayTextElement.prototype.getTextRefs = function(textArr, label){
    var questlabel = label + '.Question';
    this.text().getTextRefs(textArr, questlabel);
    return textArr;
};

DisplayTextElement.prototype.toJS = function() {
    return {
        type: this.type,
        text: this.text().toJS()
    };
};

DisplayTextElement.prototype.fromJS = function(data) {
    this.type=data.type;
    if(data.text.hasOwnProperty('rawText')) {
        this.text(new EditableTextElement(this.expData, this, ''));
        this.text().fromJS(data.text);
    }
    else{
        this.text(new EditableTextElement(this.expData, this, data.text));
    }
};

function createDisplayTextComponents() {
    ko.components.register('display-text-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = dataModel;
                    this.text = dataModel.text;
                    this.focus = function () {
                        this.dataModel.ckInstance.focus();
                    };

                    this.relinkCallback = function(index) {
                        var frameData = self.dataModel.parent.parent;
                        var oldVar = self.dataModel.variablesInText()[index]();
                        var variableDialog = new AddNewVariable(self.dataModel.expData, function (newVariable) {
                            frameData.addVariableToLocalWorkspace(newVariable);
                            self.dataModel.text().reLinkVar(oldVar,newVariable);

                        }, frameData);
                        variableDialog.show();
                    };
                };


                return new viewModel(dataModel);
            }

        },
        template: {element: 'display-text-editview-template'}
    });

    ko.components.register('display-text-element-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.text = dataModel.text;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'display-text-element-preview-template'}
    });


    ko.components.register('display-text-element-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.text = dataModel.text;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'display-text-element-playerview-template'}
    });
}
