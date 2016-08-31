// � by Caspar Goeke and Holger Finger


var FrameData = function(expData) {
    
    var self = this;
    this.expData = expData;
    this.currSelectedElement = ko.observable(null);
    this.parent = null;

    // serialized
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.editorWidth = ko.observable(120);
    this.editorHeight = ko.observable(60);
    this.id = ko.observable(guid());
    this.type = "FrameData";
    this.name = ko.observable("MediaFrame");
    this.onset = ko.observable(0).extend({ numeric: 0 });
    this.onsetEnabled = ko.observable(false);
    this.offset = ko.observable(5000).extend({ numeric: 0 });
    this.offsetEnabled = ko.observable(false);
    this.bgColor = ko.observable("#000000"); // hex color as string, i.e. "#ffffff"
    this.bgColorEnabled = ko.observable(false); // if false, then use experiment default background color.
    this.frameWidth = ko.observable(1600);
    this.frameHeight = ko.observable(900);
    this.zoomMode = ko.observable("fullscreen"); // "fullscreen" or "pixel" or "visualDegree"
    this.emotionEnabled = ko.observable(false);
    this.emotionFeedbackEnabled = ko.observable(false);
    this.emotionOffset = ko.observable(300).extend({ numeric: 0 });

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    // not serialized
    this.shape = "square";
    this.label = "MediaFrame";
    this.portTypes = ["executeIn", "executeOut"];
    this.trialTypeView = {};

    // sub-Structures (serialized below)
    this.elements = ko.observableArray([]).extend({sortById: null});
    this.portHandler = new PortHandler(this);
    this.events = ko.observableArray([]).extend({sortById: null});

};
FrameData.prototype.modifiableProp = ["editorX", "editorY", "name","onset","onsetEnabled","offset","offsetEnabled","frameWidth","frameHeight","zoomMode","emotionEnabled","emotionFeedbackEnabled","emotionOffset"];

FrameData.prototype.getDeepCopy = function() {
    var self = this;

    var entitiesArr = ko.observableArray([]).extend({sortById: null});
    this.reAddEntities(entitiesArr);
    entitiesArr.push(this);

    // loop through array and create deep copies
    var entitiesArrCopy = jQuery.map(entitiesArr(), function (entity) {
        var entityJson = entity.toJS();
        return entityFactory(entityJson, self.expData);
    });
    var entitiesArrCopyObs = ko.observableArray([]).extend({sortById: null});
    entitiesArrCopyObs(entitiesArrCopy);
    jQuery.each( entitiesArrCopy, function( index, elem ) {
        elem.setPointers(entitiesArrCopyObs);
    } );

    // find this frame:
    var deepCopy = entitiesArrCopyObs.byId[this.id()];
    deepCopy.parent = this.parent;

    return deepCopy;
};

FrameData.prototype.addNewEvent = function() {
    var event = new Event(this);
    this.events.push(event);
};

FrameData.prototype.addNewSubElement = function(elem) {
    this.elements.push(elem);
    this.expData.entities.push(elem);
    elem.parent = this;
};

FrameData.prototype.setPointers = function(entitiesArr) {
    var self = this;

    // convert ids to actual pointers:
    this.elements(jQuery.map( this.elements(), function( id ) {
        var elem = entitiesArr.byId[id];
        elem.parent = self;
        return elem;
    } ));

    jQuery.each( this.events(), function( idx, event ) {
        event.setPointers(entitiesArr);
    } );
};

FrameData.prototype.selectTrialType = function(selectionSpec) {
    var elements = this.elements();
    for (var i=0; i<elements.length; i++){
        if (typeof elements[i].selectTrialType === 'function') {
            elements[i].selectTrialType(selectionSpec);
        }
    }
};

FrameData.prototype.getElementById = function(id) {
    return  this.elements.byId[id];
};


FrameData.prototype.reAddEntities = function(entitiesArr) {
    var self = this;

    // add the direct child nodes:
    jQuery.each( this.elements(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id()))
            entitiesArr.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );

    // add the direct child nodes:
    jQuery.each( this.events(), function( index, evt ) {
        // check if they are not already in the list:
        // if (!entitiesArr.byId.hasOwnProperty(elem.id()))
        //     entitiesArr.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        if (evt.reAddEntities)
            evt.reAddEntities(entitiesArr);
    } );

};

FrameData.prototype.fromJS = function(data) {
    var self = this;

    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.onset(data.onset);
    this.onsetEnabled(data.onsetEnabled);
    this.offset(data.offset);
    this.offsetEnabled(data.offsetEnabled);
    this.portHandler.fromJS(data.portHandler); // order is important: first portHandler then canvasElement!
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.editorWidth(data.editorWidth);
    this.editorHeight(data.editorHeight);
    this.bgColor(data.bgColor);
    this.bgColorEnabled(data.bgColorEnabled);
    this.frameWidth(data.frameWidth);
    this.frameHeight(data.frameHeight);
    this.zoomMode(data.zoomMode);
    if (data.hasOwnProperty("emotionEnabled")) {
        this.emotionEnabled(data.emotionEnabled);
    }
    if (data.hasOwnProperty("emotionFeedbackEnabled")) {
        this.emotionFeedbackEnabled(data.emotionFeedbackEnabled);
    }
    if (data.hasOwnProperty("emotionOffset")) {
        this.emotionOffset(data.emotionOffset);
    }
    this.events(jQuery.map( data.events, function( eventData ) {
        return (new Event(self)).fromJS(eventData);
    } ));
    this.elements(data.elements);
    return this;
};

FrameData.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name:  this.name(),
        onset: this.onset(),
        onsetEnabled: this.onsetEnabled(),
        offset: this.offset(),
        offsetEnabled: this.offsetEnabled(),
        portHandler: this.portHandler.toJS(),
        editorX:  this.editorX(),
        editorY:  this.editorY(),
        editorWidth: this.editorWidth(),
        editorHeight: this.editorHeight(),
        bgColor: this.bgColor(),
        bgColorEnabled: this.bgColorEnabled(),
        frameWidth: this.frameWidth(),
        frameHeight: this.frameHeight(),
        zoomMode: this.zoomMode(),
        emotionEnabled: this.emotionEnabled(),
        emotionFeedbackEnabled: this.emotionFeedbackEnabled(),
        emotionOffset: this.emotionOffset(),
        events: jQuery.map( this.events(), function( event ) {
            return event.toJS();
        } ),
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } )
    };
};


