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

    this.frameElement.callbacks = this;
    this.eventsByTriggerType = {};
    this.addCallbacks();
};

PlayerCallbacks.prototype.onTrigger = function(triggerType) {
    var eventsToTrigger = this.eventsByTriggerType[triggerType];
    for (var i=0; i<eventsToTrigger.length; i++){
        eventsToTrigger[i].action().run(this.dataModel);
    }
};

PlayerCallbacks.prototype.registerEventByTrigger = function(event, triggerType) {
    if (!this.eventsByTriggerType.hasOwnProperty(triggerType)){
        this.eventsByTriggerType[triggerType] = [];
    }
    this.eventsByTriggerType[triggerType].push(event);
};

PlayerCallbacks.prototype.addCallbacks = function() {
    var self = this;

    var events = this.dataModel.responses();
    for(var i = 0; i<events.length; i++){
        var event = events[i];
        if(event.isKeyboardResponse()){

        }
        else if(event.isMouseResponse()){
            if(event.responseKey()=="leftClick"){
                this.registerEventByTrigger(event, 'mouseLeftClick');

                // closure to make event persistent over loop:
                (function(event) {
                    $(self.div).click(function() {
                        //self.onTrigger('mouseLeftClick');
                        event.action().run(self.dataModel);
                    });
                })(event);

            }

        }
    }
};

