
var InvisibleElement= function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "InvisibleElement";

    //serialized
    this.type= "InvisibleElement";

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

};

InvisibleElement.prototype.modifiableProp = [];

InvisibleElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

InvisibleElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

InvisibleElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

InvisibleElement.prototype.toJS = function() {

    return {
        type: this.type,
        modifier: this.modifier().toJS()
    };
};

InvisibleElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};

console.log("register invisible element edit...");
function createInvisibleElementComponents() {
    ko.components.register('invisible-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'invisible-editview-template'}

    });

    ko.components.register('invisible-preview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'invisible-preview-template'}
    });

    ko.components.register('invisible-playerview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'invisible-playerview-template'}
    });
}

