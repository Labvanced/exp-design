/**
 * Created by Kai Standvoß
 */

// � by Caspar Goeke and Holger Finger


// Range ELEMENT//
var RangeElement= function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "range";
    this.id = ko.observable(guid());
    this.questionText= ko.observable("");
    this.minChoice= ko.observable(1);
    this.maxChoice= ko.observable(5);
    this.startLabel= ko.observable("");
    this.endLabel= ko.observable("");
    this.choice = ko.observable(1);
    this.newPage = ko.observable(false);
};

RangeElement.prototype.setPointers = function() {

};

RangeElement.prototype.toJS = function() {
    return {
        type: this.type,
        id: this.id(),
        questionText: this.questionText(),
        minChoice: this.startChoice(),
        maxChoice: this.endChoice(),
        startLabel: this.startLabel(),
        endLabel: this.endLabel(),
    };
};

RangeElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.questionText(data.questionText);
    this.minChoice(data.startChoice);
    this.maxChoice(data.endChoice);
    this.startLabel(data.startLabel);
    this.endLabel(data.endLabel);
};


ko.components.register('range-element-edit', {
    viewModel: function(dataModel){

        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.choices = dataModel.choices;
        this.minChoice = dataModel.minChoice;
        this.maxChoice = dataModel.maxChoice;
        this.startLabel = dataModel.startLabel;
        this.endLabel = dataModel.endLabel;


    },
    template: '<div class="panel-body" xmlns="http://www.w3.org/1999/html">\
        <input style="max-width:50%" type="text" data-bind="textInput: questionText"\
            class="form-control" placeholder="Your Question">\
            <br><br>\
        <strong>Range:</strong>\
        <br><br>\
        <input style="max-width: 30px" type="text" data-bind="textInput: minChoice"></input>\
        To\
        <input style="max-width: 30px" type="text" data-bind="textInput: maxChoice""></input>\
        <br><br>\
        <span style="float:left; width: 5%; overflow: scroll; margin-top: 2%" data-bind="text: minChoice"></span>\
        <span style="float:left; margin-left: 5%;"><input\
        type="text"\
            data-bind="textInput: startLabel"\
            class="form-control"\
            placeholder="Label (optional)"\
            style="width:75%"></span>\
    <br><br><br>\
    <span style="float:left;  width: 5%; overflow: scroll; margin-top: 2%" data-bind="text: maxChoice"></span>\
    <span style="float:left; margin-left: 5%;">\
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
        this.choice = dataModel.choice;
        this.newPage = dataModel.newPage;
    },
    template:
        '<div class="panel-heading">\
        <span style="float: right"><a href="#" data-bind="click: function(data,event) {$root.removeElement(dataModel)}, clickBubble: false"><img style="margin-left: 1%" width="20" height="20"src="/resources/trash.png"/></a></span>\
            <h3 style="float: left">\
                <span data-bind="text: questionText"></span>\
             </h3>\
        </div>\
        <br><br><br><br>\
        <div class="panel-body">\
            <span style="float: left;  width: 5%; margin-top: 1%" data-bind="text: startLabel"></span>\
            <span style="float: right; margin-right: 30%; margin-top:1%" data-bind="text: endLabel"></span>\
            <br><br>\
            <span style="display: inline-block; width: 80%">\
                <span style="margin-right: auto; margin-top: 1%; float: left" data-bind="text: minChoice"></span>\
                <input style="margin-left: 5%; margin-right: auto; float: left; max-width: 80%" data-highlight="true"\
                         type="range" data-bind="attr: {min: minChoice, max: maxChoice, step: 1}, value: choice, valueUpdate: \'input\',  click: function(){return true}, clickBubble: false">\
                <span style="margin-left: auto;  width: 5%; margin-right: 5%; margin-top: 1%; float: right" data-bind="text: maxChoice"></span>\
            </span>\
            <br><br>\
            <output data-bind="text: choice"></output>\
        </div>\
        <div data-bind="visible: newPage">\
                <img style="float: right" src="/resources/next.png">\
        </div>'
});

