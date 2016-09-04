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
    this.questionText= ko.observable("Your Question");
    this.minChoice= ko.observable(1);
    this.maxChoice= ko.observable(5);
    this.startLabel= ko.observable("start label");
    this.endLabel= ko.observable("end label");
    this.answer = ko.observable(1);
    this.newPage = ko.observable(false);
    this.selected = ko.observable(false);
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
    globalVar.name(this.parent.name());
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
    this.questionText(data.questionText);
    this.minChoice(data.minChoice);
    this.maxChoice(data.maxChoice);
    this.startLabel(data.startLabel);
    this.endLabel(data.endLabel);
    this.variable(data.variable);
    this.answer(data.answer);
};


ko.components.register('range-element-edit', {
    viewModel: {
        createViewModel: function(dataModel, componentInfo){

            var viewModel = function(dataModel){

                this.dataModel = dataModel;
                this.questionText = dataModel.questionText;
                this.minChoice = dataModel.minChoice;
                this.maxChoice = dataModel.maxChoice;
                this.startLabel = dataModel.startLabel;
                this.endLabel = dataModel.endLabel;
                this.name = dataModel.parent.name;

                this.focus = function () {
                    if(dataModel.ckeditor){
                        dataModel.ckeditor.focus();
                    }
                };

            };

            return viewModel(dataModel)
        }
    },
    template: '<div class="panel-body" style="height: 100%; margin-top: -10px">\
                <div>\
                    <span>Element Tag:</span>\
                    <br>\
                    <input style="max-width:50%;" type="text" data-bind="textInput: $parent.name"> \
                </div>\
                <br>\
        <strong>Range:</strong>\
        <br>\
        <input style="max-width: 30px" type="text" data-bind="textInput: minChoice">\
        To\
        <input style="max-width: 30px" type="text" data-bind="textInput: maxChoice"">\
  </div>'

});

ko.components.register('range-preview',{
    viewModel: {
        createViewModel: function(dataModel, componentInfo){

            var elem = componentInfo.element.firstChild;

            var viewModel = function(dataModel){

                var self = this;
                this.dataModel = dataModel;
                this.questionText = dataModel.questionText;
                this.minChoice = dataModel.minChoice;
                this.maxChoice = dataModel.maxChoice;
                this.startLabel = dataModel.startLabel;
                this.endLabel = dataModel.endLabel;
                CKEDITOR.disableAutoInline = true;

                var editor = CKEDITOR.inline( elem,{
                    on : {
                        change: function (event) {
                            var data = event.editor.getData();
                            self.questionText(data);
                        }
                    },
                    startupFocus : true
                });

                dataModel.ckeditor = editor;
            };

            return viewModel(dataModel);
        }
    },
    template:
        '<div class="editRangeQuestion" contenteditable="true"><p>Your Question</p></div>\
        <br>\
        <div>\
            <div style="float: left;" data-bind="wysiwyg: startLabel"></div>\
            <div style="float: right; margin-right: 25%;" data-bind="wysiwyg: endLabel"></div>\
            <br><br>\
            <span style="display: inline-block; width: 80%">\
                <span style="margin-right: auto; margin-top: 1%; float: left" data-bind="text: minChoice"></span>\
                <input style="margin-left: 5%; margin-right: auto; float: left; max-width: 80%" data-highlight="true"\
                         type="range" data-bind="attr: {min: minChoice, max: maxChoice, step: 1}, click: function(){return true}, clickBubble: false">\
                <span style="margin-left: auto;  width: 5%; margin-right: 5%; margin-top: 1%; float: right" data-bind="text: maxChoice"></span>\
            </span>\
        </div>\
        <br>'
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
    },
    template:
        '<div style="font-size: 200%" data-bind="text: questionText"></div>\
         <br>\
        <div>\
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
        </div>\
        <br>'
});