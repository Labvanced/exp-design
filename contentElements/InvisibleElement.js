
var InvisibleElement= function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "InvisibleElement";

    //serialized
    this.type= "InvisibleElement";

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

InvisibleElement.prototype.modifiableProp = [];
InvisibleElement.prototype.dataType =      [];

InvisibleElement.prototype.addEntry = function() {

};
InvisibleElement.prototype.init = function(entitiesArr) {

};

InvisibleElement.prototype.toJS = function() {
    return {
        type: this.type
    };
};

InvisibleElement.prototype.fromJS = function(data) {
    this.type=data.type;
};

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

