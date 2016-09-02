// � by Caspar Goeke and Holger Finger

// CHECK BOX  ELEMENT //
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
ko.components.register('invisible-element-edit', {
    viewModel: function(dataModel){
        this.dataModel = dataModel;

    },
    template:
        '<div class="panel-body"></div>'

});

ko.components.register('invisible-playerview', {
    viewModel: function(dataModel){
        this.dataModel = dataModel;

    },
    template:
        '<div class="panel-body"></div>'
});
