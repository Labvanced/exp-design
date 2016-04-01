// � by Caspar Goeke and Holger Finger


var TextElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "TextElement";
    this.id = ko.observable(guid());
    this.questionText= ko.observable("Your Question");
    this.selected = ko.observable(false);
    this.name = ko.observable("");
    this.variable = ko.observable();
    this.answer = ko.observable("");
};


TextElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.subtype(GlobalVar.subtypes[7]);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(this.name());
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
        id: this.id(),
        questionText: this.questionText(),
        variable: variableId,
        answer: this.answer()
    };
};

TextElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
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
        '<div class="panel-body">\
                <div id="toolbar" class="ui-layout-content"></div>\
                <form id="newtextArea" class="quest-form2" action="javascript:void(0);">\
                    <textarea data-bind="tinymce: questionText" id="myTextEditor" name="content" style="width:100%; height:100%"></textarea>\
                </form>\
                <br><br>\
        </div>'
});


ko.components.register('text-element-preview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
    },
    template:
    '<div>\
        <span style="float: right"><a href="#" data-bind="click: function(data,event) {$root.removeElement(dataModel)}, clickBubble: false"><img style="margin-left: 1%" width="20" height="20"src="/resources/trash.png"/></a></span>\
        <h3 style="float: left">\
            <span data-bind="html: questionText"></span>\
        </h3>\
    </div>\
    <br><br><br><br>\
    <div class="panel-body"><input style="position:relative;left: 0%; max-width:50%"\
        type="text"\
        class="form-control"\
        placeholder="Participant Answer">\
    </div>'
});


ko.components.register('text-playerview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.answer = dataModel.answer;
    },
    template:
        '<div class="panel-heading">\
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
