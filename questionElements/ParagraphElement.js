// � by Caspar Goeke and Holger Finger

// PARAGRAPH ELEMENT //
var ParagraphElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "paragraph";
    this.id = ko.observable(guid());
    this.questionText= ko.observable("Your Question");
    this.selected = ko.observable(false);
    this.tag = ko.observable("");
    this.variable = ko.observable();
    this.answer = ko.observable("");
};

ParagraphElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.subtype(GlobalVar.subtypes[7]);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(this.tag());
    this.variable(globalVar);
};


ParagraphElement.prototype.setPointers = function(entitiesArr) {
    this.variable(entitiesArr.byId[this.variable()]);
};

ParagraphElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

ParagraphElement.prototype.toJS = function() {
    return {
        type: this.type,
        id: this.id(),
        questionText: this.questionText(),
        variable: this.variable().id(),
        answer: this.answer()
    };
};

ParagraphElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
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
            <input style="max-width:50%" type="text" data-bind="tinymce: questionText"\
            class="form-control" placeholder="Your Question">\
            <br><br>\
            </div>\
         </div>'

});

ko.components.register('paragraph-element-preview',{
   viewModel: function(dataModel){
       this.dataModel = dataModel;
       this.questionText = dataModel.questionText;
   },
    template:
        '<div class="panel-heading">\
            <span style="float:right;;"><a href="#" data-bind="click: function(data,event) {$root.removeElement(dataModel)}, clickBubble: false"><img style="margin-left: 1%" width="20" height="20"src="/resources/trash.png"/></a></span>\
            <h3 style="float: left">\
                <span data-bind="html: questionText"></span>\
            </h3>\
            <br><br><br><br>\
            <div class="panel-body"><textarea style="position:relative;left: 0%; max-width:50%"\
                   class="form-control"\
                   placeholder="Participant Answer"></textarea>\
            </div>\
         </div>'
});

ko.components.register('paragraph-playerview',{
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
            <br><br>\
            <div class="panel-body"><textarea style="position:relative;left: 0%; max-width:50%"\
                   class="form-control"\
                   placeholder="Participant Answer" data-bind="textInput: answer"></textarea>\
            </div>\
         </div>'
});