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
    this.name = ko.observable("");
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
    globalVar.name(this.name());
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

        this.editing = dataModel.editing;
        this.questionText = dataModel.questionText;

    } ,
    template:
        '<div class="panel-body">\
                <div id="toolbar" class="ui-layout-content"></div>\
                <form id="newtextArea" class="quest-form2" action="javascript:void(0);">\
                    <textarea data-bind="tinymce: questionText" id="myTextEditor" name="content" style="width:100%; height:100%"></textarea>\
                </form>\
                <br><br>\
        </div>'

});

ko.components.register('paragraph-playerview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.answer = dataModel.answer;
    },
    template:
        '<div>\
            <h3 style="float: left">\
                <span data-bind="html: questionText"></span>\
            </h3>\
        </div>\
        <br><br><br>\
        <div class="panel-body">\
            <textarea style="position:relative;left: 0%; max-width:50%"\
               class="form-control"\
               placeholder="Participant Answer" data-bind="textInput: answer">\
            </textarea>\
        </div>'
});