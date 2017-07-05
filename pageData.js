
/**
 * This class stores all information about one page in a sequence (trial) of frames or pages. A page automatically
 * positions all content elements from top to bottom like a normal html page.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var PageData = function(expData) {
    this.expData = expData;
    this.currSelectedElement = ko.observable(null);
    this.parent = null;

    // serialized (the same as in frameData):
    this.id = ko.observable(guid());
    this.type= "PageData";
    this.name = ko.observable("Page");
    this.offset = ko.observable(5000).extend({ numeric: 0 });
    this.offsetEnabled = ko.observable(false);
    this.maxWidth = ko.observable(700);
    this.bgColor = ko.observable("#ffffff"); // hex color as string, i.e. "#ffffff"
    this.elements = ko.observableArray([]).extend({sortById: null});
    this.events = ko.observableArray([]).extend({sortById: null});
    this.localWorkspaceVars = ko.observableArray([]).extend({sortById: null});

    this.hideMouse = ko.observable(false);

    // serialized (specific for pageData):
    this.shuffleAll = ko.observable(false);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    // not serialized
    this.label = "PageData";
    this.playerFrame = null; // pointer to the playerFrame if running in player.
};

PageData.prototype.modifiableProp = ["name","offset","offsetEnabled","hideMouse"];

PageData.prototype.getDeepCopy = function() {
    var self = this;

    var entitiesArr = ko.observableArray([]).extend({sortById: null});
    this.reAddEntities(entitiesArr);
    entitiesArr.push(this);

    // loop through array and create deep copies
    var entitiesArrCopy = jQuery.map(entitiesArr(), function (entity) {
        if ( (entity instanceof GlobalVar && !entity.isFactor()) || entity instanceof Factor) { // no deep copy of global variables so that we can keep state across frames.
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

PageData.prototype.deleteChildEntity = function(entity) {
    var obsArr;
    if (entity instanceof Event) {
        obsArr = this.events;
    }
    else if (entity instanceof GlobalVar) {
        obsArr = this.localWorkspaceVars;
    }
    else {
        obsArr = this.elements;

        // delete associated global vars
        if (entity.content().hasOwnProperty('variable')){
            this.localWorkspaceVars.remove(entity.content().variable())
        }

        // delete associated global vars
        if (entity.content().hasOwnProperty('elements')){
            var elems  = entity.content().elements();
            for (var i = 0; i< elems.length; i++){
                if (elems[i].hasOwnProperty('variable')){
                    this.localWorkspaceVars.remove(elems[i].variable())
                }

            }
        }
    }
    obsArr.remove(entity);

    // if this element was selected, set selection to null
    if (entity === this.currSelectedElement()) {
        this.currSelectedElement(null);
    }
};

PageData.prototype.copyChildEntity = function(entity) {
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

    if (!(entityCopy instanceof Event)) {
        entityCopy.id(guid());
    }

    entityCopy.name(entityCopy.name() + "_copy");
    entityCopy.parent = this;
    entityCopy.setPointers(this.expData.entities);
    obsArr.splice(index+1, 0, entityCopy);
};

/**
 * adds a variable to the local workspace of this page.
 *
 * @param {GlobalVar} variable - the variable to add.
 */
PageData.prototype.addVariableToLocalWorkspace = function(variable) {
    var isExisting = this.localWorkspaceVars.byId[variable.id()];
    if (!isExisting) {
        this.localWorkspaceVars.push(variable);
        variable.addBackRef(this, this, false, false, 'workspace variable');
    }
};

/**
 * add a new page element to this page.
 * @param {PageElement} elem - the new element
 */
PageData.prototype.addNewSubElement = function (elem) {
    this.elements.push(elem);
    this.expData.entities.push(elem);
    elem.parent = this;
};

PageData.prototype.selectTrialType = function(selectionSpec) {
    var elements = this.elements();
    for (var i=0; i<elements.length; i++){
        if (typeof elements[i].selectTrialType === 'function') {
            elements[i].selectTrialType(selectionSpec);
        }
    }
};

/**
 * retrieve a pageElement by id.
 * @param id
 * @returns {*}
 */
PageData.prototype.getElementById = function(id) {
    return this.elements.byId[id];
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
PageData.prototype.getAllModifiers = function(modifiersArr) {
    modifiersArr.push(this.modifier());
    jQuery.each( this.elements(), function( index, elem ) {
        elem.getAllModifiers(modifiersArr);
    } );
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
PageData.prototype.setPointers = function(entitiesArr) {
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
PageData.prototype.reAddEntities = function(entitiesArr) {
    // add the direct child nodes:
    jQuery.each( this.elements(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id())) {
            entitiesArr.push(elem);
        }

        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities) {
            elem.reAddEntities(entitiesArr);
        }
    } );

    // add the direct child nodes:
    jQuery.each( this.events(), function( index, evt ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (evt.reAddEntities) {
            evt.reAddEntities(entitiesArr);
        }
    } );

    // add the direct child nodes:
    jQuery.each( this.localWorkspaceVars(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id())) {
            entitiesArr.push(elem);
        }
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {PageData}
 */
PageData.prototype.fromJS = function(data) {
    var self = this;

    this.id(data.id);
    this.type=data.type;
    if (data.hasOwnProperty("name")) {
        this.name(data.name);
    }
    if (data.hasOwnProperty("offset")) {
        this.offset(data.offset);
    }
    if (data.hasOwnProperty("offsetEnabled")) {
        this.offsetEnabled(data.offsetEnabled);
    }
    if (data.hasOwnProperty("bgColor")) {
        this.bgColor(data.bgColor);
    }
    if (data.hasOwnProperty("events")) {
        this.events(jQuery.map(data.events, function (eventData) {
            return (new Event(self)).fromJS(eventData);
        }));
    }
    if (data.hasOwnProperty("elements")) {
        this.elements(data.elements);
    }
    if (data.hasOwnProperty("localWorkspaceVars")) {
        this.localWorkspaceVars(data.localWorkspaceVars);
    }
    if (data.hasOwnProperty("maxWidth")) {
        this.maxWidth(parseInt(data.maxWidth));
    }
    if (data.hasOwnProperty("hideMouse")) {
        this.hideMouse(data.hideMouse);
    }

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
PageData.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name:  this.name(),
        offset: this.offset(),
        offsetEnabled: this.offsetEnabled(),
        bgColor: this.bgColor(),
        hideMouse: this.hideMouse(),
        events: jQuery.map( this.events(), function( event ) {
            return event.toJS();
        } ),
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } ),
        localWorkspaceVars: jQuery.map( this.localWorkspaceVars(), function( variable ) { return variable.id(); } ),
        maxWidth: parseInt(this.maxWidth())

    };
};