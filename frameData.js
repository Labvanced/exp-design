/**
 * This class stores all information about one frame in a sequence (trial) of frames or pages. A frame allows free
 * positioning of content elements on a canvas.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var FrameData = function (expData) {
    var self = this;
    this.expData = expData;
    this.currSelectedElement = ko.observable(null);
    this.parent = null;

    // serialized (the same as in pageData):
    this.id = ko.observable(guid());
    this.type = "FrameData";
    this.name = ko.observable("Frame");
    this.offset = ko.observable(5000).extend({ numeric: 0 });
    this.offsetEnabled = ko.observable(false);
    this.bgColor = ko.observable("#ffffff"); // hex color as string, i.e. "#ffffff"
    this.elements = ko.observableArray([]).extend({ sortById: null });
    this.events = ko.observableArray([]);
    this.localWorkspaceVars = ko.observableArray([]).extend({ sortById: null });
    this.hideMouse = ko.observable(false);
    this.nrOfTrackMousemove = ko.observable(0);

    // consider using additional ko.computeds to make sure that syncFrame can only be activated when exp. is joint exp.
    this.syncFrame = ko.observable(true);

    // serialized (specific for frameData):
    this.frameWidth = ko.observable(800).extend({ rateLimit: { timeout: 50, method: "notifyWhenChangesStop" } });
    this.frameHeight = ko.observable(450).extend({ rateLimit: { timeout: 50, method: "notifyWhenChangesStop" } });
    this.zoomMode = ko.observable("fullscreen"); // "fullscreen" or "pixel" or "visualDegree"
    this.emotionEnabled = ko.observable(false);
    this.emotionFeedbackEnabled = ko.observable(false);
    this.emotionOffset = ko.observable(300).extend({ numeric: 0 });

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    // not serialized
    this.label = "FrameData";
    this.playerFrame = null; // pointer to the playerFrame if running in player.
};

FrameData.prototype.modifiableProp = ["name", "offset", "offsetEnabled", "frameWidth", "frameHeight", "zoomMode", "emotionEnabled", "emotionFeedbackEnabled", "emotionOffset", "hideMouse", "syncFrame"];



FrameData.prototype.dispose = function () {
    var self = this;
    this.elements().forEach(function (elem) {
        self.deleteChildEntity(elem)
    });
    jQuery.each(this.localWorkspaceVars(), function (index, entity) {
        entity.removeBackRef(self);
    });
};

FrameData.prototype.deleteChildEntity = function (entity) {
    var self = this;
    if (entity instanceof ExpEvent) {
        this.events.remove(entity);
    }
    else if (entity instanceof GlobalVar) {
        this.localWorkspaceVars.remove(entity);
        // remove back Ref from workspace
        entity.removeBackRef(self);
    }
    else {
        this.elements.remove(entity);
        if (typeof entity.dispose === 'function') {
            entity.dispose();
        }
        self.expData.entities.remove(entity);
    }

    // if this element was selected, set selection to null
    if (entity === this.currSelectedElement()) {
        this.currSelectedElement(null);
    }
};

FrameData.prototype.getTextRefs = function (textArrOuter, label) {
    jQuery.each(this.elements(), function (index, elem) {
        var textArr = [];
        elem.getTextRefs(textArr, label + '.' + elem.name());
        textArrOuter.push({
            namedEntity: elem,
            textArr: textArr
        })
    });
    return textArrOuter;
};

/**
 * adds a variable to the local workspace of this frame.
 *
 * @param {GlobalVar} variable - the variable to add.
 */
FrameData.prototype.addVariableToLocalWorkspace = function (variable) {
    var isExisting = this.localWorkspaceVars.byId[variable.id()];
    if (!isExisting && !variable.isFactor()) {
        this.localWorkspaceVars.push(variable);
        this.setVarBackRef(variable);
    }
};

FrameData.prototype.setVarBackRef = function (variable) {
    var self = this;
    variable.addBackRef(this, this, false, false, 'local workspace', function (globalVar) {
        self.deleteChildEntity(globalVar);
    });
};

/**
 * add a new frame element to this frame.
 * @param {FrameElement} elem - the new element
 */
FrameData.prototype.addNewSubElement = function (elem) {
    this.elements.push(elem);
    this.expData.entities.insertIfNotExist(elem);
    elem.parent = this;
};

FrameData.prototype.selectTrialType = function (selectionSpec) {
    var elements = this.elements();
    for (var i = 0; i < elements.length; i++) {
        if (typeof elements[i].selectTrialType === 'function') {
            elements[i].selectTrialType(selectionSpec);
        }
    }
};

/**
 * retrieve a frameElement by id.
 * @param id
 * @returns {*}
 */
