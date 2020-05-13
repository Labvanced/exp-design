
var IFrameElement = function (expData) {
    this.expData = expData;
    this.parent = null;
    this.expData = expData;

    this.type = "IFrameElement";
    this.iFrameUrl = ko.observable("");

    this.variable = ko.observable(null);
    this.modifier = ko.observable(new Modifier(this.expData, this));

    var self = this;
    this.iFrameUrlWithProtocol = ko.computed(function () {
        var tmp = self.modifier().selectedTrialView.iFrameUrl();
        if (tmp.startsWith("http://") || tmp.startsWith("https://")) {
            return tmp;
        }
        else if (tmp == "") {
            return false;
        }
        else {
            return "https://" + tmp;
        }
    }, this);

};

IFrameElement.prototype.label = "I-Frame";
IFrameElement.prototype.iconPath = "/resources/icons/tools/tool_iframe.svg";
IFrameElement.prototype.numVarNamesRequired = 0;
IFrameElement.prototype.dataType = ["string"];
IFrameElement.prototype.modifiableProp = ["iFrameUrl"];
IFrameElement.prototype.displayNames = ["I-Frame Url"];


IFrameElement.prototype.init = function () {

};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
IFrameElement.prototype.getAllModifiers = function (modifiersArr) {
    modifiersArr.push(this.modifier());
};

IFrameElement.prototype.setPointers = function (entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};


IFrameElement.prototype.reAddEntities = function (entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

IFrameElement.prototype.selectTrialType = function (selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

IFrameElement.prototype.dispose = function () {

};


IFrameElement.prototype.toJS = function () {
    return {
        type: this.type,
        iFrameUrl: this.iFrameUrl(),
        modifier: this.modifier().toJS()
    };
};

IFrameElement.prototype.fromJS = function (data) {
    this.type = data.type;
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
    this.iFrameUrl(data.iFrameUrl);

};

function createIFrameElementComponents() {
    ko.components.register('iframe-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                    this.iFrameUrl = dataModel.iFrameUrl;
                };

                return new viewModel(dataModel);
            }

        },
        template: { element: 'iframe-editview-template' }
    });

    ko.components.register('iframe-preview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };
                return new viewModel(dataModel);
            }
        },
        template: { element: 'iframe-preview-template' }
    });


    ko.components.register('iframe-playerview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                };
                return new viewModel(dataModel);
            }
        },
        template: { element: 'iframe-playerview-template' }
    });
}
