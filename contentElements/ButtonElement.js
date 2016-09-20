
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

ko.components.register('button-element-edit', {
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.buttonText= dataModel.buttonText;
    } ,
    template:
        '<input style="max-width:50%" type="text" data-bind="textInput: buttonText"\
            class="form-control" placeholder="Button Text">'
});

ko.components.register('button-preview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.buttonText= dataModel.buttonText;
    },
    template:
        '<div class="btn-primary" style="width: 100%; height: 100%;"><div style="margin: auto;" class="notDraggable" data-bind="wysiwyg: buttonText">Button</div></div>'
});


ko.components.register('button-playerview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.buttonText= dataModel.buttonText;
    },
    template:
    '<button class="btn-primary" style="width: 100%; height: 100%;"><div style="margin: auto;" data-bind="text: buttonText">Button</div></button>'
});

