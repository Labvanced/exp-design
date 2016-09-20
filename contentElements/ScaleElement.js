
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
    this.showNums = ko.observable(true);
    this.margin = ko.observable('5pt');

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

ScaleElement.prototype.modifiableProp = ["questionText","startLabel","endLabel"];

ScaleElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
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
    viewModel: {
        createViewModel: function(dataModel, componentInfo){

            var viewModel = function(dataModel){

                this.dataModel = dataModel;
                this.questionText = dataModel.questionText;
                this.choices = dataModel.choices;
                this.startChoice = dataModel.startChoice;
                this.endChoice = dataModel.endChoice;
                this.startLabel = dataModel.startLabel;
                this.endLabel = dataModel.endLabel;
                this.values = [1,2,3,4,5,6,7,8,9,10,11,12];
                this.showNums = dataModel.showNums;
                this.margin = dataModel.margin;

                this.name = dataModel.parent.name;

                this.focus = function () {
                    if(dataModel.ckeditor){
                        dataModel.ckeditor.focus();
                    }
                };
                this.finish = function() {
                    this.choices([]);
                    for (var i = this.startChoice();i<=this.endChoice();i++){
                        this.choices.push(i);
                    }
                };

            };

            return new viewModel(dataModel);
        }
    },
    template: '<div class="panel-body" style="height: 100%; margin-top: -10px">\
                <div>\
                    <span>Element Tag:</span>\
                    <br>\
                    <input style="max-width:50%;" type="text" data-bind="textInput: $parent.name"> \
                </div>\
                <br>\
        <strong>Scale:</strong>\
        <br>\
        <select data-bind="options: values, value: startChoice, event: {change: finish}"></select>\
        To\
        <select data-bind="options: values, value: endChoice, event: {change: finish}">\
        </select>\
        <div><input type="checkbox" data-bind="checked: showNums">Show numbers</div>\
        <div>Margin: <input type="text" data-bind="textInput: margin"></div>\
  </div>'

});

ko.components.register('scale-preview',{
    viewModel: {
        createViewModel: function(dataModel, componentInfo){
            var elem = componentInfo.element.firstChild;
            var viewModel = function(dataModel){
                this.dataModel = dataModel;
                this.questionText = dataModel.questionText;
                this.margin = dataModel.margin;
                this.startChoice = dataModel.startChoice;
                this.choices = dataModel.choices;
                this.startLabel = dataModel.startLabel;
                this.endLabel = dataModel.endLabel;
            };
            return new viewModel(dataModel);
        }
    },
    template:
        '<div class="notDraggable" data-bind="wysiwyg: questionText, valueUpdate: \'afterkeydown\'"><p>Your Question</p></div>\
         <br>\
         <div data-bind="style: {marginLeft: margin, marginRight: margin}">\
             <div class="notDraggable" style="display: inline-block; margin-left: inherit;  margin-right: inherit; vertical-align: middle"\
                  data-bind="wysiwyg: startLabel, valueUpdate: \'afterkeydown\'"></div>\
             <div style="display: inline-block; margin-left: inherit; vertical-align: text-bottom" data-bind="foreach: choices">\
                 <div style="display: inline-block; margin-left: inherit; margin-right: inherit "> \
                     <span style="display:block; margin-left: 5px;  margin-right: 5px"\
                         data-bind="visible: $root.showNums,  text: $data"></span>\
                     <input style="display:block; margin-left: 5px; margin-right: 5px;"\
                          type="radio" value="$data" data-bind="attr: {value:$data}, click: function(){return true}, clickBubble: false">\
                  </div>\
             </div>\
             <div style="display: inline-block; margin-left: inherit;  margin-right: inherit;  vertical-align: middle" class="notDraggable" data-bind="wysiwyg: endLabel, valueUpdate: \'afterkeydown\'"></div>\
         </div>\
         <br>'
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
        this.showNums = dataModel.showNums;
        this.margin = dataModel.margin;
    },
    template:
        '<div style="font-size: 200%" data-bind="text: questionText"></div>\
        <br>\
        <div data-bind="style: {marginLeft: margin, marginRight: margin}">\
            <span style="display: inline-block; margin-left: inherit;  margin-right: inherit; vertical-align: middle"\
                 data-bind="text: startLabel"></span>\
            <span style="display: inline-block; margin-left: inherit; vertical-align: text-bottom" data-bind="foreach: choices">\
                <div style="display: inline-block; margin-left: inherit; margin-right: inherit "> \
                    <span style="display:block; margin-left: 5px;  margin-right: 5px"\
                        data-bind="visible: $root.showNums,  text: $data"></span>\
                    <input style="display:block; margin-left: 5px; margin-right: 5px;"\
                         type="radio" value="$data" data-bind="attr: {value:$data}, checked: $root.answer, click: function(){return true}, clickBubble: false">\
                 </div>\
            </span>\
            <span style="display: inline-block; margin-left: inherit;  margin-right: inherit;  vertical-align: middle" data-bind="text: endLabel"></span>\
        </div>\
        <br>'

});