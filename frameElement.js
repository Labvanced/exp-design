
/**
 * A frameElement is a wrapper for different content elements that are placed on a frame (frameData).
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var FrameElement= function(expData) {

    var self = this;
    this.expData = expData;
    this.parent = null;

    // serialized
    this.editorX = ko.observable(100).extend({ numeric: 2 });
    this.editorY = ko.observable(100).extend({ numeric: 2 });
    this.editorWidth = ko.observable(360).extend({ numeric: 2 });
    this.editorHeight = ko.observable(180).extend({ numeric: 2 });
    this.contentScaling = ko.observable(1).extend({ numeric: 2 });
    this.contentRotation = ko.observable(0).extend({ numeric: 0 });
    this.anchorPointX = ko.observable('low');
    this.anchorPointY = ko.observable('low');
    this.visibility = ko.observable(1).extend({ numeric: 2 });
    this.keepAspectRatio = ko.observable(false);

    // new
    this.stimulusInformation  = ko.observable(null);

    // special to frame element
    this.canBeSelected = ko.observable(false);
    this.canBeDragged= ko.observable(false);
    this.canBeResized= ko.observable(false);
    this.borderSize = ko.observable(0);
    this.borderColor = ko.observable("#000000");
    this.backgroundColor = ko.observable("transparent");
    this.overflowX = ko.observable("hidden");
    this.overflowY = ko.observable("hidden");
    this.roundness = ko.observable(0);

    this.id = ko.observable(guid());
    this.type = "FrameElement";
    this.name = ko.observable("frameElement");
    this.isActive = ko.observable(true);
    this.content = ko.observable();

    this.shortName = ko.pureComputed(function() {
        if (self.name()){
            return (self.name().length > 13 ? self.name().substring(0, 12) + '...' : self.name());
        }
        else return ''

    });

    // not serialized
    this.activeOptions = ko.observableArray([false,true]);
    this.scrollOptions = ko.observableArray(["hidden","visible","auto"]);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

FrameElement.prototype.dispose = function() {
    if (this.content()){
        this.content().dispose();
    }
};

FrameElement.prototype.addContent = function(element){
    this.content(element);
    if (element.initWidth) {
        this.editorWidth(element.initWidth);
    }
    if (element.initHeight) {
        this.editorHeight(element.initHeight);
    }
    element.parent = this;
};


FrameElement.prototype.dataType =      [ "numeric","boolean", "numeric", "numeric", "numeric","numeric","boolean","numeric","numeric","boolean","boolean","boolean","numeric","string","string","numeric"];
FrameElement.prototype.modifiableProp = ["visibility","isActive","editorX", "editorY", "editorWidth","editorHeight","keepAspectRatio","contentScaling","contentRotation","canBeSelected","canBeDragged","canBeResized", "borderSize","borderColor","backgroundColor","roundness"];
FrameElement.prototype.subElementProp = ["content"];

FrameElement.prototype.setAnchorPoint = function(horizontal, vertical) {
    this.anchorPointX(horizontal);
    this.anchorPointY(vertical);
    // TODO: convert old x and y coordinates to new coordinates such that the element does not move when switching modes.
};

FrameElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
    if  (typeof this.content().selectTrialType === "function"){
        this.content().selectTrialType(selectionSpec);
    }

};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
FrameElement.prototype.getAllModifiers = function(modifiersArr) {
    modifiersArr.push(this.modifier());
    if(this.content() && this.content().getAllModifiers){
        this.content().getAllModifiers(modifiersArr);
    }
};

FrameElement.prototype.getActionTypes = function() {
    if (this.content().getActionTypes) {
        return this.content().getActionTypes();
    }
};

FrameElement.prototype.getTriggerTypes = function() {
    if (this.content().getTriggerTypes) {
        return this.content().getTriggerTypes();
    }
};

FrameElement.prototype.executeAction = function(actionType) {
    if (this.content().executeAction) {
        this.content().executeAction(actionType)
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
FrameElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);

    if(this.content() && this.content().setPointers){
        this.content().setPointers(entitiesArr);
    }

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
FrameElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);

    if(this.content().reAddEntities){
        this.content().reAddEntities(entitiesArr);
    }
};


/**
 * Recursively gathers path of entities until EditableText
 * @param {ko.observableArray} textArr - contains element label and rawText
 * @param {String} label - to be added to the path
 * @returns textArr on highes level
 */
