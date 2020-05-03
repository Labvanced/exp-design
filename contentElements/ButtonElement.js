
var ButtonElement = function (expData) {

    var self = this;
    this.expData = expData;
    this.parent = null;

    // serialized:
    this.type = "ButtonElement";
    this.id = ko.observable(guid());
    this.bgColorDefault = ko.observable('#99cc66');
    this.bgColorHover = ko.observable('#99de50');

    this.buttonEntries = ko.observableArray([]);
    this.fillVertical = ko.observable(true);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    // not serialized
    this.selected = ko.observable(false);

};

ButtonElement.prototype.label = "Button";
ButtonElement.prototype.iconPath = "/resources/icons/tools/tool_button.svg";
ButtonElement.prototype.modifiableProp = ["bgColorDefault", "bgColorHover"];
ButtonElement.prototype.dataType = ["string", "string"];
ButtonElement.prototype.numVarNamesRequired = 0;

ButtonElement.prototype.initWidth = 120;
ButtonElement.prototype.initHeight = 40;


ButtonElement.prototype.addButton = function () {
    var button = new ButtonEntry(this);
    button.init();
    // button.buttonText('<div style="text-align: center;">Button</div>');
    this.buttonEntries.push(button);
};

ButtonElement.prototype.getTextRefs = function (textArr, label) {
    jQuery.each(this.buttonEntries(), function (index, elem) {
        var ind = index + 1;
        elem.getTextRefs(textArr, label + '.Entry' + ind);
    });
    return textArr;
};


ButtonElement.prototype.deleteButton = function () {
    var self = this;
    this.buttonEntries.splice(0, 1);
};

ButtonElement.prototype.init = function () {
    this.addButton();
};
/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
ButtonElement.prototype.getAllModifiers = function (modifiersArr) {
    jQuery.each(this.buttonEntries(), function (index, elem) {
        elem.getAllModifiers(modifiersArr);
    });
    modifiersArr.push(this.modifier());
};

ButtonElement.prototype.setPointers = function (entitiesArr) {
    for (var i = 0; i < this.buttonEntries().length; i++) {
        this.buttonEntries()[i].setPointers(entitiesArr);
    }
    this.modifier().setPointers(entitiesArr);
};

ButtonElement.prototype.dispose = function () {
    jQuery.each(this.buttonEntries(), function (index, elem) {
        elem.dispose();
    });
};

/*
ButtonElement.prototype.initColorPicker = function () {

    var self = this;
    $("#bgColorPickerDefault").spectrum({
        color: self.modifier().selectedTrialView.bgColorDefault(),
        preferredFormat: "hex",
        showInput: true,
        change: function (color) {
            var colorStr = color.toHexString();
            self.modifier().selectedTrialView.bgColorDefault(colorStr);
        }
    });
    if (this.bg1Subsciption) {
        this.bg1Subsciption.dispose();
    }
    this.bg1Subsciption = this.modifier().selectedTrialView.bgColorDefault.subscribe(function (val) {
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
    this.bg2Subsciption = this.bgColorHover.subscribe(function (val) {
        $("#bgColorPickerHover").spectrum("set", val);
    });

};*/

ButtonElement.prototype.reAddEntities = function (entitiesArr) {
    jQuery.each(this.buttonEntries(), function (index, elem) {
        elem.reAddEntities(entitiesArr);
    });
    this.modifier().reAddEntities(entitiesArr);
};

