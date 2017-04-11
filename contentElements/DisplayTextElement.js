
var DisplayTextElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "DisplayText";

    //serialized
    this.type = "DisplayTextElement";
    this.text = ko.observable('<span style="font-size:24px;"><span style="font-family:Arial,Helvetica,sans-serif;">You can display your custom text here.</span></span>');

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

DisplayTextElement.prototype.modifiableProp = ["text"];
DisplayTextElement.prototype.dataType =      [ "string"];


DisplayTextElement.prototype.init = function() {

};

DisplayTextElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

DisplayTextElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

DisplayTextElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

DisplayTextElement.prototype.toJS = function() {
    return {
        type: this.type,
        text: this.text(),
        modifier: this.modifier().toJS()
    };
};

DisplayTextElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.text(data.text);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
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
