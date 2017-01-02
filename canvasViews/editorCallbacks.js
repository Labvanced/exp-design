
var EditorCallbacks = function(frameElementView,frameView) {

    this.frameElementView = frameElementView;
    this.div = this.frameElementView.div;
    this.dataModel = this.frameElementView.dataModel;
    this.frameView = frameView;

    this.addCallbacks();

    this.frameElementView.callbacks = this;
};

EditorCallbacks.prototype.addCallbacks = function() {
    var self2 = this;

    $(this.div).click(function() {
        self2.frameView.setSelectedElement(self2.dataModel);
    });

    // Draggable On Frame in Editor View:
    $(this.div).draggable({
        distance: 10,
        cancel : '.notDraggable',
        drag : function(event, ui) {
            self2.frameElementView.setCoord(ui.position.left * (1 / self2.frameView.scale()), ui.position.top * (1 / self2.frameView.scale()));
        },
        start: function(event, ui) {
            self2.frameView.setSelectedElement(self2.dataModel);
            // temporarily disable autosaving during dragging:
            self2.dataModel.expData.parentExperiment.tempDisableAutosave = true;
        },
        stop: function(event, ui) {
            self2.frameElementView.setCoord(ui.position.left * (1 / self2.frameView.scale()), ui.position.top * (1 / self2.frameView.scale()));
            // remove the temporary disabled autosaving:
            self2.dataModel.expData.parentExperiment.tempDisableAutosave = false;
            self2.dataModel.expData.notifyChanged();
        }
    });

    // Make resizable:
    this.addResize();
    this.dataModel.keepAspectRatio.subscribe(function(newVal) {
        self2.addResize();
    });

    // It is only draggable or resizable when it is selected:
    this.frameElementView.isSelected.subscribe(function(newVal){
        if (newVal) {
            $(self2.div).resizable("enable");
            $(self2.div).draggable( "option", "distance", 0 );
        }
        else {
            $(self2.div).resizable("disable");
            $(self2.div).draggable( "option", "distance", 10 );
        }
    });
    $(self2.div).resizable("disable");
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
            var width = sizeInPx.width * (1 / self2.frameView.scale());
            var height = sizeInPx.height * (1 / self2.frameView.scale());
            self2.frameElementView.setWidthAndHeight(width, height);
        },
        aspectRatio: self2.dataModel.keepAspectRatio(),
        start: function(event, ui) {
            // temporarily disable autosaving during dragging:
            self2.dataModel.expData.parentExperiment.tempDisableAutosave = true;
        },
        stop: function(event, ui) {
            // remove the temporary disabled autosaving:
            self2.dataModel.expData.parentExperiment.tempDisableAutosave = false;
            self2.dataModel.expData.notifyChanged();
        }
    });

};