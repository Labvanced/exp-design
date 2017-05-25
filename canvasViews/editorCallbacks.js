
var EditorCallbacks = function(frameElementView,frameView) {

    this.frameElementView = frameElementView;
    this.div = this.frameElementView.div;
    this.dataModel = this.frameElementView.dataModel;
    this.frameView = frameView;


    this.addHandles();

    this.addCallbacks();

    this.frameElementView.callbacks = this;
};

EditorCallbacks.prototype.addHandles = function() {

    this.handles =  document.createElement('div');
    $(this.handles).css({
        "display": "none"
    });

    this.handleLU = document.createElement('div');
    $(this.handleLU).addClass('draggableHandle draggableHandleLU');
    $(this.handleLU).appendTo(this.handles);

    this.handleLC = document.createElement('div');
    $(this.handleLC).addClass('draggableHandle draggableHandleLC');
    $(this.handleLC).appendTo(this.handles);

    this.handleLB = document.createElement('div');
    $(this.handleLB).addClass('draggableHandle draggableHandleLB');
    $(this.handleLB).appendTo(this.handles);

    this.handleCB = document.createElement('div');
    $(this.handleCB).addClass('draggableHandle draggableHandleCB');
    $(this.handleCB).appendTo(this.handles);

    this.handleRB = document.createElement('div');
    $(this.handleRB).addClass('draggableHandle draggableHandleRB');
    $(this.handleRB).appendTo(this.handles);

    this.handleRC = document.createElement('div');
    $(this.handleRC).addClass('draggableHandle draggableHandleRC');
    $(this.handleRC).appendTo(this.handles);

    this.handleRU = document.createElement('div');
    $(this.handleRU).addClass('draggableHandle draggableHandleRU');
    $(this.handleRU).appendTo(this.handles);

    this.handleCU = document.createElement('div');
    $(this.handleCU).addClass('draggableHandle draggableHandleCU');
    $(this.handleCU).appendTo(this.handles);

    $(this.handles).appendTo(this.div)

};

EditorCallbacks.prototype.addCallbacks = function() {
    var self2 = this;

    $(this.div).click(function() {
        self2.frameView.parent.selectElement(self2.dataModel);
    });


    //

    // Draggable On Frame in Editor View:
    $(this.div).draggable({
        handle: '.draggableHandle',
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
            $(self2.handles).css({
                "display": "block"
            });

        }
        else {
            $(self2.div).resizable("disable");
            $(self2.div).draggable( "option", "distance", 10 );
            $(self2.handles).css({
                "display": "none"
            });


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