
var ProgressBarElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "ProgressBar";

    //serialized
    this.type = "ProgressBarElement";
    this.progressValue =  ko.observable(50);
    this.id = ko.observable(guid());

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

ProgressBarElement.prototype.modifiableProp = ["progressValue"];
ProgressBarElement.prototype.dataType =      [ "numeric"];
ProgressBarElement.prototype.initWidth = 500;
ProgressBarElement.prototype.initHeight = 40;


ProgressBarElement.prototype.init = function() {


};

ProgressBarElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

ProgressBarElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

ProgressBarElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

ProgressBarElement.prototype.toJS = function() {
    return {
        type: this.type,
        progressValue: this.progressValue(),
        id:this.id(),
        modifier: this.modifier().toJS()
    };
};

ProgressBarElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.progressValue(data.progressValue);
    this.id(data.id);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};

function createProgressBarComponents() {
    ko.components.register('progress-bar-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    this.dataModel = ko.observable(dataModel);
                    this.progressValue = dataModel.progressValue;
                    this.focus = function () {
                        this.dataModel.ckInstance.focus();
                    };
                };
                return new viewModel(dataModel);
            }

        },
        template: {element: 'progress-bar-editview-template'}
    });

    ko.components.register('progress-bar-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = ko.observable(dataModel);


                    this.progressbar = $('#progressBarPrev');
                    var varNewId  = guid();
                    this.progressbar.attr("id",varNewId);

                    this.progressbar.css(
                        "width", self.dataModel().progressValue()+'%'
                    );

                    if (this.progressBarSubscription){
                        this.progressBarSubscription.dispose()
                    }
                    this.progressBarSubscription = this.dataModel().progressValue.subscribe(function(val){
                        self.progressbar.css(
                            "width", self.dataModel().progressValue()+'%'
                        );
                    });

                };



                return new viewModel(dataModel);
            }
        },
        template: {element: 'progress-bar-preview-template'}
    });


    ko.components.register('progress-bar-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = ko.observable(dataModel);

                    this.progressbar = $('#progressBarPlayer');
                    var varNewId  = guid();
                    this.progressbar.attr("id",varNewId);

                    this.progressbar.css(
                        "width", self.dataModel().progressValue()+'%'
                    );


                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'progress-bar-playerview-template'}
    });
}