FrameElement.prototype.getTextRefs = function(textArr, label){
    var content = this.content();
    if (content.getTextRefs instanceof Function) {
        content.getTextRefs(textArr, this.name());
    }
    return textArr;
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {FrameElement}
 */
FrameElement.prototype.fromJS = function(data) {
    var self = this;
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);

    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.editorWidth(data.editorWidth);
    this.editorHeight(data.editorHeight);
    if(data.hasOwnProperty('contentScaling')) {
        this.contentScaling(data.contentScaling);
    }
    if (data.hasOwnProperty('contentRotation')) {
        this.contentRotation(data.contentRotation);
    }
    if(data.hasOwnProperty('anchorPointX')) {
        this.anchorPointX(data.anchorPointX);
    }
    if(data.hasOwnProperty('anchorPointY')) {
        this.anchorPointY(data.anchorPointY);
    }
    if(data.hasOwnProperty('visibility')) {
        this.visibility(data.visibility);
    }
    if(data.hasOwnProperty('stimulusInformation')) {
        this.stimulusInformation(data.stimulusInformation);
    }
    if(data.hasOwnProperty('canBeSelected')) {
        this.canBeSelected(data.canBeSelected);
    }
    if(data.hasOwnProperty('canBeDragged')) {
        this.canBeDragged(data.canBeDragged);
    }
    if(data.hasOwnProperty('canBeResized')) {
        this.canBeResized(data.canBeResized);
    }
    if(data.hasOwnProperty('borderSize')) {
        this.borderSize(data.borderSize);
    }
    if(data.hasOwnProperty('borderColor')) {
        this.borderColor(data.borderColor);
    }

    if(data.hasOwnProperty('overflowX')) {
        this.overflowX(data.overflowX);
    }
    if(data.hasOwnProperty('overflowY')) {
        this.overflowY(data.overflowY);
    }
    if(data.hasOwnProperty('backgroundColor')) {
        this.backgroundColor(data.backgroundColor);
    }
    if(data.hasOwnProperty('roundness')) {
        this.roundness(data.roundness);
    }


    this.isActive(data.isActive);
    this.keepAspectRatio(data.keepAspectRatio);
    if(data.content){
        var classObj = window[data.content.type];
        if (!classObj) {
            console.log('error: type does not exist: '+data.content.type);
            if (data.content.type == "TextInputElement") {
                // convert type name:
                data.content.type = "InputElement";
                classObj = window[data.content.type];
            }
            else {
                return this;
            }
        }
        var content = new classObj(this.expData);
        content.parent = this;
        content.fromJS(data.content);
        this.content(content);
    }
    return this;
};


/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
FrameElement.prototype.toJS = function() {
    if(this.content()){
        var contentData = this.content().toJS();
    }
    else{
        contentData = null;
    }
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        modifier: this.modifier().toJS(),
        editorX:  this.editorX(),
        editorY:  this.editorY(),
        editorWidth: this.editorWidth(),
        editorHeight: this.editorHeight(),
        contentScaling: this.contentScaling(),
        contentRotation: this.contentRotation(),
        anchorPointX: this.anchorPointX(),
        anchorPointY: this.anchorPointY(),
        visibility: this.visibility(),
        isActive:  this.isActive(),
        keepAspectRatio: this.keepAspectRatio(),
        stimulusInformation: this.stimulusInformation(),
        content: contentData,
        canBeSelected:this.canBeSelected(),
        canBeDragged:this.canBeDragged(),
        canBeResized:this.canBeResized(),
        borderSize:this.borderSize(),
        borderColor:this.borderColor(),
        overflowX:this.overflowX(),
        overflowY :this.overflowY(),
        backgroundColor:this.backgroundColor(),
        roundness:this.roundness()
    };
};
