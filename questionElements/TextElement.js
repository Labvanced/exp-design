// � by Caspar Goeke and Holger Finger


var TextElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Text";

    //serialized
    this.type = "TextElement";
    this.questionText= ko.observable("Your Question");
    this.selected = ko.observable(false);
    this.variable = ko.observable();
    this.answer = ko.observable("");

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

TextElement.prototype.modifiableProp = ["questionText"];

TextElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.subtype(GlobalVar.subtypes[7]);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(this.parent.name());
    this.variable(globalVar);
};

TextElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
};

TextElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

TextElement.prototype.toJS = function() {
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

TextElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.variable(data.variable);
    this.answer(data.answer);
};

ko.components.register('text-element-edit', {
    viewModel: function(dataModel){
        var self = this;
        this.questionText = dataModel.questionText;
    } ,
    template:
        '<div class="panel-body" style="height: 100%; margin-top: -10px">\
                <div id="toolbar" class="ui-layout-content"></div>\
                <form id="newtextArea" class="quest-form2" action="javascript:void(0);">\
                    <textarea data-bind="tinymce: questionText, tinymceOptions: {toolbar: false}" id="myTextEditor" name="content" style="width:100%; height:100%"></textarea>\
                </form>\
                <br><br>\
        </div>'
});

ko.components.register('text-playerview',{
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
            <div class="panel-body"><input style="position:relative;left: 0%; max-width:50%"\
                 type="text"\
                class="form-control"\
                placeholder="Participant Answer" data-bind="textInput: answer">\
          </div>'
});