FrameData.prototype.getElementById = function (id) {
    return this.elements.byId[id];
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
FrameData.prototype.getAllModifiers = function (modifiersArr) {
    modifiersArr.push(this.modifier());
    jQuery.each(this.elements(), function (index, elem) {
        elem.getAllModifiers(modifiersArr);
    });
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
FrameData.prototype.setPointers = function (entitiesArr) {
    var self = this;
    // convert ids to actual pointers:
    this.elements(jQuery.map(this.elements(), function (id) {
        var elem = entitiesArr.byId[id];
        if (elem) {
            elem.parent = self;
            return elem;
        }
        else {
            return null;
        }
    }));

    // convert ids to actual pointers:
    this.localWorkspaceVars(jQuery.map(this.localWorkspaceVars(), function (id) {
        var localVar = entitiesArr.byId[id];
        if (localVar) {
            self.setVarBackRef(localVar);
        }
        return localVar;
    }));

    // for (var i = 0; i < this.parent.globalEvents(); i++) {
    //     console.log('cos');
    // }
    // why after interation in array the parent is null?
    // jQuery.each(this.parent.globalEvents(), function (index, evt) {
    //     evt.parent = self;
    //     self.events().push(evt);
    // })
    jQuery.each(this.events(), function (idx, event) {
        event.setPointers(entitiesArr);
    });
};

/**
 * this function is automatically called after all setPointers have been executed.
 */
FrameData.prototype.onFinishedLoading = function () {
    this.reAddLocalWorkspace();
};

FrameData.prototype.reAddLocalWorkspace = function () {
    var self = this;
    var tmpEntities = ko.observableArray([]).extend({ sortById: null });
    this.reAddEntities(tmpEntities);
    jQuery.each(tmpEntities(), function (idx, entity) {
        if (entity instanceof GlobalVar) {
            if (!self.localWorkspaceVars.byId.hasOwnProperty(entity.id())) {
                self.localWorkspaceVars.push(entity);
            }
        }
    });
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
FrameData.prototype.reAddEntities = function (entitiesArr) {
    // add the direct child nodes:
    jQuery.each(this.elements(), function (index, elem) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id())) {
            entitiesArr.push(elem);
        }

        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities) {
            elem.reAddEntities(entitiesArr);
        }
    });

    // add the direct child nodes:
    jQuery.each(this.events(), function (index, evt) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (evt.reAddEntities) {
            evt.reAddEntities(entitiesArr);
        }
    });

    var self = this;
    jQuery.each(this.parent.globalEvents(), function (index, evt) {
        evt.parent = self;
        self.events().push(evt);
    })
    // add the direct child nodes:
    jQuery.each(this.localWorkspaceVars(), function (index, elem) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id())) {
            entitiesArr.push(elem);
        }
    });

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {FrameData}
 */
FrameData.prototype.fromJS = function (data) {
    var self = this;

    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.offset(data.offset);
    this.offsetEnabled(data.offsetEnabled);
    this.bgColor(data.bgColor);
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
    if (data.hasOwnProperty("hideMouse")) {
        this.hideMouse(data.hideMouse);
    }
    if (data.hasOwnProperty("syncFrame")) {
        this.syncFrame(data.syncFrame);
    }
    this.events(jQuery.map(data.events, function (eventData) {
        return (new ExpEvent(self)).fromJS(eventData);
    }));
    if (data.hasOwnProperty("nrOfTrackMousemove")) {
        this.nrOfTrackMousemove(data.nrOfTrackMousemove);
    }
    this.elements(data.elements);
    this.localWorkspaceVars(data.localWorkspaceVars);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
FrameData.prototype.toJS = function () {
    var events = this.events();
    events = events.filter(function (element) {
        return !element.isGlobal();
    });
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        offset: this.offset(),
        offsetEnabled: this.offsetEnabled(),
        bgColor: this.bgColor(),
        frameWidth: this.frameWidth(),
        frameHeight: this.frameHeight(),
        zoomMode: this.zoomMode(),
        emotionEnabled: this.emotionEnabled(),
        hideMouse: this.hideMouse(),
        syncFrame: this.syncFrame(),
        emotionFeedbackEnabled: this.emotionFeedbackEnabled(),
        emotionOffset: this.emotionOffset(),
        events: jQuery.map(events, function (event) {
            return event.toJS();
        }),
        elements: jQuery.map(this.elements(), function (elem) { return elem.id(); }),
        localWorkspaceVars: jQuery.map(this.localWorkspaceVars(), function (variable) { return variable.id(); }),
        nrOfTrackMousemove: this.nrOfTrackMousemove()

    };
};


