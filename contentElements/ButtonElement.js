
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


ButtonElement.prototype.setPointers = function() {

};

ButtonElement.prototype.toJS = function() {
    return {
        type: this.type,
        id: this.id(),
        buttonText: this.buttonText()
    };
};

ButtonElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.buttonText(data.buttonText);
};

function createButtonElementComponents() {
    ko.components.register('button-editview', {
        viewModel: function(dataModel){
            this.dataModel = dataModel;
            this.buttonText= dataModel.buttonText;
        } ,
        template: {element: 'button-editview-template'}
    });

    ko.components.register('button-preview',{
        viewModel: function(dataModel){
            this.dataModel = dataModel;
            this.buttonText= dataModel.buttonText;
        },
        template: {element: 'button-preview-template'}
    });


    ko.components.register('button-playerview',{
        viewModel: function(dataModel){
            this.dataModel = dataModel;
            this.buttonText= dataModel.buttonText;
        },
        template: {element: 'button-playerview-template'}
    });
}


