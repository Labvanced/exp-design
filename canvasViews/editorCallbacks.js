/**
 * Created by cgoeke on 2/1/16.
 */

var EditorCallbacks = function(frameElement,view) {
    var self = this;

    this.frameElement = frameElement;
    this.div = this.frameElement.div;
    this.dataModel = this.frameElement.dataModel;
    this.view = view;
    this.scale = ko.computed(function() {
        return  this.view.scale();
    }, this);

    this.addCallbacks();

    this.frameElement.callbacks = this;
};




EditorCallbacks.prototype.addCallbacks = function() {
    var self2 = this;

    $(this.div).draggable({
        drag : function(eevent,ui) {
            self2.frameElement.setCoord(ui.position.left*(1/self2.scale()),ui.position.top*(1/self2.scale()));
        },
        start: function( event, ui ) {
            self2.view.setSelectedElement(self2.dataModel)
        }
    });

    this.addResize();
    this.dataModel.lockSize.subscribe(function(newValue) {
        self2.addResize();
    });

    $(this.div).click(function() {
        self2.view.setSelectedElement(self2.dataModel);
    });

};


EditorCallbacks.prototype.addResize = function() {
    var self2 = this;

    // destroy previously initialized resize element if it exists:
    if ($(self2.div).resizable( "instance" )) {
        $(self2.div).resizable( "destroy" );
    }


    $(this.div).resizable({
        resize: function (eevent, ui) {
            var sizeInPx = ui.size;
            var width = sizeInPx.width * (1 / self2.scale());
            var height = sizeInPx.height * (1 / self2.scale());
            self2.frameElement.setWidthAndHeight(width, height);
        },

        aspectRatio: false,
        helper: "ui-resizable-helper"

    });

};