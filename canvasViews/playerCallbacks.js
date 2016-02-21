/**
 * Created by cgoeke on 2/1/16.
 */

var PlayerCallbacks = function(frameElement,view) {
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




PlayerCallbacks.prototype.addCallbacks = function() {

    var responses = this.dataModel.responses();
    var self = this;

    for(var cb = 0; cb<responses.length;cb++){
        var callback = responses[cb];
        if(callback.isKeyboardResponse()){

        }
        else if(callback.isMouseResponse()){

            if(callback.responseKey()=="leftClick"){

                $(this.div).click(function() {
                    callback.action().run(self.dataModel);
                });

            }

        }
    }
};

