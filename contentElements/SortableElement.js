
var SortableElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Sortable";

    //serialized
    this.id = ko.observable(guid());
    this.type = "SortableElement";
    this.selected = ko.observable(false);
    this.elements =  ko.observableArray([]).extend({sortById: null});

    this.focus = function () {
        this.dataModel.ckInstance.focus()
    };

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

SortableElement.prototype.addElem = function (elem) {

    this.elements.push(elem);
};



SortableElement.prototype.setPointers = function(entitiesArr) {

    var self = this;

    // convert ids to actual pointers:
    this.elements(jQuery.map( this.elements(), function( id ) {
        var elem = entitiesArr.byId[id];
        elem.parent = self;
        return elem;
    } ));
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
SortableElement.prototype.reAddEntities = function(entitiesArr) {
    // add the direct child nodes:
    jQuery.each( this.elements(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id()))
            entitiesArr.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {PageData}
 */
SortableElement.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.elements(data.elements);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
SortableElement.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } )
    };
};




function createSortableElementComponents() {
    // TODO: @Holger Add image FileManager
    ko.components.register('sortable-editview', {
        viewModel: {
            createViewModel: function (section, componentInfo) {
                var viewModel = function(section){
                    this.section = section;
                    this.focus = function () {
                        this.section.ckInstance.focus()
                    };
                };

                return new viewModel(section);
            }

        },
        template: {element: 'sortable-editview-template'}
    });


    ko.components.register('sortable-preview',{
        viewModel: {
            createViewModel: function(section, componentInfo){
                var viewModel = function(section){
                    this.section = section;

                    this.focus = function () {
                        this.section.ckInstance.focus()
                    };
                };

                return new viewModel(section);
            }
        },
        template: { element: 'sortable-preview-template' }
    });


    ko.components.register('sortable-playerview',{
        viewModel: {
            createViewModel: function(section, componentInfo){
                var viewModel = function(section){
                    this.section = section;

                    this.focus = function () {
                        this.section.ckInstance.focus()
                    };
                };

                return new viewModel(section);
            }
        },
        template: {element: 'sortable-playerview-template'}
    });
}



