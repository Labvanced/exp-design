
var DisplayTextElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "DisplayText";

    //serialized
    this.type = "DisplayTextElement";
    this.text = ko.observable("You can display your custom text here.");

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

DisplayTextElement.prototype.modifiableProp = ["questionText"];

DisplayTextElement.prototype.setPointers = function(entitiesArr) {
};

DisplayTextElement.prototype.reAddEntities = function(entitiesArr) {
};

DisplayTextElement.prototype.toJS = function() {
    return {
        type: this.type,
        text: this.text()
    };
};

DisplayTextElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.text(data.text);
};

function createDisplayTextComponents() {
    ko.components.register('display-text-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    var self = this;
                    this.text = dataModel.text;
                    this.name = dataModel.parent.name;
                    this.focus = function () {
                        if(dataModel.ckeditor){
                            dataModel.ckeditor.focus();
                        }
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
                    this.name = dataModel.parent.name;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'display-text-element-preview-template'}
    });


    ko.components.register('display-text-element-playerview',{
        viewModel: function(dataModel){
            this.dataModel = dataModel;
            this.text = dataModel.text;
        },
        template: {element: 'display-text-element-playerview-template'}
    });
}
