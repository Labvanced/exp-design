// � by Caspar Goeke and Holger Finger

/**
 * extends a knockout observableArray with the ability to retrieve elements by their id.
 *
 * @param target - ko.observableArray
 * @param option -
 * @returns {*}
 */
ko.extenders.sortById = function (target, option) {
    target.byId = {};

    /**
     * insert only pushes to the list if this entity does not exist yet.
     * @param entity
     * @returns true if it was inserted:
     */
    target.insertIfNotExist = function (entity) {
        if (option && option.hasOwnProperty("id_field")) {
            var id = entity[option.id_field];
        }
        else {
            var id = entity.id;
        }
        if (ko.isObservable(id)) {
            id = id();
        }
        if (!target.byId.hasOwnProperty(id)) {
            target.push(entity);
            return true;
        }
        else {
            return false;
        }
    };

    target.subscribe(function (changes) {
        var id;
        for (var i = 0, len = changes.length; i < len; i++) {
            if (changes[i].hasOwnProperty('moved')) {
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
            if (status == 'added') {
                if (id && target.byId.hasOwnProperty(id)) {
                    if (option && option.hasOwnProperty("do_not_warn_when_double_entries") && option["do_not_warn_when_double_entries"]) {
                        // warning is not issued.
                    }
                    else {
                        console.warn("id was already in list and appears now twice in observableArray (extended with sortByID).")
                    }
                }
                target.byId[id] = entity;
            }
            else if (status == 'deleted') {
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

/**
 * extend a ko.observable so that it is numeric and rounded to a specific precision.
 *
 * @param {ko.observable} target - the observable where this is applied
 * @param {number} precision - the number of floating point digits
 */
ko.extenders.numeric = function (target, precision) {
    //create a writable computed observable to intercept writes to our observable
    var result = ko.pureComputed({
        read: target,  //always return the original observables value
        write: function (newValue) {
            var current = target(),
                roundingMultiplier = Math.pow(10, precision),
                newValueAsNum = isNaN(newValue) ? 0 : parseFloat(+newValue),
                valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;

            //only write if it changed
            if (valueToWrite !== current) {
                target(valueToWrite);
            } else {
                //if the rounded value is the same, but a different value was written, force a notification for the current field
                if (newValueAsNum !== current) {
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



ko.bindingHandlers.tooltip = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        if ($(element) != undefined) {
            var contElem = $(valueAccessor());
            $(element).tooltip({
                items: 'span',
                track: true,
                content: function () {
                    return contElem.html();
                }
            });
        }
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        if ($(element) != undefined) {
            $(element).tooltip("destroy");
            var contElem = $(valueAccessor());
            $(element).tooltip({
                items: 'span',
                track: true,
                content: function () {
                    return contElem.html();
                }
            });
        }
    }
};

ko.bindingHandlers.koFocus = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();
        var $element = $(element);
        if (value()) {
            $element.focus();
        } else {
            $element.blur();
        }
    },
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        var $element = $(element);
        if (value()) {
            $element.focus();
        } else {
            $element.blur();
        }
    }
};



ko.bindingHandlers.disableOptionsCaption = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {

        ko.applyBindingsToNode(element, {
            options: viewModel.items,
            optionsCaption: 'please select',
            optionsAfterRender: function (option, item) {

                ko.applyBindingsToNode(option, {
                    disable: !item
                }, item);

            }
        });
    }
};

// CKEDITOR is not defined in player:
if (typeof CKEDITOR !== 'undefined') {

    CKEDITOR.on('currentInstance', function () {
        var instance = CKEDITOR.currentInstance;
        if (instance != null) {
            $("#editorToolbar").show();
        }
    });

    // disable auto inline editing for CKeditor, because the custom binding below is doing this manually:
    CKEDITOR.disableAutoInline = true;

    ko.bindingHandlers.wysiwyg = {

        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var ckEditorValue = valueAccessor();
            var $element = $(element);
            $element.attr('contenteditable', true);
            var ignoreChanges = false;
            var selectAll = allBindings.get('selectAll');

            var instance = CKEDITOR.inline(element, {
                customConfig: '/assets/js/ckeditor_config.js?FILE_VERSION_PLACEHOLDER',
                on: {
                    change: function () {
                        ignoreChanges = true;
                        ckEditorValue(instance.getData());
                        ignoreChanges = false;
                    },
                    instanceReady: function () {
                        if (selectAll) {
                            //instance.execCommand( 'selectAll' );
                        }
                    }
                }
            });

            instance.parentViewModel = viewModel;

            instance.on('blur', function (e) {
                $("#editorToolbar").hide();
                if (viewModel.hasOwnProperty('dataModel') && viewModel.dataModel.hasOwnProperty("editText")) {
                    // This snippet is needed, so that clicking somewhere else will disable the edit and reediting requires a new double click.
                    // Otherwise there would be a bug where default trial could overwrite the edited text!
                    viewModel.dataModel.editText(false);
                }
            });

            viewModel.ckInstance = instance;
            instance.setData(ckEditorValue());
            ckEditorValue.subscribe(function (newValue) {
                if (!ignoreChanges) {
                    instance.setData(newValue);
                }
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                instance.updateElement();
                instance.focusManager.blur(true);
                instance.destroy();
            });

            //instance.focus( );
        }
    };
}


ko.bindingHandlers.selected = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var selected = ko.utils.unwrapObservable(valueAccessor());
        if (selected) element.select();
    }
};


ko.bindingHandlers.singleClick = {
    init: function (element, valueAccessor) {
        var handler = valueAccessor(),
            delay = 200,
            clickTimeout = false;

        $(element).click(function () {
            if (clickTimeout !== false) {
                clearTimeout(clickTimeout);
                clickTimeout = false;
            } else {
                clickTimeout = setTimeout(function () {
                    clickTimeout = false;
                    handler();
                }, delay);
            }
        });
    }
};


// Convert Javascript date to Pg YYYY-MM-DD HH:MI:SS-08
function pgFormatDate(date) {
    function zeroPad(d) {
        return ("0" + d).slice(-2);
    }
    var timeZoneRemainingMinutes;
    var timeZoneOffsetInHours = date.getTimezoneOffset() / 60;
    var dayString = [date.getUTCFullYear(), zeroPad(date.getMonth() + 1), zeroPad(date.getDate())].join("-");
    var timeString = [zeroPad(date.getHours()), zeroPad(date.getMinutes()), zeroPad(date.getSeconds())].join(":");
    if (timeZoneOffsetInHours > 0) {
        // WARNING: according to javascript spec's, the timezone has inverted sign, so we invert + to - and - to +
        timeZoneRemainingMinutes = timeZoneOffsetInHours % 1;
        timeZoneOffsetInHours = "-" + zeroPad(Math.floor(timeZoneOffsetInHours));
    }
    else if (timeZoneOffsetInHours < 0) {
        timeZoneOffsetInHours = -timeZoneOffsetInHours;
        timeZoneRemainingMinutes = timeZoneOffsetInHours % 1;
        timeZoneOffsetInHours = "+" + zeroPad(Math.floor(timeZoneOffsetInHours));
    }
    else {
        timeZoneRemainingMinutes = 0;
        timeZoneOffsetInHours = "+00";
    }
    if (timeZoneRemainingMinutes != 0) {
        timeZoneOffsetInHours = timeZoneOffsetInHours + ":" + zeroPad(Math.floor(timeZoneRemainingMinutes * 60));
    }
    return dayString + " " + timeString + timeZoneOffsetInHours;
}

ko.unapplyBindings = function ($node, remove) {
    // unbind events
    $node.find("*").each(function () {
        $(this).unbind();
    });

    // Remove KO subscriptions and references
    if (remove) {
        ko.removeNode($node[0]);
    } else {
        ko.cleanNode($node[0]);
    }
};