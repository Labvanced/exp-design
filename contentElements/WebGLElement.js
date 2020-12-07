
var WebGLElement = function (expData) {

    var self = this;
    this.expData = expData;
    this.parent = null;

    // serialized

    this.type = "WebGLElement";
    this.file_id = ko.observable(null);
    this.file_orig_name = ko.observable(null);



    this.stimulusInformation = ko.observable(null);

    this.shortName = ko.computed(function () {
        if (self.file_orig_name()) {
            return (self.file_orig_name().length > 10 ? self.file_orig_name().substring(0, 9) + '...' : self.file_orig_name());
        }
        else return ''

    });

    this.stretchImageToFitBoundingBox = ko.observable(false);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    // not serialized
    this.file = ko.observable(null);

    this.imgSource = ko.computed(function () {

        if (this.modifier().selectedTrialView.file_id() && this.modifier().selectedTrialView.file_orig_name()) {
            var file_route = "/files/";
            if (typeof player !== 'undefined') {
                file_route = "/player/files/" + player.expSessionNr + "/";
                if (is_nwjs()) {
                    return player.playerPreloader.preloadedObjectUrlsById[this.modifier().selectedTrialView.file_id()];
                    //file_route = "files/";
                }
            }
            return file_route + this.modifier().selectedTrialView.file_id() + "/" + this.modifier().selectedTrialView.file_orig_name();
        }
        else {
            return false;
        }
    }, this);


    ///// not serialized
    this.selected = ko.observable(false);
    /////
};


WebGLElement.prototype.label = "WebGL";
WebGLElement.prototype.iconPath = "/resources/icons/tools/tool_image.svg";
WebGLElement.prototype.dataType = ["string", "string", "file", "boolean", "string"];
WebGLElement.prototype.modifiableProp = ["file_id", "file_orig_name", "file", "stretchImageToFitBoundingBox", "stimulusInformation"];
WebGLElement.prototype.displayNames = ["file_id", "Filename", "Filedata", "stretchImageToFitBoundingBox", "Stimulus Info"];
WebGLElement.prototype.initWidth = 300;
WebGLElement.prototype.initHeight = 200;
WebGLElement.prototype.numVarNamesRequired = 0;

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
WebGLElement.prototype.getAllModifiers = function (modifiersArr) {
    modifiersArr.push(this.modifier());
};

WebGLElement.prototype.setPointers = function (entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

WebGLElement.prototype.reAddEntities = function (entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

WebGLElement.prototype.selectTrialType = function (selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

WebGLElement.prototype.dispose = function () {

};


WebGLElement.prototype.fromJS = function (data) {
    var self = this;
    this.type = data.type;
    this.dataType = data.dataType;
    if (data.hasOwnProperty('stimulusInformation')) {
        this.stimulusInformation(data.stimulusInformation);
    }
    this.file_id(data.file_id);
    this.file_orig_name(data.file_orig_name);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
    if (data.stretchImageToFitBoundingBox) {
        this.stretchImageToFitBoundingBox(data.stretchImageToFitBoundingBox);
    }
    return this;
};

WebGLElement.prototype.toJS = function () {

    return {
        type: this.type,
        dataType: this.dataType,
        stimulusInformation: this.stimulusInformation(),
        file_id: this.file_id(),
        file_orig_name: this.file_orig_name(),
        stretchImageToFitBoundingBox: this.stretchImageToFitBoundingBox(),
        modifier: this.modifier().toJS()
    };
};
