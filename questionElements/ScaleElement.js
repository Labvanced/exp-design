// � by Caspar Goeke and Holger Finger


// SCALE ELEMENT//
var ScaleElement= function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Scale";

    //serialized
    this.type= "ScaleElement";
    this.id = ko.observable(guid());
    this.questionText= ko.observable("Your Question");
    this.startChoice= ko.observable(1);
    this.endChoice= ko.observable(5);
    this.startLabel= ko.observable("start label");
    this.endLabel= ko.observable("end label");
    this.choices= ko.observableArray([1,2,3,4,5]);
    this.selected = ko.observable(false);
    this.variable = ko.observable();
    this.answer = ko.observableArray([]);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

ScaleElement.prototype.modifiableProp = ["questionText","startLabel","endLabel"];

ScaleElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.subtype(GlobalVar.subtypes[7]);
    globalVar.dataType(GlobalVar.dataTypes[2]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[2]);
    globalVar.name(this.parent.name());
    this.variable(globalVar);
};

ScaleElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
};

ScaleElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

ScaleElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        id: this.id(),
        questionText: this.questionText(),
        startChoice: this.startChoice(),
        endChoice: this.endChoice(),
        startLabel: this.startLabel(),
        endLabel: this.endLabel(),
        choices: this.choices(),
        variable: variableId,
        answer: this.answer()
    };
};

ScaleElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.questionText(data.questionText);
    this.startChoice(data.startChoice);
    this.endChoice(data.endChoice);
    this.startLabel(data.startLabel);
    this.endLabel(data.endLabel);
    this.choices(data.choices);
    this.variable(data.variable);
    this.answer(data.answer);
};


ko.components.register('scale-element-edit', {
    viewModel: function(dataModel){

        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.choices = dataModel.choices;
        this.startChoice = dataModel.startChoice;
        this.endChoice = dataModel.endChoice;
        this.startLabel = dataModel.startLabel;
        this.endLabel = dataModel.endLabel;
        this.values = [1,2,3,4,5,6,7,8,9,10,11,12];

        this.finish = function() {
            this.choices([]);
            for (var i = this.startChoice();i<=this.endChoice();i++){
                this.choices.push(i);
            }
        };

    },
    template: '<div style="margin-top: -10px" class="panel-body">\
        <input style="max-width:50%" type="text" data-bind="textInput: questionText"\
            class="form-control" placeholder="Your Question">\
            <br>\
        <strong>Scale:</strong>\
        <br>\
        <select data-bind="options: values, value: startChoice, event: {change: finish}"></select>\
        To\
        <select data-bind="options: values, value: endChoice, event: {change: finish}">\
        </select>\
        <br>\
    <div style="display: inline-block; margin-top: 5px; width: 20px; overflow: hidden; vertical-align: middle;" data-bind="text: startChoice"></div>\
    <span style="display: inline-block; margin-top: 5px; margin-left: 3%;"><input\
    type="text"\
        data-bind="textInput: startLabel"\
        class="form-control"\
        placeholder="Label (optional)"\
        style="width:75%"></span>\
    <br>\
    <div style="display: inline-block; margin-top: 5px; width: 20px; overflow: hidden; vertical-align: middle;" data-bind="text: endChoice"></div>\
    <span style="display: inline-block; margin-top: 5px; margin-left: 3%;"><input\
    type="text"\
        data-bind="textInput: endLabel"\
        class="form-control"\
        placeholder="Label (optional)"\
        style="width:75%"></span>\
        <br>\
  </div>'

});

ko.components.register('scale-playerview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.questionText = dataModel.questionText;
        this.startChoice = dataModel.startChoice;
        this.endChoice = dataModel.endChoice;
        this.startLabel = dataModel.startLabel;
        this.endLabel = dataModel.endLabel;
        this.choices = dataModel.choices;
        this.answer = dataModel.answer;
    },
    template:
        '<div style="font-size: 200%" data-bind="text: questionText"></div>\
        <br>\
        <div>\
            <span style="display: inline-block;  margin-right: 1%; vertical-align: middle"\
                 data-bind="text: startLabel"></span>\
            <span style="display: inline-block; vertical-align: text-bottom" data-bind="foreach: choices">\
                <div style="display: inline-block"> \
                    <span style="display:block; position:relative; margin-left: 7px;  margin-right: 7px"\
                        data-bind="text: $data"></span>\
                    <input style="display:block; margin-left: 5px; margin-right: 5px;"\
                         type="radio" value="$data" data-bind="attr: {value:$data}, checked: $root.answer, click: function(){return true}, clickBubble: false">\
                 </div>\
            </span>\
            <span style="display: inline-block; margin: 5px; vertical-align: middle" data-bind="text: endLabel"></span>\
        </div>\
        <br>'

});