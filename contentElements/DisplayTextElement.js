
var DisplayTextElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "DisplayText";

    //serialized
    this.type = "DisplayTextElement";

    // content
    this.elements = ko.observableArray([]);

    // style
    this.margin = ko.observable('5pt');

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.editText = ko.observable(false);
    this.selected = ko.observable(false);
    /////
};

DisplayTextElement.prototype.modifiableProp = ["text"];
DisplayTextElement.prototype.dataType =      [ "string"];


DisplayTextElement.prototype.addEntry = function() {
    var DisplayTextEntry = new DisplayTextEntry(this);
    DisplayTextEntry.init();
    this.elements.push(DisplayTextEntry);
};

DisplayTextElement.prototype.removeEntry = function(idx) {
    this.elements.splice(idx,1);
};

DisplayTextElement.prototype.setPointers = function(entitiesArr) {

    for (var i=0; i<this.elements().length; i++) {
        this.elements()[i].setPointers(entitiesArr);
    }
    this.modifier().setPointers(entitiesArr);
};

DisplayTextElement.prototype.reAddEntities = function(entitiesArr) {

    jQuery.each( this.elements(), function( index, elem ) {
        elem.reAddEntities(entitiesArr)
    } );
    this.modifier().reAddEntities(entitiesArr);
};

DisplayTextElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

DisplayTextElement.prototype.toJS = function() {
    return {
        type: this.type,
        text: this.text(),
        elements: jQuery.map( this.elements(), function( elem ) {
            return elem.toJS();
        }),
        modifier: this.modifier().toJS()
    };
};

DisplayTextElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.text(data.text);
    this.elements(jQuery.map( data.elements, function( elemData ) {
        return (new CheckBoxEntry(self)).fromJS(elemData);
    } ));
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};



var DisplayTextEntry= function(displayTextParent) {
    this.displayTextParent = displayTextParent;
    this.text = ko.observable('<span style="font-size:24px;"><span style="font-family:Arial,Helvetica,sans-serif;">You can display your custom text here.</span></span>');
};

DisplayTextEntry.prototype.dataType =[ "string"];

DisplayTextEntry.prototype.init = function() {
};

DisplayTextEntry.prototype.setVariableBackRef = function() {

};

DisplayTextEntry.prototype.fromJS = function(data) {
    this.text(data.text);
    return this;
};

DisplayTextEntry.prototype.toJS = function() {
    return {
        text:  this.text()
    };
};

DisplayTextEntry.prototype.setPointers = function(entitiesArr) {

};

DisplayTextEntry.prototype.reAddEntities = function(entitiesArr) {

};




function createDisplayTextComponents() {
    ko.components.register('display-text-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.text = dataModel.text;
                    this.focus = function () {
                        this.dataModel.ckInstance.focus();
                    };
                };
                return new viewModel(dataModel);
            }

        },
        template: {element: 'display-text-editview-template'}
    });

    ko.components.register('display-text-element-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = dataModel;
                    this.text = dataModel.text;

                    this.subscriber = null;
                    this.dataModel.editText.subscribe(function (val) {
                        if (val) {
                            console.log("start editing inline text...");
                            self.subscriber = self.dataModel.parent.parent.currSelectedElement.subscribe(function(newVal) {
                                if (newVal != self.dataModel.parent) {
                                    console.log("other element was selected...");
                                    self.dataModel.editText(false);
                                    self.subscriber.dispose();
                                }
                            });
                        }
                    });
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'display-text-element-preview-template'}
    });


    ko.components.register('display-text-element-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.text = dataModel.text;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'display-text-element-playerview-template'}
    });
}
