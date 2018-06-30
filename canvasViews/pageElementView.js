
var PageElementViewModel = function(dataModel, parentViewModel, div) {

    this.dataModel = dataModel;
    this.parentViewModel = parentViewModel;

    this.selectedTrialView = this.dataModel.modifier().selectedTrialView;
    this.isSelected = ko.observable(false);
    this.div = div;

    this.setupSubcr();

    // add a link from the parentViewModel.viewElements to this view instance:
    this.parentViewModel.viewElements.byId[this.dataModel.id()] = this;

};

PageElementViewModel.prototype.setupSubcr = function() {
    if (typeof uc === "undefined"){
        var elem = $($(this.div).parent().context).children()[0];
    }
    else{
        var elem = $($(this.div).parent().context).children()[1];
    }


    $(elem).css("margin-left",parseInt(this.dataModel.marginLeft()));
    if (this.marginLeftSubscrption){
        this.marginLeftSubscrption.dispose()
    }
    this.marginLeftSubscrption = this.dataModel.marginLeft.subscribe(function(val){
        $(elem).css("margin-left",parseInt(val));
    });

    $(elem).css("margin-right",parseInt(this.dataModel.marginRight()));
    if (this.marginRightSubscrption){
        this.marginRightSubscrption.dispose()
    }
    this.marginRightSubscrption = this.dataModel.marginRight.subscribe(function(val){
        $(elem).css("margin-right",parseInt(val));
    });
    $(elem).css("margin-top",parseInt(this.dataModel.marginTop()));
    if (this.marginTopSubscrption){
        this.marginTopSubscrption.dispose()
    }
    this.marginTopSubscrption = this.dataModel.marginTop.subscribe(function(val){
        $(elem).css("margin-top",parseInt(val));
    });

    $(elem).css("margin-bottom",parseInt(this.dataModel.marginBottom()));
    if (this.marginBottomSubscrption){
        this.marginBottomSubscrption.dispose()
    }
    this.marginBottomSubscrption = this.dataModel.marginBottom.subscribe(function(val){
        $(elem).css("margin-bottom",parseInt(val));
    });


    $(elem).css("padding-left",parseInt(this.dataModel.paddingLeft()));
    if (this.paddingLeftSubscrption){
        this.paddingLeftSubscrption.dispose()
    }
    this.paddingLeftSubscrption = this.dataModel.paddingLeft.subscribe(function(val){
        $(elem).css("padding-left",parseInt(val));
    });
    $(elem).css("padding-right",parseInt(this.dataModel.paddingRight()));
    if (this.paddingRightSubscrption){
        this.paddingRightSubscrption.dispose()
    }
    this.paddingRightSubscrption = this.dataModel.paddingRight.subscribe(function(val){
        $(elem).css("padding-right",parseInt(val));
    });
    $(elem).css("padding-top", parseInt(this.dataModel.paddingTop()));
    if (this.paddingTopSubscrption){
        this.paddingTopSubscrption.dispose()
    }
    this.paddingTopSubscrption = this.dataModel.paddingTop.subscribe(function(val){
        $(elem).css("padding-top",parseInt(val));
    });
    $(elem).css("padding-bottom",parseInt(this.dataModel.paddingBottom()));
    if (this.paddingBottomSubscrption){
        this.paddingBottomSubscrption.dispose()
    }
    this.paddingBottomSubscrption = this.dataModel.paddingBottom.subscribe(function(val){
        $(elem).css("padding-bottom",parseInt(val));
    });
};



PageElementViewModel.prototype.dispose = function() {
    console.log("disposing page element view model");

    // remove div
  //  $(this.div).remove();

    // remove the link from the parentViewModel.viewElements to this view instance:
    delete this.parentViewModel.viewElements.byId[this.dataModel.id()];
};

function createPageElementComponents() {

    ko.components.register('pageElement-preview-component',{
        viewModel: {
            createViewModel: function (params, componentInfo) {
                var pageViewModel = new PageElementViewModel(params.dataModel, params.parentViewModel, componentInfo.element);


                $('.questionnaireElement').css("background-color", params.parentViewModel.pageData.bgColor());
                if (this.bgSubscrption){
                    this.bgSubscrption.dispose()
                }
                this.bgSubscrption = params.parentViewModel.pageData.bgColor.subscribe(function(val){
                    $('.questionnaireElement').css(
                        "background-color",val
                    );
                });

                return pageViewModel

            }
        },
        template: {element: 'pageElement-preview-template'}
    });

    ko.components.register('pageElement-player-component',{
        viewModel: {
            createViewModel: function (params, componentInfo) {
                var pageViewModel = new PageElementViewModel(params.dataModel, params.parentViewModel, componentInfo.element);

                $('.questionnaireElement').css(
                    "background-color", params.parentViewModel.pageData.bgColor()
                );

                return pageViewModel

            }
        },
        template: {element: 'pageElement-playerview-template'}
    });

}


