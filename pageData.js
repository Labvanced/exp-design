
var PageData = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "New_Page";
    this.id = ko.observable(guid());

    this.currSelectedElement = ko.observable(null);

    //serialized
    this.type= "PageData";
    this.name = ko.observable("PageData");
    this.returnButton = ko.observable(true);
    this.selected = ko.observable(false);
    this.elements = ko.observableArray([]);
    this.answerTime = ko.observable(Infinity);
    this.shuffleAll = ko.observable(false);

    this.bgColor = ko.observable("#000000"); // hex color as string, i.e. "#ffffff"
    this.bgColorEnabled = ko.observable(false); // if false, then use experiment default background co

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    // sub-Structures (serialized below)
    this.localWorkspaceVars = ko.observableArray([]).extend({sortById: null});
    this.events = ko.observableArray([]).extend({sortById: null});
    this.localWorkspaceVars = ko.observableArray([]).extend({sortById: null});


};

PageData.prototype.addElem = function (elem) {
    this.elements.push(elem);
};

PageData.prototype.modifiableProp = ["returnButton"];


PageData.prototype.addVariableToLocalWorkspace = function(variable) {
    var isExisting = this.localWorkspaceVars.byId[variable.id()];
    if (!isExisting) {
        this.localWorkspaceVars.push(variable);
        variable.addBackRef(this, this, false, false, 'workspace variable');
    }
};

PageData.prototype.setPointers = function(entitiesArr) {

    var self = this;

    // convert ids to actual pointers:
    this.elements(jQuery.map( this.elements(), function( id ) {
        var elem = entitiesArr.byId[id];
        elem.parent = self;
        return elem;
    } ));
};

PageData.prototype.getElementById = function(id) {
    return  this.elements.byId[id];
};


PageData.prototype.reAddEntities = function(entitiesArr) {
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

};

PageData.prototype.previousPage = function() {
 player.currQuestionnaireView.previousPage()
};

PageData.prototype.nextPage = function() {
    player.currQuestionnaireView.nextPage()
};

PageData.prototype.submitQuestionnaire = function() {
    player.currQuestionnaireView.submitQuestionnaire()
};

PageData.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } )
    };
};

PageData.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type=data.type;
    this.elements(data.elements);

};

ko.components.register('page-element-edit', {
    viewModel: function(dataModel){
        this.returnButton = dataModel.returnButton;
        this.previousMandatory = dataModel

    } ,
    template:
        '<div class="panel-body">\
            <span>\
                <h5 style="display: inline-block; vertical-align: middle; font-size: medium">Return: </h5>\
                <input style="display: inline-block; transform: scale(1.3); vertical-align: middle; margin-left: 5px" type="checkbox" data-bind="checked: returnButton">\
            </span>\
        </div>'
});


ko.components.register('page-element-preview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.returnButton = dataModel.returnButton;
    },
    template:
        '<div class="panel-body">' +
        '<div style="text-align: center;">PAGE BREAK</div>   ' +
        '<div style="margin: auto; max-width: 40%">' +
        '       <img style="float: right;" src="/resources/next.png"/></img>' +
        '       <img data-bind="visible: returnButton" style="float: left; -moz-transform: scale(-1, 1);' +
        ' -webkit-transform: scale(-1, 1); -o-transform: scale(-1, 1); -ms-transform: scale(-1, 1); transform: scale(-1, 1);" src="/resources/next.png">' +
        '   </div>' +
        '</div>'
});


ko.components.register('page-playerview',{
    viewModel: function(dataModel){
        this.dataModel = dataModel;
        this.returnButton = dataModel.returnButton;

        this.backwards= false;
        this.next= true;
        this.submit= false;
        if (dataModel.currPage>1){
            this.backwards = true;
        }
        if (dataModel.currPage==dataModel.totalPages){
            this.next = false;
            this.submit = true;
        }


    },
    template:
    '<div class="panel-body">' +
    '<span data-bind="if:backwards"><button class="btn-primary" data-bind="click: function() { dataModel.previousPage(); }">back</button></span>'+
    '<span data-bind="if:next"><button class="btn-primary" data-bind="click: function() { dataModel.nextPage(); }">next</button></span>'+
    '<span data-bind="text: $component.type"></span>' +
    '<span data-bind="if:submit"><button class="btn-primary" data-bind="click: function() {dataModel.submitQuestionnaire(); }">submit</button></span>'+
    '</div>'
});

