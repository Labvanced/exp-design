
var EditorCallbacks = function(frameElementView,frameView,editorOrPlayer, resize,drag,select) {


    // TODO: dispose callbacks in palyer
    this.editorOrPlayer = editorOrPlayer;
    this.resize = resize;
    this.drag = drag;
    this.select = select;
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
        "display": "block"
    });

    // draggable handles:
    if (this.drag){
        this.handleN = document.createElement('div');
        $(this.handleN).addClass('draggableHandleN draggableHandle');
        $(this.handleN).appendTo(this.handles);

        this.handleW = document.createElement('div');
        $(this.handleW).addClass('draggableHandleW draggableHandle');
        $(this.handleW).appendTo(this.handles);

        this.handleE = document.createElement('div');
        $(this.handleE).addClass('draggableHandleE draggableHandle');
        $(this.handleE).appendTo(this.handles);

        this.handleS = document.createElement('div');
        $(this.handleS).addClass('draggableHandleS draggableHandle');
        $(this.handleS).appendTo(this.handles);
    }

    // resizable handles:
    if (this.resize){
        this.handleResizeNW = document.createElement('div');
        $(this.handleResizeNW).addClass('ui-resizable-handle ui-resizable-nw resizableHandleNW resizableHandle');
        $(this.handleResizeNW).appendTo(this.handles);

        this.handleResizeNE = document.createElement('div');
        $(this.handleResizeNE).addClass('ui-resizable-handle ui-resizable-ne resizableHandleNE resizableHandle');
        $(this.handleResizeNE).appendTo(this.handles);

        this.handleResizeSW = document.createElement('div');
        $(this.handleResizeSW).addClass('ui-resizable-handle ui-resizable-sw resizableHandleSW resizableHandle');
        $(this.handleResizeSW).appendTo(this.handles);

        this.handleResizeSE = document.createElement('div');
        $(this.handleResizeSE).addClass('ui-resizable-handle ui-resizable-se resizableHandleSE resizableHandle');
        $(this.handleResizeSE).appendTo(this.handles);

        this.handleResizeN = document.createElement('div');
        $(this.handleResizeN).addClass('ui-resizable-handle ui-resizable-n resizableHandleN resizableHandle');
        $(this.handleResizeN).appendTo(this.handles);

        this.handleResizeE = document.createElement('div');
        $(this.handleResizeE).addClass('ui-resizable-handle ui-resizable-e resizableHandleE resizableHandle');
        $(this.handleResizeE).appendTo(this.handles);

        this.handleResizeW = document.createElement('div');
        $(this.handleResizeW).addClass('ui-resizable-handle ui-resizable-w resizableHandleW resizableHandle');
        $(this.handleResizeW).appendTo(this.handles);

        this.handleResizeS = document.createElement('div');
        $(this.handleResizeS).addClass('ui-resizable-handle ui-resizable-s resizableHandleS resizableHandle');
        $(this.handleResizeS).appendTo(this.handles);
    }
    $(this.handles).appendTo(this.div);
};

EditorCallbacks.prototype.addCallbacks = function() {
    var self2 = this;

    if (this.select){
        $(this.div).click(function() {
            self2.frameView.parent.selectElement(self2.dataModel);
            if (self2.editorOrPlayer == 'player') {
                self2.frameView.subElemSelected = true;
                setTimeout(function () {
                    self2.frameView.subElemSelected = false;
                },100)
            }
        });
    }

    if (this.drag){
        // Draggable On Frame in Editor View:
        $(this.div).draggable({
            handle: '.draggableHandle',
            distance: 10,
            cancel : '.notDraggable',
            drag : function(event, ui) {
                self2.frameElementView.setCoord(ui.position.left * (1 / self2.frameView.scale()), ui.position.top * (1 / self2.frameView.scale()));
            },
            start: function(event, ui) {

                if (self2.editorOrPlayer == 'player'){
                    if (self2.select){
                        self2.frameView.setSelectedElement(self2.dataModel);
                    }
                }

                if (self2.editorOrPlayer == 'editor'){
                    self2.frameView.setSelectedElement(self2.dataModel);
                    // temporarily disable autosaving during dragging:
                    self2.dataModel.expData.parentExperiment.tempDisableAutosave = true;
                }

            },
            stop: function(event, ui) {
                self2.frameElementView.setCoord(ui.position.left * (1 / self2.frameView.scale()), ui.position.top * (1 / self2.frameView.scale()));
                if (self2.editorOrPlayer == 'editor'){
                    self2.dataModel.expData.parentExperiment.tempDisableAutosave = false;
                    self2.dataModel.expData.notifyChanged();
                }

            }
        });
    }


    if (this.resize){
        // Make resizable:
        this.addResize();
        this.dataModel.keepAspectRatio.subscribe(function(newVal) {
            self2.addResize();
            self2.frameView.parent.selectElement(self2.dataModel);
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
        if (self2.editorOrPlayer == 'editor'){
            $(self2.div).resizable("disable");
        }

    }

};


EditorCallbacks.prototype.addResize = function() {
    var self2 = this;

    // destroy previously initialized resize element if it exists:
    if ($(self2.div).resizable( "instance" )) {
        $(self2.div).resizable( "destroy" );
        $(self2.handles).remove();
        self2.addHandles();
    }

    $(this.div).resizable({
        resize: function (eevent, ui) {
            var sizeInPx = ui.size;
            var width = sizeInPx.width * (1 / self2.frameView.scale());
            var height = sizeInPx.height * (1 / self2.frameView.scale());
            self2.frameElementView.setWidthAndHeight(width, height);

            var left = ui.position.left / self2.frameView.scale();
            var top = ui.position.top / self2.frameView.scale();

            self2.frameElementView.setCoord(left, top);
        },
        aspectRatio: self2.dataModel.keepAspectRatio(),
        start: function(event, ui) {
            if (self2.editorOrPlayer == 'editor') {
                // temporarily disable autosaving during dragging:
                self2.dataModel.expData.parentExperiment.tempDisableAutosave = true;
            }
        },
        stop: function(event, ui) {
            if (self2.editorOrPlayer == 'editor') {
                // remove the temporary disabled autosaving:
                self2.dataModel.expData.parentExperiment.tempDisableAutosave = false;
                self2.dataModel.expData.notifyChanged();
            }
        },
        handles:

            {
                'nw':  $(self2.handleResizeNW),
                'ne': $(self2.handleResizeNE),
                'sw': $(self2.handleResizeSW),
                'se': $(self2.handleResizeSE),
                'n':  $(self2.handleResizeN),
                'e':  $(self2.handleResizeE),
                's':  $(self2.handleResizeS),
                'w':  $(self2.handleResizeW)
            }
    });

};

EditorCallbacks.prototype.dispose = function() {
        //TODO add dispose
};