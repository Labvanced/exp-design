
var NaviElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "NaviElement";
    this.id = ko.observable(guid());
    this.bgColorDefault = ko.observable('#99cc66');
    this.bgColorHover = ko.observable('#99de50');

    var button1 = new ButtonEntry(this);
    button1.buttonText('<div style="text-align: center;">Back</div>');

    var button2 = new ButtonEntry(this);
    button2.buttonText('<div style="text-align: center;">Next</div>');

    this.buttonEntries = ko.observableArray([button1, button2]);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    //navigation event
    this.event = ko.observable(null);

    ///// not serialized
    this.showSubmitError = ko.observable(false);
};

NaviElement.prototype.label = "Navigation";
NaviElement.prototype.iconPath = "/resources/icons/tools/tool_navigation.svg";
NaviElement.prototype.modifiableProp = [];
NaviElement.prototype.dataType =      [];

NaviElement.prototype.initWidth = 400;
NaviElement.prototype.initHeight = 50;

NaviElement.prototype.init = function() {

    var event = new Event(this.parent.parent);
    event.trigger(new TriggerButtonClick(event));
    event.trigger().target(this.parent);
    event.trigger().buttonIdx(0);
    var newAction = actionFactory(event, "ActionJumpTo");
    newAction.jumpType("previousFrame");
    event.actions.push(newAction);
    event.name("Go Backward");
    this.parent.parent.events.push(event);

    var event2 = new Event(this.parent.parent);
    event2.trigger(new TriggerButtonClick(event2));
    event2.trigger().target(this.parent);
    event2.trigger().buttonIdx(1);
    var newAction2 = actionFactory(event2, "ActionJumpTo");
    newAction2.jumpType("nextFrame");
    event2.actions.push(newAction2);
    event2.name("Go Forward");
    this.parent.parent.events.push(event2);
};

NaviElement.prototype.addButton = function() {
    var button = new ButtonEntry(this);
    button.buttonText('<div style="text-align: center;">Button</div>');
    this.buttonEntries.push(button);
};



NaviElement.prototype.enableHighlight = function(elem) {
    var self= this;
    $(elem).css({
        'backgroundColor': self.bgColorHover(),
        'cursor': 'pointer'

    });
};


NaviElement.prototype.disableHighlight = function(elem) {
    var self= this;
    $(elem).css({
        'backgroundColor': self.bgColorDefault(),
        'cursor': 'default'
    });
};


NaviElement.prototype.initColorPicker = function() {

    var self = this;
    $("#bgColorPickerDefault").spectrum({
        color: self.bgColorDefault(),
        preferredFormat: "hex",
        showInput: true,
        change: function (color) {
            var colorStr = color.toHexString();
            self.bgColorDefault(colorStr);

        }
    });
    if (this.bg1Subsciption) {
        this.bg1Subsciption.dispose();
    }
    this.bg1Subsciption = this.bgColorDefault.subscribe(function(val){
        $("#bgColorPickerDefault").spectrum("set", val);
    });


    $("#bgColorPickerHover").spectrum({
        color: self.bgColorHover(),
        preferredFormat: "hex",
        showInput: true,
        change: function (color) {
            var colorStr = color.toHexString();
            self.bgColorHover(colorStr);

        }
    });

    if (this.bg2Subsciption) {
        this.bg2Subsciption.dispose();
    }
    this.bg2Subsciption = this.bgColorHover.subscribe(function(val){
        $("#bgColorPickerHover").spectrum("set", val);
    });

};





/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
NaviElement.prototype.getAllModifiers = function(modifiersArr) {
    modifiersArr.push(this.modifier());
};

NaviElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

NaviElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

NaviElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

NaviElement.prototype.toJS = function() {
    var buttonEntries = [];
    for (var i=0; i<this.buttonEntries().length; i++) {
        buttonEntries.push(this.buttonEntries()[i].toJS());
    }
    return {
        type: this.type,
        id: this.id(),
        buttonEntries: buttonEntries,
        bgColorDefault: this.bgColorDefault(),
        bgColorHover:this.bgColorHover(),
        modifier: this.modifier().toJS()
    };
};

NaviElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);

    var buttonEntries = [];
    if (data.hasOwnProperty('buttonText1')) {
        // converting from old format:
        var entry = new ButtonEntry(this);
        entry.buttonText(data.buttonText1);
        buttonEntries.push(entry);

        var entry2 = new ButtonEntry(this);
        entry2.buttonText(data.buttonText2);
        buttonEntries.push(entry2);
    }
    else {
        for (var i=0; i<data.buttonEntries.length; i++) {
            var buttonEntry = new ButtonEntry(this);
            buttonEntry.fromJS(data.buttonEntries[i]);
            buttonEntries.push(buttonEntry);
        }
    }
    this.buttonEntries(buttonEntries);
    if (data.hasOwnProperty('bgColorDefault')) {
        this.bgColorDefault(data.bgColorDefault);
        this.bgColorHover(data.bgColorHover);
    }

    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};



//////////////////////////////////

function createNaviElementComponents() {
    ko.components.register('navigation-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                    this.dataModel.initColorPicker();
                };

                viewModel.prototype.addButton = function() {
                    this.dataModel.addButton();
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'navigation-editview-template'}
    });

    ko.components.register('navigation-preview',{
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'navigation-preview-template'}
    });


    ko.components.register('navigation-playerview',{
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'navigation-playerview-template'}
    });
}


