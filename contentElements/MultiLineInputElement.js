
var MultiLineInputElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Paragraph";

    //serialized
    this.type= "MultiLineInputElement";
    this.questionText= ko.observable("Your Question");
    this.selected = ko.observable(false);
    this.variable = ko.observable();
    this.answer = ko.observable("");

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

MultiLineInputElement.prototype.modifiableProp = ["questionText"];


MultiLineInputElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(this.parent.name());
    this.variable(globalVar);
};


MultiLineInputElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
};

MultiLineInputElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

MultiLineInputElement.prototype.toJS = function() {
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

MultiLineInputElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.variable(data.variable);
    this.answer(data.answer);
};

ko.components.register('multi-line-input-editview', {
    viewModel: {
        createViewModel: function(dataModel, componentInfo){
            var viewModel = function(dataModel){
                this.questionText = dataModel.questionText;
                this.name = dataModel.parent.name;
            };
            return new viewModel(dataModel);
        }
    } ,
    template:
        '<div class="panel-body" style="height: 100%; margin-top: -10px">\
                <div id="toolbar" class="ui-layout-content"></div>\
                <div>\
                    <span>Element Tag:</span>\
                    <br>\
                    <input style="max-width:50%;" type="text" data-bind="textInput: $parent.name"> \
                </div>\
                <br>\
                <div>\
                    <span style="display: inline-block">Question Text</span>\
                    <span style="display: inline-block"><img style="cursor: pointer" width="20" height="20" src="/resources/edit.png" data-bind="click: focus"></span>\
               </div>\
                <br><br>\
        </div>'

});

ko.components.register('multi-line-input-preview',{
    viewModel: {
        createViewModel: function(dataModel, componentInfo){
            var elem = componentInfo.element.firstChild;
            var viewModel = function(dataModel){
                this.dataModel = dataModel;
                this.questionText = dataModel.questionText;
            }
            return new viewModel(dataModel);
        }
    },
    template:
        '<div class="notDraggable" data-bind="wysiwyg: questionText, valueUpdate: \'afterkeydown\'"><p>Your Question</p></div>\
          <div>\
                <textarea style="position:relative;left: 0%; max-width:50%"\
                    class="form-control"\
                    placeholder="Participant Answer""\
                    disabled></textarea>\
          </div>\
          <br>'
});

ko.components.register('multi-line-input-playerview',{
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