ButtonElement.prototype.selectTrialType = function (selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

ButtonElement.prototype.toJS = function () {
    var buttonEntries = [];
    for (var i = 0; i < this.buttonEntries().length; i++) {
        buttonEntries.push(this.buttonEntries()[i].toJS());
    }
    return {
        type: this.type,
        id: this.id(),
        buttonEntries: buttonEntries,
        fillVertical: this.fillVertical(),
        bgColorDefault: this.bgColorDefault(),
        bgColorHover: this.bgColorHover(),
        modifier: this.modifier().toJS()
    };
};

ButtonElement.prototype.fromJS = function (data) {
    this.type = data.type;
    this.id(data.id);

    var buttonEntries = [];
    if (data.hasOwnProperty('buttonText')) {
        // converting from old format:
        var entry = new ButtonEntry(this);
        entry.init();
        entry.buttonText(new EditableTextElement(this.expData, this, ''));
        entry.buttonText().rawText(data.buttonText);
        entry.buttonText().fromJS(entry.buttonText().toJS());
        buttonEntries.push(entry);
    }
    else {
        for (var i = 0; i < data.buttonEntries.length; i++) {
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

    if (data.hasOwnProperty("fillVertical")) {
        this.fillVertical(data.fillVertical);
    }
    else {
        // for backwards compatibility (old buttons added before may 2020 did not fill vertically):
        this.fillVertical(false);
    }

    this.modifier(new Modifier(this.expData, this));
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};


////////////////////////////////////




var ButtonEntry = function (parent, initText) {
    var self = this;
    this.parent = parent;
    this.buttonText = ko.observable(null);

    this.isHovered = ko.observable(false);
    this.currentColor = ko.computed(function () {
        if (self.isHovered()) {
            return self.parent.modifier().selectedTrialView.bgColorHover();
        }
        else {
            return self.parent.modifier().selectedTrialView.bgColorDefault();
        }
    })

};

ButtonEntry.prototype.modifiableProp = ["buttonText"];
ButtonEntry.prototype.dataType = ["string"];

ButtonEntry.prototype.init = function () {
    this.buttonText(new EditableTextElement(this.parent.expData, this.parent, '<p><span style="font-size:16px;">Button</span></p>'));
    this.buttonText().init();
};

ButtonEntry.prototype.enableHighlight = function () {
    this.isHovered(true);
};
ButtonEntry.prototype.disableHighlight = function () {
    this.isHovered(false);
};

ButtonEntry.prototype.getAllModifiers = function (modifiersArr) {
    this.buttonText().getAllModifiers(modifiersArr);
};

ButtonEntry.prototype.dispose = function () {
    this.buttonText().dispose();
};

ButtonEntry.prototype.selectTrialType = function (selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

ButtonEntry.prototype.getTextRefs = function (textArr, label) {
    this.buttonText().getTextRefs(textArr, label);
};


/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
ButtonEntry.prototype.getAllModifiers = function (modifiersArr) {
};

ButtonEntry.prototype.setPointers = function (entitiesArr) {
    this.buttonText().setPointers(entitiesArr);
};

ButtonEntry.prototype.reAddEntities = function (entitiesArr) {
    this.buttonText().reAddEntities(entitiesArr);
};

ButtonEntry.prototype.fromJS = function (data) {
    if (data.buttonText.hasOwnProperty('rawText')) {
        this.buttonText(new EditableTextElement(this.parent.expData, this.parent, ''));
        this.buttonText().fromJS(data.buttonText);
    }
    else {
        this.buttonText(new EditableTextElement(this.parent.expData, this.parent, data.buttonText));
    }

    return this;
};

ButtonEntry.prototype.toJS = function () {
    return {
        buttonText: this.buttonText().toJS()
    };
};

///////////////////////////////

function createButtonElementComponents() {
    ko.components.register('button-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                    //this.dataModel.initColorPicker();
                };

                viewModel.prototype.addButton = function () {
                    this.dataModel.addButton();
                };
                viewModel.prototype.deleteButton = function () {
                    this.dataModel.deleteButton();
                };


                return new viewModel(dataModel);
            }
        },
        template: { element: 'button-editview-template' }
    });

    ko.components.register('button-preview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: { element: 'button-preview-template' }
    });


    ko.components.register('button-playerview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };

                return new viewModel(dataModel);
            }
        },
        template: { element: 'button-playerview-template' }
    });
}


