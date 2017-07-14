
var ButtonElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    // serialized:
    this.type= "ButtonElement";
    this.id = ko.observable(guid());

    this.buttonEntries = ko.observableArray([]);
    this.addButton();

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    // not serialized
    this.selected = ko.observable(false);

};

ButtonElement.prototype.label = "Button";
ButtonElement.prototype.iconPath = "/resources/icons/tools/tool_button.svg";
ButtonElement.prototype.modifiableProp = [];
ButtonElement.prototype.dataType =      [];

ButtonElement.prototype.initWidth = 120;
ButtonElement.prototype.initHeight = 40;


ButtonElement.prototype.addButton = function() {
    var button = new ButtonEntry(this);
    button.buttonText('<div style="text-align: center;">Button</div>');
    this.buttonEntries.push(button);
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
ButtonElement.prototype.getAllModifiers = function(modifiersArr) {
    modifiersArr.push(this.modifier());
};

ButtonElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

ButtonElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

ButtonElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

ButtonElement.prototype.toJS = function() {
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

ButtonElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.id(data.id);

    var buttonEntries = [];
    if (data.hasOwnProperty('buttonText')) {
        // converting from old format:
        var entry = new ButtonEntry(this);
        entry.buttonText(data.buttonText);
        buttonEntries.push(entry);
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


////////////////////////////////////




var ButtonEntry= function(parent, initText) {
    this.parent = parent;
    this.buttonText = ko.observable( initText );
};

ButtonEntry.prototype.modifiableProp = ["buttonText"];
ButtonEntry.prototype.dataType =[ "string"];

ButtonEntry.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
ButtonEntry.prototype.getAllModifiers = function(modifiersArr) {
};

ButtonEntry.prototype.setPointers = function(entitiesArr) {
};

ButtonEntry.prototype.reAddEntities = function(entitiesArr) {
};

ButtonEntry.prototype.fromJS = function(data) {
    this.buttonText(data.buttonText);
    return this;
};

ButtonEntry.prototype.toJS = function() {
    return {
        buttonText:  this.buttonText()
    };
};

///////////////////////////////

function createButtonElementComponents() {
    ko.components.register('button-editview', {
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
        template: {element: 'button-editview-template'}
    });

    ko.components.register('button-preview',{
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'button-preview-template'}
    });


    ko.components.register('button-playerview',{
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'button-playerview-template'}
    });
}


