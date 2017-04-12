
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
};

function createPageElementComponents() {

    ko.components.register('pageElement-preview-component',{
        viewModel: {
            createViewModel: function (params, componentInfo) {
                return new PageElementViewModel(params.dataModel, params.parentViewModel, componentInfo.element);
            }
        },
        template: {element: 'pageElement-preview-template'}
    });

    ko.components.register('pageElement-player-component',{
        viewModel: {
            createViewModel: function (params, componentInfo) {
                return new PageElementViewModel(params.dataModel, params.parentViewModel, componentInfo.element);
            }
        },
        template: {element: 'pageElement-playerview-template'}
    });

}


