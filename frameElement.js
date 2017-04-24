
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
    this.id = ko.observable(guid());
    this.type = "FrameElement";
    this.name = ko.observable("frameElement");
    this.onset = ko.observable(0);
    this.onsetEnabled = ko.observable(false);
    this.offset = ko.observable(0);
    this.offsetEnabled = ko.observable(false);
    this.responses = ko.observableArray([]);
    this.isActive = ko.observable(true);
    this.content = ko.observable();

    this.shortName = ko.computed(function() {
        if (self.name()){
            return (self.name().length > 13 ? self.name().substring(0, 12) + '...' : self.name());
        }
        else return ''

    });


    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
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

FrameElement.prototype.dataType =      [ "numeric", "numeric", "numeric", "numeric","numeric","string","boolean","string","boolean","boolean","boolean","numeric","numeric"];
FrameElement.prototype.modifiableProp = ["visibility","editorX", "editorY", "editorWidth","editorHeight","onset","onsetEnabled","offset","offsetEnabled","isActive","keepAspectRatio","contentScaling","contentRotation"];

FrameElement.prototype.addNewResponse = function() {
    var resp = new Response(this);
    resp.responseType("mouse");
    this.responses.push(resp);
};

FrameElement.prototype.setAnchorPoint = function(horizontal, vertical) {
    this.anchorPointX(horizontal);
    this.anchorPointY(vertical);
    // TODO: convert old x and y coordinates to new coordinates such that the element does not move when switching modes.
};

FrameElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
    if  (this.content().hasOwnProperty("modifier")){
        this.content().modifier().selectTrialType(selectionSpec);
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

    jQuery.each( this.responses(), function(idx, resp ) {
        resp.setPointers(entitiesArr);
    } );

    if(this.content().setPointers){
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
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {FrameElement}
 */
FrameElement.prototype.fromJS = function(data) {
    var self = this;
    this.id(data.id);
    this.type = data.type;
    this.dataType = data.dataType;
    this.name(data.name);
    this.onset(data.onset);
    this.onsetEnabled(data.onsetEnabled);
    this.offset(data.offset);
    this.offsetEnabled(data.offsetEnabled);
    this.responses(jQuery.map( data.responses, function( respData ) {
        return (new Response(self)).fromJS(respData);
    } ));
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.editorWidth(data.editorWidth);
    this.editorHeight(data.editorHeight);
    if(data.contentScaling) {
        this.contentScaling(data.contentScaling);
    }
    if (data.contentRotation) {
        this.contentRotation(data.contentRotation);
    }
    if(data.anchorPointX) {
        this.anchorPointX(data.anchorPointX);
    }
    if(data.anchorPointY) {
        this.anchorPointY(data.anchorPointY);
    }
    this.visibility(data.visibility);
    this.isActive(data.isActive);
    this.keepAspectRatio(data.keepAspectRatio);
    if(data.content){
        var content = new window[data.content.type](this.expData);
        content.fromJS(data.content);
        content.parent = this;
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
        contentData = null
    }
    return {
        id: this.id(),
        type: this.type,
        dataType: this.dataType,
        name: this.name(),
        onset: this.onset(),
        onsetEnabled: this.onsetEnabled(),
        offset: this.offset(),
        offsetEnabled: this.offsetEnabled(),
        responses: jQuery.map( this.responses(), function( resp ) { return resp.toJS(); } ),
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
        content: contentData
    };
};

