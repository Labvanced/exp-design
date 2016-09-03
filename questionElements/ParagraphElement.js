// � by Caspar Goeke and Holger Finger

// PARAGRAPH ELEMENT //
var ParagraphElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Paragraph";

    //serialized
    this.type= "ParagraphElement";
    this.questionText= ko.observable("Your Question");
    this.selected = ko.observable(false);
    this.variable = ko.observable();
    this.answer = ko.observable("");

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

ParagraphElement.prototype.modifiableProp = ["questionText"];


ParagraphElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.subtype(GlobalVar.subtypes[7]);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(this.parent.name());
    this.variable(globalVar);
};


ParagraphElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
};

ParagraphElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

ParagraphElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText(),
        variable: variableId,
        answer: this.answer()
    };
};

ParagraphElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.variable(data.variable);
    this.answer(data.answer);
};

ko.components.register('paragraph-element-edit', {
    viewModel: function(dataModel){

        var self = this;
        this.questionText = dataModel.questionText;
        this.htmlText = ko.observable("Your Question");
        this.name = dataModel.parent.name;

        this.focus = function () {
            if(dataModel.ckeditor){
                dataModel.ckeditor.focus();
            }
        };

    } ,
    template:
        '<div class="panel-body" style="height: 100%; margin-top: -10px">\
                <div id="toolbar" class="ui-layout-content"></div>\
                <div>\
                    <span>Element Tag:</span>\
                    <br>\
                    <input style="max-width:50%;" type="text" data-bind="textInput: name"> \
                </div>\
                <br>\
                <div>\
                    <span style="display: inline-block">Question Text</span>\
                    <span style="display: inline-block"><img style="cursor: pointer" width="20" height="20" src="/resources/edit.png" data-bind="click: focus"></span>\
               </div>\
                <br><br>\
        </div>'

});

ko.components.register('paragraph-preview',{
    viewModel: function(dataModel){

        var self = this;
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.name = dataModel.parent.name;


        CKEDITOR.disableAutoInline = true;

        var elements = document.getElementsByClassName( 'editableParaQuestion' );
        var editor = CKEDITOR.inline( elements[elements.length - 1],{
            on : {
                change: function (event) {
                    var data = event.editor.getData();
                    self.questionText(data);
                }
            },
            startupFocus : true
        });

        dataModel.ckeditor = editor;
    },
    template:
        '<div class="editableParaQuestion" contenteditable="true"><p>Your Question</p></div>\
          <br>\
          <div>\
                <textarea style="position:relative;left: 0%; max-width:50%"\
                    class="form-control"\
                    placeholder="Participant Answer""\
                    disabled></textarea>\
          </div>\
          <br>'
});

ko.components.register('paragraph-playerview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.answer = dataModel.answer;
    },
    template:
        '<div data-bind="html: questionText"></div>\
          <br>\
        <div>\
            <textarea style="position:relative;left: 0%; max-width:50%"\
               class="form-control"\
               placeholder="Participant Answer" data-bind="textInput: answer">\
            </textarea>\
        </div>\
        <br>'
});