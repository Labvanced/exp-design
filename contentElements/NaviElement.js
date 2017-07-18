
var NaviElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "NaviElement";
    this.id = ko.observable(guid());

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
    /////
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


