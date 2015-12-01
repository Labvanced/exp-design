// � by Caspar Goeke and Holger Finger

var ExpData = function () {
    this.expData = this; // self reference for consistency with other classes..
    this.entities = ko.observableArray([]).extend({sortById: null});
    this.groups = ko.observableArray([]).extend({sortById: null});
};

ExpData.prototype.setPointers = function() {
    var allEntitiesArray = this.entities();
    jQuery.each( allEntitiesArray, function( index, elem ) {
        elem.setPointers();
    } );
};

ExpData.prototype.addGroup = function(group) {
    return this.groups.push(group);
};

ExpData.prototype.fromJS = function(data) {
    var self = this;

    this.groups([]);
    if (data.hasOwnProperty('entities')) {
        this.entities(jQuery.map(data.entities, function (entityJson) {
            var entity;
            switch (entityJson.type) {
                case 'StartBlock':
                    entity = new StartBlock(self);
                    break;
                case 'EndBlock':
                    entity = new EndBlock(self);
                    break;
                case 'QuestionnaireEditorData':
                    entity = new QuestionnaireEditorData(self);
                    break;
                case 'Connection':
                    entity = new Connection(self);
                    break;
                case 'Sequence':
                    entity = new Sequence(self);
                    break;
                case 'TextEditorData':
                    entity = new TextEditorData(self);
                    break;
                case 'FrameData':
                    entity = new FrameData(self);
                    break;
                case 'SubjectGroup':
                    entity = new SubjectGroup(self);
                    self.groups.push(entity);
                    break;
                case 'Session':
                    entity = new Session(self);
                    break;
                case 'ImageData':
                    entity = new ImageData(self);
                    break;
                default:
                    console.error("type "+ entityJson.type + " is not defined in factory method.")
            }
            entity.fromJS(entityJson);
            return entity;
        }));
    }

    return this;
};

ExpData.prototype.rebuildEntities = function() {
    // first empty the entities list:
    this.entities([]);

    this.reAddEntities();
};

ExpData.prototype.reAddEntities = function() {
    var self = this;

    // add the direct child nodes:
    var allGroups = this.groups();
    jQuery.each( allGroups, function( index, elem ) {
        // check if they are not already in the list:
        if (!self.expData.entities.byId.hasOwnProperty(elem.id()))
            self.expData.entities.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        elem.reAddEntities();
    } );
};

ExpData.prototype.toJS = function() {
    // make sure that we have an up to date global list of all entities:
    this.rebuildEntities();

    // save to JSON:
    return {
        entities: jQuery.map( this.entities(), function( entity ) { return entity.toJS(); })
    };
};