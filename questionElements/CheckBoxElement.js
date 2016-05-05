// � by Caspar Goeke and Holger Finger

// CHECK BOX  ELEMENT //
var CheckBoxElement= function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Checkbox";

    //serialized
    this.type= "CheckBoxElement";
    this.id = ko.observable(guid());
    this.questionText= ko.observable("Your Question");

    this.openQuestion=  ko.observable(false);
    this.choices= ko.observableArray([ko.observable("Check")]);
    this.answer = ko.observableArray([false]);
    this.newPage = ko.observable(false);
    this.selected = ko.observable(false);
    this.name = ko.observable("");
    this.variable = ko.observable();

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
    globalVar.subtype(GlobalVar.subtypes[7]);
    globalVar.dataType(GlobalVar.dataTypes[3]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(this.name());
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
        id: this.id(),
        questionText: this.questionText(),
        choices: choices,
        variable: variableId,
        answer: this.answer()
    };
};

CheckBoxElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.questionText(data.questionText);
    this.choices(data.choices);
    this.variable(data.variable);
    this.answer(data.answer);
};

console.log("register checkbox element edit...");
ko.components.register('checkbox-element-edit', {
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.choices = dataModel.choices;
        this.answer = dataModel.answer;

        this.addChoice = function() {
            this.choices.push(ko.observable(""));
            this.answer.push(false);
        };

        this.removeChoice = function(idx) {
            this.choices.splice(idx,1);
            this.answer.splice(idx,1);
        };


    },
    template:
    '<div class="panel-body" style="margin-top: -10px">\
        <input style="max-width:50%" type="text" data-bind="textInput: questionText"\
            class="form-control" placeholder="Your Question">\
        <br>\
        <div data-bind="foreach: choices">\
            <div style="overflow: auto; margin-bottom: 3%">\
                <input style="float: left; margin-top: 3%" type="checkbox">\
                <input style="float: left; margin-left: 5%; max-width:50%" type="text" data-bind="textInput: $rawData" class="form-control">\
                <span style="float: left; margin-left: 5%; margin-top: 1%;"><a href="#" data-bind="click: function(data,event) {$parent.removeChoice($index())}, clickBubble: false"><img style="margin-left: 1%" width="20" height="20"src="/resources/trash.png"/></a></span>\
            </div>\
        </div>\
    <span><a href="#" data-bind="click: addChoice"><img style="display: inline-block;" width="20" height="20"src="/resources/add.png"/> <h5 style="display: inline-block; margin-left: 1%">Add Choice</h5> </a></span>\
    </div>'
});

ko.components.register('checkbox-element-preview', {
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.choices = dataModel.choices;
    },
    template:
        '<div>\
        <span style="float: right;"><a href="#" data-bind="click: function(data,event) {$root.removeElement(dataModel)}, clickBubble: false"><img style="margin-left: 1%" width="20" height="20"src="/resources/trash.png"/></a></span>\
        <h3 style="float: left">\
            <span data-bind="text: questionText"></span>\
        </h3>\
            </div>\
        <br><br><br><br>\
        <div class="panel-body">\
            <div data-bind="foreach: choices">\
                <input style="transform: scale(1.3); margin-bottom: 2%" type="checkbox" data-bind="attr: {name: \'radio\'+ $parent.name}, click: function(){return true}, clickBubble: false ">\
                <span style="font-size: large; margin-left: 1%;" data-bind="text: $data"></span>\
                <br>\
            </div>\
        </div>'
});

//  click: function(){$root.changeCheck($index())}

ko.components.register('checkbox-playerview', {
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.choices = dataModel.choices;
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
            <div data-bind="foreach: choices">\
                <input style="transform: scale(1.3); margin-bottom: 2%" type="checkbox" data-bind="click: function(){ $root.changeCheck($index()); return true}, clickBubble: false">\
                <span style="font-size: large; margin-left: 1%;" data-bind="text: $data"></span>\
                <br>\
            </div>\
        </div>'
});
