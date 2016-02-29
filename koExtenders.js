// � by Caspar Goeke and Holger Finger

ko.extenders.sortById = function(target, option) {
    target.byId = {};
    target.subscribe(function(changes) {
        var id;
        for (var i= 0, len=changes.length; i<len; i++) {
            if (changes[i].hasOwnProperty('moved')){
                // ignore moves in the unsorted array:
                continue;
            }
            var status = changes[i].status;
            var entity = changes[i].value;
            if (option && option.hasOwnProperty("id_field")) {
                id = entity[option.id_field];
            }
            else {
                id = entity.id;
            }
            if (ko.isObservable(id)) {
                id = id();
            }
            if (status == 'added'){
                target.byId[id] = entity;
            }
            else if (status == 'deleted'){
                delete target.byId[id];
            }
        }

        /* this is the bruteforce approach where we rebuild the full list, instead of only the changes:

         target.byId = {};
         var arrayElem = target();
         for (var i= 0, len=arrayElem.length; i<len; i++) {
            target.byId[arrayElem[i].id()] = arrayElem[i];
         }
         */

    }, null, "arrayChange");
    return target;
};


ko.extenders.numeric = function(target, precision) {
    //create a writable computed observable to intercept writes to our observable
    var result = ko.pureComputed({
        read: target,  //always return the original observables value
        write: function(newValue) {
            var current = target(),
                roundingMultiplier = Math.pow(10, precision),
                newValueAsNum = isNaN(newValue) ? 0 : parseFloat(+newValue),
                valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;

            //only write if it changed
            if (valueToWrite !== current) {
                target(valueToWrite);
            } else {
                //if the rounded value is the same, but a different value was written, force a notification for the current field
                if (newValue !== current) {
                    target.notifySubscribers(valueToWrite);
                }
            }
        }
    }).extend({ notify: 'always' });

    //initialize with current value to make sure it is rounded appropriately
    result(target());

    //return the new computed observable
    return result;
};