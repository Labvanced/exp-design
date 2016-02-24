// � by Caspar Goeke and Holger Finger

// CHECK BOX  ELEMENT //
var CheckBoxElement= function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "checkBox";
    this.id = ko.observable(guid());
    this.questionText= ko.observable("Your Question");

    this.openQuestion=  ko.observable(false);
    this.choices= ko.observableArray(["Choice1", "Choice2"]);
    this.newPage = ko.observable(false);
    this.selected = ko.observable(false);
    this.tag = ko.observable("");
};

CheckBoxElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.subtype(GlobalVar.subtypes[9].text);
    globalVar.dataType("boolean");
    globalVar.name(this.tag);
    globalVar.scope('questionnaire');
    globalVar.scale('nominal');
};

CheckBoxElement.prototype.setPointers = function() {

};

CheckBoxElement.prototype.toJS = function() {
    return {
        type: this.type,
        id: this.id(),
        questionText: this.questionText(),
        choices: this.choices()
    };
};

CheckBoxElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.questionText(data.questionText);
    this.choices(data.choices);
};

console.log("register checkbox element edit...");
ko.components.register('checkbox-element-edit', {
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.choices = dataModel.choices;

        this.addChoice = function() {
            this.choices.push(ko.observable(""));
        };

        this.removeChoice = function(idx) {
            this.choices.splice(idx,1);
        };


    },
    template:
    '<div class="panel-body">\
        <input style="max-width:50%" type="text" data-bind="textInput: questionText"\
            class="form-control" placeholder="Your Question">\
        <br>\
        <div data-bind="foreach: choices">\
            <div style="overflow: auto; margin-bottom: 3%">\
                <input style="float: left; margin-top: 3%" type="checkbox">\
                <input style="float: left; margin-left: 5%; max-width:50%" type="text" data-bind="textInput: $rawData" class="form-control">\
                <span style="float: left; margin-left: 5%; margin-top: 1%;"><a href="#" data-bind="click: function(data,event) {$parent.removeChoice($index())}, clickBubble: false"><img style="margin-left: 1%" width="20" height="20"src="/resources/trash.png"/></a></span>\
            </div>\
        </div>\
    <span><a href="#" data-bind="click: addChoice"><img style="display: inline-block;" width="20" height="20"src="/resources/add.png"/> <h5 style="display: inline-block; margin-left: 1%">Add Choice</h5> </a></span>\
    </div>'
});

ko.components.register('checkbox-element-preview', {
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.choices = dataModel.choices;
    },
    template:
        '<div class="panel-heading">\
        <span style="float: right;"><a href="#" data-bind="click: function(data,event) {$root.removeElement(dataModel)}, clickBubble: false"><img style="margin-left: 1%" width="20" height="20"src="/resources/trash.png"/></a></span>\
        <h3 style="float: left">\
            <span data-bind="text: questionText"></span>\
        </h3>\
            </div>\
        <br><br><br><br>\
        <div class="panel-body">\
            <div data-bind="foreach: choices">\
                <input style="transform: scale(1.3); margin-bottom: 2%" type="checkbox" data-bind="attr: {name: \'radio\'+ $parent.name}, click: function(){return true}, clickBubble: false ">\
                <span style="font-size: large; margin-left: 1%;" data-bind="text: $data"></span>\
                <br>\
            </div>\
        </div>'
});

