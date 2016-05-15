/**
 * Created by kstandvoss on 15/02/16.
 */


var NewPageElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "New_Page";

    //serialized
    this.type= "NewPageElement";
    this.returnButton = ko.observable(true);
    this.selected = ko.observable(false);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

NewPageElement.prototype.modifiableProp = ["returnButton"];


NewPageElement.prototype.setPointers = function() {

};

NewPageElement.prototype.previousPage = function() {
 player.currQuestionnaireView.previousPage()
};

NewPageElement.prototype.nextPage = function() {
    player.currQuestionnaireView.nextPage()
};

NewPageElement.prototype.submitQuestionnaire = function() {
    player.currQuestionnaireView.submitQuestionnaire()
};

NewPageElement.prototype.toJS = function() {
    return {
        type: this.type
    };
};

NewPageElement.prototype.fromJS = function(data) {
    this.type=data.type;

};

ko.components.register('newPage-element-edit', {
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


ko.components.register('newPage-element-preview',{
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


ko.components.register('newpage-playerview',{
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

