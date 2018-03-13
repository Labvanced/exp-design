
var PageElementViewModel = function(dataModel, parentViewModel, div) {

    this.dataModel = dataModel;
    this.parentViewModel = parentViewModel;

    this.selectedTrialView = this.dataModel.modifier().selectedTrialView;
    this.isSelected = ko.observable(false);
    this.div = div;

    // add a link from the parentViewModel.viewElements to this view instance:
    this.parentViewModel.viewElements.byId[this.dataModel.id()] = this;

};
PageElementViewModel.prototype.dispose = function() {
    console.log("disposing page element view model");
    // remove the link from the parentViewModel.viewElements to this view instance:
    delete this.parentViewModel.viewElements.byId[this.dataModel.id()];

    // remove div
    $(this.div).remove();
};

function createPageElementComponents() {

    ko.components.register('pageElement-preview-component',{
        viewModel: {
            createViewModel: function (params, componentInfo) {
                var pageViewModel = new PageElementViewModel(params.dataModel, params.parentViewModel, componentInfo.element);

                $('.questionnaireElement').css(
                    "background-color", params.parentViewModel.pageData.bgColor()
                );

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


