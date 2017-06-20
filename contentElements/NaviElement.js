
var NaviElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "NaviElement";
    this.id = ko.observable(guid());
    this.buttonText1 = ko.observable("Back");
    this.buttonText2 = ko.observable("Next");

    this.returnButton = ko.observable(true);
    this.selected = ko.observable(false);

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
NaviElement.prototype.modifiableProp = ["buttonText1", "buttonText2"];
NaviElement.prototype.dataType =      [ "string"];

NaviElement.prototype.initWidth = 400;
NaviElement.prototype.initHeight = 50;

NaviElement.prototype.init = function() {

    var event = new Event(this.parent.parent);
    event.trigger(new TriggerMouse(event));
    event.trigger().targets.push(this.parent);
    var newAction = actionFactory(event, "ActionJumpTo");
    newAction.jumpType("previousFrame");
    event.actions.push(newAction);
    event.name("Go Backward");
    this.parent.parent.events.push(event);

    var event2 = new Event(this.parent.parent);
    event2.trigger(new TriggerMouse(event2));
    event2.trigger().targets.push(this.parent);
    var newAction2 = actionFactory(event2, "ActionJumpTo");
    newAction2.jumpType("nextFrame");
    event2.actions.push(newAction2);
    event2.name("Go Forward");
    this.parent.parent.events.push(event2);
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
    return {
        type: this.type,
        id: this.id(),
        buttonText1: this.buttonText1(),
        buttonText2: this.buttonText2(),
        modifier: this.modifier().toJS()
    };
};

NaviElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);
    this.buttonText1(data.buttonText1);
    this.buttonText2(data.buttonText2);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};

function createNaviElementComponents() {
    ko.components.register('navigation-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
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


