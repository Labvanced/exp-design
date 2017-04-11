
var NaviElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Navigation";

    //serialized
    this.type= "NaviElement";
    this.id = ko.observable(guid());
    this.buttonText1 = ko.observable("Back");
    this.buttonText2 = ko.observable("Forward");

    this.returnButton = ko.observable(true);
    this.selected = ko.observable(false);
    this.name = ko.observable("");

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));


    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

NaviElement.prototype.modifiableProp = ["buttonText1", "buttonText2"];
NaviElement.prototype.dataType =      [ "string"];

NaviElement.prototype.initWidth = 80;
NaviElement.prototype.initHeight = 50;

NaviElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

NaviElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

NaviElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

NaviElement.prototype.toJS = function() {
    return {
        type: this.type,
        id: this.id(),
        buttonText1: this.buttonText1(),
        buttonText2: this.buttonText2(),
        modifier: this.modifier().toJS()
    };
};

NaviElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.buttonText1(data.buttonText2);
    this.buttonText2(data.buttonText2);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};

function createNaviElementComponents() {
    ko.components.register('navigation-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'navigation-editview-template'}
    });

    ko.components.register('navigation-preview',{
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'navigation-preview-template'}
    });


    ko.components.register('navigation-playerview',{
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'navigation-playerview-template'}
    });
}


