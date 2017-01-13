
var DisplayTextElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "DisplayText";

    //serialized
    this.type = "DisplayTextElement";
    this.text = ko.observable('<span style="font-size:24px;"><span style="font-family:Arial,Helvetica,sans-serif;">You can display your custom text here.</span></span>');

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    this.editText = ko.observable(false);
};

DisplayTextElement.prototype.modifiableProp = ["text"];
DisplayTextElement.prototype.dataType =      [ "string"];

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
                    var self = this;
                    this.dataModel = dataModel;
                    this.subscriber = null;

                    this.dataModel.editText.subscribe(function (val) {
                        if (val) {
                            console.log("start editing inline text...");
                            self.subscriber = self.dataModel.parent.parent.currSelectedElement.subscribe(function(newVal) {
                                if (newVal != self.dataModel.parent) {
                                    console.log("other element was selected...");
                                    self.dataModel.editText(false);
                                    self.subscriber.dispose();
                                }
                            });
                        }
                    });
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
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'display-text-element-playerview-template'}
    });
}
