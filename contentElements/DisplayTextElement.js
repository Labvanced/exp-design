
var DisplayTextElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "DisplayTextElement";
    this.text = ko.observable(new EditableTextElement(expData, this, '<span style="font-size:24px;"><span style="font-family:Arial,Helvetica,sans-serif;">You can display your custom text here.</span></span>'));

    ///// not serialized
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
                    this.dataModel = dataModel;
                    this.text = dataModel.text;
                    this.focus = function () {
                        this.dataModel.ckInstance.focus();
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
