
var IFrameElement = function(expData) {
    var self  = this;
    this.expData = expData;
    this.parent = null;

};

IFrameElement.prototype.label = "IFrame";
IFrameElement.prototype.iconPath = "/resources/icons/tools/tool_text.svg";



IFrameElement.prototype.init = function() {
    var self = this;
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
    };
};

IFrameElement.prototype.fromJS = function(data) {
    this.type=data.type;

};

function createIFrameElementComponents() {
    ko.components.register('iframe-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                  
                };

                return new viewModel(dataModel);
            }

        },
        template: {element: 'iframe-editview-template'}
    });

    ko.components.register('iframe-element-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'iframe-element-preview-template'}
    });


    ko.components.register('iframe-element-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'iframe-element-playerview-template'}
    });
}
