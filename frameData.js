/**
 * This class stores all information about one frame in a sequence (trial) of frames or pages. A frame allows free
 * positioning of content elements on a canvas.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var FrameData = function(expData) {

    this.expData = expData;
    this.currSelectedElement = ko.observable(null);
    this.parent = null;

    // serialized
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
    this.localWorkspaceVars = ko.observableArray([]).extend({sortById: null});

};
FrameData.prototype.modifiableProp = ["name","onset","onsetEnabled","offset","offsetEnabled","frameWidth","frameHeight","zoomMode","emotionEnabled","emotionFeedbackEnabled","emotionOffset"];

FrameData.prototype.getDeepCopy = function() {
    var self = this;

    var entitiesArr = ko.observableArray([]).extend({sortById: null});
    this.reAddEntities(entitiesArr);
    entitiesArr.push(this);

    // loop through array and create deep copies
    var entitiesArrCopy = jQuery.map(entitiesArr(), function (entity) {
        if (entity instanceof GlobalVar) { // no deep copy of global variables so that we can keep state across frames.
            return entity;
        }
        else {
            var entityJson = entity.toJS();
            return entityFactory(entityJson, self.expData);
        }
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

FrameData.prototype.deleteChildEntity = function(entity) {
    var obsArr;
    if (entity instanceof Event) {
        obsArr = this.events;
    }
    else if (entity instanceof GlobalVar) {
        obsArr = this.localWorkspaceVars;
    }
    else {
        obsArr = this.elements;
    }
    //var index = obsArr.indexOf(entity);
    //obsArr.splice(index, 1);
    obsArr.remove(entity);

    // if this element was selected, set selection to null
    if (entity === this.currSelectedElement()) {
        this.currSelectedElement(null);
    }
};

FrameData.prototype.copyChildEntity = function(entity) {
    var obsArr;
    if (entity instanceof Event) {
        obsArr = this.events;
    }
    else if (entity instanceof GlobalVar) {
        obsArr = this.localWorkspaceVars;
    }
    else {
        obsArr = this.elements;
    }
    var index = obsArr.indexOf(entity);
    var entityCopy = entityFactory(entity.toJS(), this.expData);
    entityCopy.id(guid());
    entityCopy.name(entityCopy.name() + "_copy");
    entityCopy.parent = this;
    entityCopy.setPointers(this.expData.entities);
    obsArr.splice(index+1, 0, entityCopy);
};

FrameData.prototype.addVariableToLocalWorkspace = function(variable) {
    var isExisting = this.localWorkspaceVars.byId[variable.id()];
    if (!isExisting) {
        this.localWorkspaceVars.push(variable);
        variable.addBackRef(this, this, false, false, 'workspace variable');
    }
};

FrameData.prototype.addNewSubElement = function(elem) {
    this.elements.push(elem);
    this.expData.entities.push(elem);
    elem.parent = this;
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

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
FrameData.prototype.setPointers = function(entitiesArr) {
    var self = this;

    // convert ids to actual pointers:
    this.elements(jQuery.map( this.elements(), function( id ) {
        var elem = entitiesArr.byId[id];
        elem.parent = self;
        return elem;
    } ));

    // convert ids to actual pointers:
    this.localWorkspaceVars(jQuery.map( this.localWorkspaceVars(), function( id ) {
        var localVar = entitiesArr.byId[id];
        localVar.addBackRef(self, self, false, false, 'workspace variable');
        return localVar;
    } ));

    jQuery.each( this.events(), function( idx, event ) {
        event.setPointers(entitiesArr);
    } );
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
FrameData.prototype.reAddEntities = function(entitiesArr) {
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

    // add the direct child nodes:
    jQuery.each( this.localWorkspaceVars(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id()))
            entitiesArr.push(elem);
    } );

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {FrameData}
 */
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
    this.localWorkspaceVars(data.localWorkspaceVars);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
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
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } ),
        localWorkspaceVars: jQuery.map( this.localWorkspaceVars(), function( variable ) { return variable.id(); } )

    };
};


