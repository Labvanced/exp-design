/**
 * Created by Kai Standvoß
 */



// Range ELEMENT//
var RangeElement= function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Range";

    //serialized
    this.type= "RangeElement";
    this.id = ko.observable(guid());
    this.questionText= ko.observable("Your Question");
    this.minChoice= ko.observable(1);
    this.maxChoice= ko.observable(5);
    this.startLabel= ko.observable("start label");
    this.endLabel= ko.observable("end label");
    this.answer = ko.observable(1);
    this.newPage = ko.observable(false);
    this.selected = ko.observable(false);
    this.name = ko.observable("");
    this.variable = ko.observable();

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

};

RangeElement.prototype.modifiableProp = ["questionText","startLabel","endLabel"];

RangeElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.subtype(GlobalVar.subtypes[7]);
    globalVar.dataType(GlobalVar.dataTypes[2]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[3]);
    globalVar.name(this.name());
    this.variable(globalVar);
};


RangeElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
};

RangeElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

RangeElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        id: this.id(),
        questionText: this.questionText(),
        minChoice: this.minChoice(),
        maxChoice: this.maxChoice(),
        startLabel: this.startLabel(),
        endLabel: this.endLabel(),
        variable: variableId,
        answer: this.answer()
    };
};

RangeElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.questionText(data.questionText);
    this.minChoice(data.minChoice);
    this.maxChoice(data.maxChoice);
    this.startLabel(data.startLabel);
    this.endLabel(data.endLabel);
    this.variable(data.variable);
    this.answer(data.answer);
};


ko.components.register('range-element-edit', {
    viewModel: function(dataModel){

        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.minChoice = dataModel.minChoice;
        this.maxChoice = dataModel.maxChoice;
        this.startLabel = dataModel.startLabel;
        this.endLabel = dataModel.endLabel;


    },
    template: '<div style="margin-top: -10px" class="panel-body" xmlns="http://www.w3.org/1999/html">\
        <input style="max-width:50%" type="text" data-bind="textInput: questionText"\
            class="form-control" placeholder="Your Question">\
            <br>\
        <strong>Range:</strong>\
        <br>\
        <input style="max-width: 30px" type="text" data-bind="textInput: minChoice">\
        To\
        <input style="max-width: 30px" type="text" data-bind="textInput: maxChoice"">\
        <br>\
        <span style="display: inline-block; margin-top: 5px; width: 20px; overflow: hidden; vertical-align: middle;" data-bind="text: minChoice"></span>\
        <span style="display: inline-block; margin-top: 5px; margin-left: 3%;"><input\
        type="text"\
            data-bind="textInput: startLabel"\
            class="form-control"\
            placeholder="Label (optional)"\
            style="width:75%"></span>\
    <br>\
    <span style="display: inline-block; margin-top: 5px; width: 20px; overflow: hidden; vertical-align: middle;" data-bind="text: maxChoice"></span>\
    <span style="display: inline-block; margin-top: 5px; margin-left: 3%;">\
    <input type="text"\
        data-bind="textInput: endLabel"\
        class="form-control"\
        placeholder="Label (optional)"\
        style="width:75%"></span>\
        <br>\
  </div>'

});

ko.components.register('range-element-preview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.minChoice = dataModel.minChoice;
        this.maxChoice = dataModel.maxChoice;
        this.startLabel = dataModel.startLabel;
        this.endLabel = dataModel.endLabel;
        this.answer = dataModel.answer;
        this.newPage = dataModel.newPage;
    },
    template:
        '<div>\
        <span style="float: right"><a href="#" data-bind="click: function(data,event) {$root.removeElement(dataModel)}, clickBubble: false"><img style="margin-left: 1%" width="20" height="20"src="/resources/trash.png"/></a></span>\
            <h3 style="float: left">\
                <span data-bind="text: questionText"></span>\
             </h3>\
        </div>\
        <br><br><br><br>\
        <div class="panel-body">\
            <span style="float: left;" data-bind="text: startLabel"></span>\
            <span style="float: right; margin-right: 25%;" data-bind="text: endLabel"></span>\
            <br><br>\
            <span style="display: inline-block; width: 80%">\
                <span style="margin-right: auto; margin-top: 1%; float: left" data-bind="text: minChoice"></span>\
                <input style="margin-left: 5%; margin-right: auto; float: left; max-width: 80%" data-highlight="true"\
                         type="range" data-bind="attr: {min: minChoice, max: maxChoice, step: 1}, value: answer, valueUpdate: \'input\',  click: function(){return true}, clickBubble: false">\
                <span style="margin-left: auto;  width: 5%; margin-right: 5%; margin-top: 1%; float: right" data-bind="text: maxChoice"></span>\
            </span>\
            <br><br>\
            <output data-bind="text: answer"></output>\
        </div>\
        <div data-bind="visible: newPage">\
                <img style="float: right" src="/resources/next.png">\
        </div>'
});


ko.components.register('range-playerview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.minChoice = dataModel.minChoice;
        this.maxChoice = dataModel.maxChoice;
        this.startLabel = dataModel.startLabel;
        this.endLabel = dataModel.endLabel;
        this.answer = dataModel.answer;
        this.newPage = dataModel.newPage;
        this.answer = dataModel.answer;
    },
    template:
        '<div class="panel-heading">\
            <h3 style="float: left">\
                <span data-bind="text: questionText"></span>\
             </h3>\
        </div>\
        <br><br>\
        <div class="panel-body">\
            <span style="float: left;" data-bind="text: startLabel"></span>\
            <span style="float: right; margin-right: 25%;" data-bind="text: endLabel"></span>\
            <br><br>\
            <span style="display: inline-block; width: 80%">\
                <span style="margin-right: auto; margin-top: 1%; float: left" data-bind="text: minChoice"></span>\
                <input style="margin-left: 5%; margin-right: auto; float: left; max-width: 80%" data-highlight="true"\
                         type="range" data-bind="attr: {min: minChoice, max: maxChoice, step: 1}, value: answer, valueUpdate: \'input\',  click: function(){return true}, clickBubble: false">\
                <span style="margin-left: auto;  width: 5%; margin-right: 5%; margin-top: 1%; float: right" data-bind="text: maxChoice"></span>\
            </span>\
            <br><br>\
            <output style="margin-left: 37% !important;" data-bind="text: answer"></output>\
        </div>\
        <div data-bind="visible: newPage">\
                <img style="float: right" src="/resources/next.png">\
        </div>'
});