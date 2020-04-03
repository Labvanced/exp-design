
var IFrameElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    this.type= "IFrameElement";
    this.iFrameUrl = null;
    this.variable = ko.observable(null);

};

IFrameElement.prototype.label = "IFrame";
IFrameElement.prototype.iconPath = "/resources/icons/tools/tool_text.svg";
IFrameElement.prototype.modifiableProp = [];
IFrameElement.prototype.numVarNamesRequired = 0;
IFrameElement.prototype.dataType =      [];


IFrameElement.prototype.init = function() {

};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
IFrameElement.prototype.getAllModifiers = function(modifiersArr) {

};

IFrameElement.prototype.setPointers = function(entitiesArr) {
  
};

IFrameElement.prototype.recalcTextVariables = function() {

};

IFrameElement.prototype.reAddEntities = function(entitiesArr) {
  
};

IFrameElement.prototype.selectTrialType = function(selectionSpec) {
   
};

IFrameElement.prototype.dispose = function () {

};

IFrameElement.prototype.getTextRefs = function(textArr, label){
 
};

IFrameElement.prototype.toJS = function() {
    return {
        type: this.type,
        iFrameUrl: this.iFrameUrl,
    };
};

IFrameElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.iFrameUrl=data.iFrameUrl;

};

function createIFrameElementComponents() {
    ko.components.register('iframe-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.iFrameUrl = dataModel.iFrameUrl;
                };

                return new viewModel(dataModel);
            }

        },
        template: {element: 'iframe-editview-template'}
    });

    ko.components.register('iframe-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.iFrameUrl = dataModel.iFrameUrl;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'iframe-preview-template'}
    });


    ko.components.register('iframe-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.iFrameUrl = dataModel.iFrameUrl;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'iframe-playerview-template'}
    });
}
