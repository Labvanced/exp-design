
var DisplayTextElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "DisplayText";

    //serialized
    this.type = "DisplayTextElement";
    this.text = ko.observable("You can display your custom text here.");

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

DisplayTextElement.prototype.modifiableProp = ["questionText"];

DisplayTextElement.prototype.setPointers = function(entitiesArr) {
};

DisplayTextElement.prototype.reAddEntities = function(entitiesArr) {
};

DisplayTextElement.prototype.toJS = function() {
    return {
        type: this.type,
        text: this.text()
    };
};

DisplayTextElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.text(data.text);
};

ko.components.register('display-text-element-edit', {
    viewModel: {
        createViewModel: function (dataModel, componentInfo) {
            var viewModel = function(dataModel){
                var self = this;
                this.text = dataModel.text;
                this.name = dataModel.parent.name;
                this.focus = function () {
                    if(dataModel.ckeditor){
                        dataModel.ckeditor.focus();
                    }
                };
            };
            return new viewModel(dataModel);
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
                    <span style="display: inline-block">Displayed Text</span>\
                    <span style="display: inline-block"><img style="cursor: pointer" width="20" height="20" src="/resources/edit.png" data-bind="click: focus"></span>\
               </div>\
                <br><br>\
        </div>'
});

ko.components.register('display-text-element-preview',{
    viewModel: {
        createViewModel: function(dataModel, componentInfo){
            var viewModel = function(dataModel){
                this.dataModel = dataModel;
                this.text = dataModel.text;
                this.name = dataModel.parent.name;
            };
            return new viewModel(dataModel);
        }
    },
    template:
        '<div style="width: 100%; height: 100%;"><div style="margin: auto;" class="notDraggable" data-bind="wysiwyg: text, valueUpdate: \'afterkeydown\'">text</div></div>'
});


ko.components.register('display-text-element-playerview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.text = dataModel.text;
    },
    template:
        '<div style="width: 100%; height: 100%;"><div style="margin: auto;" data-bind="html: text"></div></div>'
});