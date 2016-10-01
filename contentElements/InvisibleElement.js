
var InvisibleElement= function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "InvisibleElement";

    //serialized
    this.type= "InvisibleElement";

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

};

InvisibleElement.prototype.modifiableProp = ["questionText"];

InvisibleElement.prototype.setPointers = function(entitiesArr) {

};

InvisibleElement.prototype.reAddEntities = function(entitiesArr) {

};

InvisibleElement.prototype.toJS = function() {

    return {
        type: this.type
    };
};

InvisibleElement.prototype.fromJS = function(data) {
    this.type=data.type;
};

console.log("register invisible element edit...");
function createInvisibleElementComponents() {
    ko.components.register('invisible-editview', {
        viewModel: function(dataModel){
            this.dataModel = dataModel;

        },
        template: {element: 'invisible-editview-template'}

    });

    ko.components.register('invisible-preview', {
        viewModel: function(dataModel){
            this.dataModel = dataModel;
        },
        template: {element: 'invisible-preview-template'}
    });

    ko.components.register('invisible-playerview', {
        viewModel: function(dataModel){
            this.dataModel = dataModel;

        },
        template: {element: 'invisible-playerview-template'}
    });
}

