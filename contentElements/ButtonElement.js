
var ButtonElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Button";

    //serialized
    this.type= "ButtonElement";
    this.id = ko.observable(guid());
    this.buttonText = ko.observable("Button");
    this.returnButton = ko.observable(true);
    this.selected = ko.observable(false);
    this.name = ko.observable("");

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

ButtonElement.prototype.modifiableProp = ["buttonText"];
ButtonElement.prototype.initWidth = 80;
ButtonElement.prototype.initHeight = 38;

ButtonElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

ButtonElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

ButtonElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

ButtonElement.prototype.toJS = function() {
    return {
        type: this.type,
        id: this.id(),
        buttonText: this.buttonText(),
        modifier: this.modifier().toJS()
    };
};

ButtonElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.buttonText(data.buttonText);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};

function createButtonElementComponents() {
    ko.components.register('button-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'button-editview-template'}
    });

    ko.components.register('button-preview',{
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'button-preview-template'}
    });


    ko.components.register('button-playerview',{
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'button-playerview-template'}
    });
}


