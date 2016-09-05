// � by Caspar Goeke and Holger Finger

// CHECK BOX  ELEMENT //
var CheckBoxElement= function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Checkbox";

    //serialized
    this.type= "CheckBoxElement";
    this.questionText= ko.observable("Your Question");

    this.openQuestion=  ko.observable(false);
    this.choices= ko.observableArray([ko.observable("check")]);
    this.answer = ko.observableArray([false]);
    this.newPage = ko.observable(false);
    this.variable = ko.observable();
    this.margin = ko.observable('5pt');
    this.count = 0;

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

};

CheckBoxElement.prototype.modifiableProp = ["questionText"];

CheckBoxElement.prototype.changeCheck = function(index) {
    if (this.answer()[index]){
        this.answer.splice(index,1,false);
    }
    else {
        this.answer.splice(index,1,true);
    }
};


CheckBoxElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[3]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(this.parent.name());
    this.variable(globalVar);
};

CheckBoxElement.prototype.setPointers = function(entitiesArr) {
    var choices =  this.choices();
    this.choices = ko.observableArray([]);
    for (var i = 0; i< choices.length; i++){
        this.choices.push(ko.observable(choices[i]));
    }

    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
};

CheckBoxElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

CheckBoxElement.prototype.toJS = function() {
    var choices = [];
    for (var i = 0; i< this.choices().length; i++){
        choices.push(this.choices()[i]());
    }

    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText(),
        choices: choices,
        variable: variableId,
        answer: this.answer()
    };
};

CheckBoxElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.choices(data.choices);
    this.variable(data.variable);
    this.answer(data.answer);
};

console.log("register checkbox element edit...");

ko.components.register('checkbox-element-edit', {
    viewModel: {
        createViewModel: function(dataModel, componentInfo){


            var viewModel = function(dataModel){
                this.dataModel = dataModel;
                this.questionText = dataModel.questionText;
                this.choices = dataModel.choices;
                this.answer = dataModel.answer;
                this.margin = dataModel.margin;
                this.name = dataModel.parent.name;

                this.addChoice = function() {
                    this.choices.push(ko.observable("check"));
                    this.answer.push(false);
                };

                this.removeChoice = function(idx) {
                    this.choices.splice(idx,1);
                    this.answer.splice(idx,1);
                };

                this.focus = function () {
                    if(dataModel.ckeditor){
                        dataModel.ckeditor.focus();
                    }
                };

            };

            return viewModel(dataModel);
        }
    },
    template:
    '<div class="panel-body" style="height: 100%; margin-top: -10px">\
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
                <span><a href="#" data-bind="click: addChoice"><img style="display: inline-block;" width="20" height="20"src="/resources/add.png"/> <a style="display: inline-block; margin-left: 1%">Add Choice</a> </a></span>\
                <br><br>\
        </div>'
});

ko.components.register('checkbox-preview',{
    viewModel: {
        createViewModel: function(dataModel, componentInfo){

            var elem = componentInfo.element.firstChild;

            var viewModel = function(dataModel){

                var self = this;
                this.dataModel = dataModel;
                this.questionText = dataModel.questionText;
                this.choices = dataModel.choices;
                this.margin = dataModel.margin;
                this.count = dataModel.count;

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
        '<div class="editCheckQuestion" contenteditable="true"><p>Your Question</p></div>\
          <br>\
        <div data-bind="foreach: choices, style: {marginTop: margin, marginBottom: margin}">\
            <div>\
                <input style="margin-top: inherit; margin-bottom: inherit; display: inline-block" type="checkbox" data-bind="click: function(){ $root.changeCheck($index()); return true}, clickBubble: false">\
                <div style="display: inline-block" data-bind="wysiwyg: $rawData, valueUpdate: \'afterkeydown\'"></div>\
            </div>\
            <br>\
        </div>\
        <br>'
});

ko.components.register('checkbox-playerview', {
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.choices = dataModel.choices;
        this.answer = dataModel.answer;
        this.margin = dataModel.margin;
    },
    template:
        '<div data-bind="html: questionText"></div>\
        <br>\
        <div data-bind="foreach: choices, style: {marginTop: margin, marginBottom: margin}">\
            <input style="margin-top: inherit; margin-bottom: inherit" type="checkbox" data-bind="click: function(){ $root.changeCheck($index()); return true}, clickBubble: false">\
            <span  style="margin-top: inherit; margin-bottom: inherit"><p>Check</p></span>\
            <br>\
        </div>\
        <br>'
});
