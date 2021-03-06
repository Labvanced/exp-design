
var EditableTextElement = function (expData, parent, text) {
    var self = this;
    this.expData = expData;
    this.parent = parent;

    //serialized
    this.type = "EditableTextElement";
    this.rawText = ko.observable(text);// for example: '<span>Your score: <variable varid="239da92acb23"></span>'
    this.globalVarIds = ko.observableArray([]);

    // not serialized
    this.selected = ko.observable(false);
    this.isEditingText = ko.observable(false);
    this.globalVarRefs = {};

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

};

EditableTextElement.prototype.label = "EditableText";
EditableTextElement.prototype.iconPath = "/resources/icons/tools/tool_text.svg";
EditableTextElement.prototype.modifiableProp = ["rawText"];
EditableTextElement.prototype.dataType = ["string"];
EditableTextElement.prototype.displayNames = ["rawText"];
EditableTextElement.prototype.numVarNamesRequired = 0;

EditableTextElement.prototype.cloneModifiableProp = function (propName, val) {
    if (propName == "rawText") {
        if (typeof val == 'number') {
            // need to create new transation entry:
            referencedTextInMainLanguage = this.expData.translations()[val].languages()[0]();
            var newModText = ko.observable(referencedTextInMainLanguage);
            this.markTextObsTranslatable(newModText);
            return newModText();
        }
        return valOut;
    }
    var valOut = val;
    return valOut;
}

EditableTextElement.prototype.reLinkVar = function (oldVar, newVar) {


    var oldVarId = oldVar.id();
    var newVarId = newVar.id();
    var oldVarName = oldVar.name();
    var newVarName = newVar.name();
    var replStrin1 = oldVarId + '">' + oldVarName;
    var replStrin2 = oldVarId + '">null';
    var newString = newVarId + '">' + newVarName;

    this.rawText(this.rawText().replace(replStrin1, newString));
    this.rawText(this.rawText().replace(replStrin2, newString));
};


EditableTextElement.prototype.init = function () {
};

EditableTextElement.prototype.getAllModifiers = function (modifiersArr) {
    modifiersArr.push(this.modifier());
};

EditableTextElement.prototype.markTextObsTranslatable = function (textObs) {
    var text = textObs();
    if (typeof text !== 'number') {
        var namedEntity = this.parent;
        for (var k = 0; k <= 50 && !(namedEntity instanceof FrameElement || namedEntity instanceof PageElement); k++) {
            namedEntity = namedEntity.parent;
        }

        var translationEntry = new TranslationEntry(this.expData);
        translationEntry.init(namedEntity);
        translationEntry.languages.push(ko.observable(text));
        for (var k = 1; k < this.expData.translatedLanguages().length; k++) {
            // Starts at k=1 because main is already added above!!
            translationEntry.languages.push(ko.observable(''));
        }

        var translationIdx = this.expData.translations().length;
        this.expData.translations.push(translationEntry);
        textObs(translationIdx);
    }
};

EditableTextElement.prototype.unmarkTextObsTranslatable = function (textObs) {
    var text = textObs();
    if (typeof text === 'number') {
        var orig_real_text = "";
        if (this.expData.translations()[text]) {
            if (this.expData.translations()[text].hasOwnProperty("languages")) {
                orig_real_text = this.expData.translations()[text].languages()[0]();
                this.expData.translations()[text] = "removedEntry";
            }
        }
        this.rawText(orig_real_text);
    }
};

EditableTextElement.prototype.markTranslatable = function () {

    this.markTextObsTranslatable(this.rawText);

    // make sure that every trial has it's own unique translation idx:
    var uniqueTranslationIdxs = {};
    uniqueTranslationIdxs[this.rawText()] = true;

    if (this.modifier().ndimModifierTrialTypes.length > 0) {
        var flattend = this.modifier().getFlattendArray();
        for (var k = 0; k < flattend.length; k++) {
            if (flattend[k].modifiedProp.rawText) {

                var transIdx = flattend[k].modifiedProp.rawText();
                if (typeof transIdx == 'number') {
                    if (uniqueTranslationIdxs[transIdx]) {
                        // already used... need to create new transIdx:
                        referencedTextInMainLanguage = this.expData.translations()[transIdx].languages()[0]();
                        flattend[k].modifiedProp.rawText(referencedTextInMainLanguage);
                        this.markTextObsTranslatable(flattend[k].modifiedProp.rawText);
                        uniqueTranslationIdxs[flattend[k].modifiedProp.rawText()] = true;
                    }
                    else {
                        // ok
                    }
                }
                else {
                    // not yet as translationEntry... need to create new transIdx:
                    this.markTextObsTranslatable(flattend[k].modifiedProp.rawText);
                    uniqueTranslationIdxs[flattend[k].modifiedProp.rawText()] = true;
                }
            }
            else {
                // not yet as translationEntry... need to create new transIdx from defaultTrialTransIdx:
                var defaultTrialTransIdx = this.rawText();
                referencedTextInMainLanguage = this.expData.translations()[defaultTrialTransIdx].languages()[0]();
                var newModText = ko.observable(referencedTextInMainLanguage);
                this.markTextObsTranslatable(newModText);
                flattend[k].setModification("rawText", newModText());
                uniqueTranslationIdxs[flattend[k].modifiedProp.rawText()] = true;
            }
        }
    }
};

EditableTextElement.prototype.disableTranslatable = function () {

    this.unmarkTextObsTranslatable(this.rawText);

    if (this.modifier().ndimModifierTrialTypes.length > 0) {
        var flattend = this.modifier().getFlattendArray();
        for (var k = 0; k < flattend.length; k++) {
            if (flattend[k].modifiedProp.rawText) {
                this.unmarkTextObsTranslatable(flattend[k].modifiedProp.rawText);
            }
        }
    }
};

EditableTextElement.prototype.setText = function (text) {
    this.rawText(text);
};

EditableTextElement.prototype.addVar = function (globalVarId) {
    this.globalVarIds.push(globalVarId);
    this.setVariableBackRef(globalVarId);
};

EditableTextElement.prototype.removeVar = function (varId) {
    var index = this.globalVarIds().indexOf(varId);
    if (index >= 0) {
        this.globalVarIds.splice(index, 1);
    }
    this.removeRefbyId(varId);

};

EditableTextElement.prototype.setVariableBackRef = function (globalVarId) {
    var entity = this.expData.entities.byId[globalVarId];
    if (entity) {
        var ref = entity.addBackRef(this, this.parent.parent, false, true, 'withinText');
        this.globalVarRefs[globalVarId] = ref;
    }
};


EditableTextElement.prototype.removeBackRefs = function () {
    for (var id in this.globalVarRefs) {
        if (this.globalVarRefs.hasOwnProperty(id)) {
            var entity = this.expData.entities.byId[id];
            if (entity) {
                entity.removeBackRef(this.globalVarRefs[id]);
            }
        }
    }
    this.globalVarIds([]);
    this.globalVarRefs = {};
};

EditableTextElement.prototype.removeRefbyId = function (varId) {

    if (this.globalVarRefs.hasOwnProperty(varId)) {
        var entity = this.expData.entities.byId[varId];
        if (entity) {
            entity.removeBackRef(this.globalVarRefs[varId]);
        }
        delete this.globalVarRefs[varId];
    }

};



EditableTextElement.prototype.setPointers = function (entitiesArr) {
    var globalVarIds = this.globalVarIds();
    for (var k = 0; k < globalVarIds.length; k++) {
        this.setVariableBackRef(globalVarIds[k]);
    }
    this.modifier().setPointers(entitiesArr);
};

EditableTextElement.prototype.reAddEntities = function (entitiesArr) {
    var linked_entities = this.expData.entities;
    var globalVarIds = this.globalVarIds();
    for (var k = 0; k < globalVarIds.length; k++) {
        var globVar = linked_entities.byId[globalVarIds[k]];
        if (globVar) {
            entitiesArr.insertIfNotExist(globVar)
        }
    }
    this.modifier().reAddEntities(entitiesArr);
};

EditableTextElement.prototype.selectTrialType = function (selectionSpec) {
    this.isEditingText(false); // This line is important! Otherwise, bug resets text when clicking on DefaultTrial!
    this.modifier().selectTrialType(selectionSpec);
};

EditableTextElement.prototype.getTextRefs = function (textArr, label) {

    // always push text of default trial type:
    textArr.push([label, this.rawText, this]);

    if (this.modifier().ndimModifierTrialTypes.length > 0) {
        var flattend = this.modifier().getFlattendArray();
        for (var k = 0; k < flattend.length; k++) {
            if (flattend[k].modifiedProp.rawText) {
                textArr.push([label, flattend[k].modifiedProp.rawText, this]);
            }
            else {
                textArr.push([label, this.rawText, this]);
            }
        }
    }
    return textArr;
};

EditableTextElement.prototype.getAllRawTexts = function () {
    var arrTextObs = this.getTextRefs([], "");
    var allRawTextsExists = {};
    var allRawTextsObs = [];
    for (var k = 0; k < arrTextObs.length; k++) {
        var rawTextInModifierObs = arrTextObs[k][1];
        if (typeof rawTextInModifierObs() == 'number') {
            var allLanguages = this.expData.translations()[rawTextInModifierObs()].languages();
            for (var i = 0; i < allLanguages.length; i++) {
                var rawTextInTranslationObs = allLanguages[i];
                if (!allRawTextsExists[rawTextInTranslationObs._id]) {
                    allRawTextsObs.push(rawTextInTranslationObs);
                    allRawTextsExists[rawTextInTranslationObs._id] = true;
                }
            }
        }
        else {
            if (!allRawTextsExists[rawTextInModifierObs._id]) {
                allRawTextsObs.push(rawTextInModifierObs);
                allRawTextsExists[rawTextInModifierObs._id] = true;
            }
        }

    }
    return allRawTextsObs;
};

EditableTextElement.prototype.toJS = function () {
    return {
        type: this.type,
        rawText: this.rawText(),
        modifier: this.modifier().toJS(),
        globalVarIds: this.globalVarIds()
    };
};

EditableTextElement.prototype.fromJS = function (data) {
    this.type = data.type;

    var purify_config = { ADD_TAGS: ['vars'], ADD_ATTR: ['globvarid'] };
    if (typeof data.rawText === 'number') {
        this.rawText(data.rawText);
    }
    else {
        this.rawText(DOMPurify.sanitize(data.rawText, purify_config));
    }

    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);

    if (this.modifier().ndimModifierTrialTypes.length > 0) {
        var flattend = this.modifier().getFlattendArray();
        for (var k = 0; k < flattend.length; k++) {
            if (flattend[k].modifiedProp.rawText) {
                if (typeof flattend[k].modifiedProp.rawText() != 'number') {
                    flattend[k].modifiedProp.rawText(DOMPurify.sanitize(flattend[k].modifiedProp.rawText(), purify_config));
                }
            }
        }
    }

    // convert and fix double ids in dataModel by merging data.globalVars and data.globalVarIds:
    var allGlobalVarIds = [];
    if (data.hasOwnProperty('globalVars')) {
        allGlobalVarIds = data.globalVars;
    }
    if (data.hasOwnProperty('globalVarIds')) {
        // join arrays:
        allGlobalVarIds = allGlobalVarIds.concat(data.globalVarIds);
    }
    // now remove duplicate ids:
    allGlobalVarIds = allGlobalVarIds.filter(function (item, pos) { return allGlobalVarIds.indexOf(item) == pos });
    this.globalVarIds(allGlobalVarIds);

};

EditableTextElement.prototype.dispose = function () {
    if (typeof uc !== 'undefined') {
        if (typeof this.rawText() === 'number') {
            if (this.expData.translations()[this.rawText()]) {
                this.expData.translations()[this.rawText()] = "removedEntry";
            }
            this.rawText('');
        }
        this.removeBackRefs();
    }
};

function createEditableTextComponents() {

    var EditableTextElementPreviewViewModel = function (dataModel) {
        var self = this;
        this.dataModel = dataModel;
        this.expData = dataModel.expData;

        //regex to parse variable id
        var regex = /<vars.*?globvarid="([^"]*)">.*?<\/vars>/g;


        this.text = ko.pureComputed({

            read: function () {
                var trialViewRaw = self.dataModel.modifier().selectedTrialView.rawText();
                if (typeof trialViewRaw == 'number') {
                    if (self.expData.translations()[trialViewRaw]) {
                        if (self.expData.translations()[trialViewRaw].hasOwnProperty("languages")) {
                            var rawText = self.expData.translations()[trialViewRaw].languages()[self.expData.currentLanguage()]();
                            if (rawText == null) {
                                rawText = self.expData.translations()[trialViewRaw].languages()[0]();
                            }
                            return rawText;
                        }
                    }
                }
                else {
                    return trialViewRaw;
                }
            },

            write: function (value) {

                console.log("writing text");

                var match;
                var ids = [];
                //parse varids
                while (match = regex.exec(value)) {
                    if (match[1] !== "undefined") {
                        ids.push(match[1]);
                    }
                }

                var difference = self.dataModel.globalVarIds().filter(function (n) {
                    return ids.indexOf(n) === -1;
                });

                if (difference.length > 0) {

                    // WARNING: can only remove reference if it is also not present in any modifier or any translation!!!
                    // Therefore need to collect all variable ids used in any rawText:
                    var allRawTextObs = self.dataModel.getAllRawTexts();
                    var globVarIds_inAllRawTexts = [];
                    var globVarIds_inAllRawTexts_exists = {};
                    for (var k = 0; k < allRawTextObs.length; k++) {

                        while (match = regex.exec(allRawTextObs[k]())) {
                            var glob_var_id = match[1];
                            if (glob_var_id !== "undefined") {
                                if (!globVarIds_inAllRawTexts_exists[glob_var_id]) {
                                    globVarIds_inAllRawTexts_exists[glob_var_id] = true;
                                    globVarIds_inAllRawTexts.push(glob_var_id);
                                }
                            }
                        }
                    }

                    var real_difference = self.dataModel.globalVarIds().filter(function (n) {
                        return globVarIds_inAllRawTexts.indexOf(n) === -1;
                    });

                    // remove variable references
                    real_difference.forEach(function (elem) {
                        self.dataModel.removeVar(elem);
                    });
                }

                // add variable references
                for (var i = 0; i < ids.length; i++) {
                    if (!(ids[i] in self.dataModel.globalVarRefs)) {
                        self.dataModel.addVar(ids[i]);
                    }
                }

                var viewOnRawTextObs = self.dataModel.modifier().selectedTrialView.rawText;
                if (typeof viewOnRawTextObs() == 'number') {

                    if (viewOnRawTextObs() == self.dataModel.rawText()) {
                        // the current trial VIEW refers to the default trial (i.e. so far it is an unmodified trial).

                        if (self.dataModel.modifier().selectedTrialType().type == 'allTrials') {
                            // editing default trial:
                            // therefore reset all trials to point to the same translation entry:
                            viewOnRawTextObs(self.dataModel.rawText());
                        }
                        else {
                            // editing some trial/condition that has no modification so far:
                            // first write to modifier (to create new modifierTrialTypes):
                            viewOnRawTextObs(value);

                            // make sure that all trial modifications (that were created due to above Writing) have translation entries:
                            self.dataModel.markTranslatable();
                            //self.dataModel.markTextObsTranslatable(viewOnRawTextObs)
                        }
                    }

                    self.expData.translations()[viewOnRawTextObs()].languages()[self.expData.currentLanguage()](value);
                }
                else {
                    viewOnRawTextObs(value);
                }
            },
            owner: self
        });


        //function to replace globalvar in rawText
        var replaceId = function (_match, id) {
            if (id == 'undefined') {
                return id;
            }
            var entity = self.expData.entities.byId[id];
            if (!entity) {
                return id;
            }
            else {
                if (entity.startValue().toString() == "") { // insert text in empty string to prevent unclickable text elements
                    return 'text'
                }
                else {
                    return entity.startValue().toString();
                }

            }
        };

        this.previewText = ko.computed(function () {
            if (self.text()) {
                return self.text().replace(regex, function (match, id) { return replaceId(match, id); });
            }
            else {
                return ""
            }

        });

    };

    EditableTextElementPreviewViewModel.prototype.dispose = function () {
        this.previewText.dispose();
    };

    ko.components.register('editable-text-element-preview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                return new EditableTextElementPreviewViewModel(dataModel);
            }
        },
        template: { element: 'editable-text-element-preview-template' }
    });

    var EditableTextElementPlayerViewModel = function (dataModel) {
        var self = this;
        this.dataModel = dataModel;
        this.expData = dataModel.expData;

        //regex to parse variable id
        var regex = /<vars.*?globvarid="([^"]*)">.*?<\/vars>/g;

        //function to replace globalvar in rawText
        var replaceId = function (_match, id) {
            if (id == 'undefined') {
                return id;
            }
            var entity = self.expData.entities.byId[id];
            if (!entity) {
                return id;
            }
            else {
                return entity.value().toString();
            }
        };

        this.playerText = ko.computed(function () {
            var trialViewRaw = self.dataModel.modifier().selectedTrialView.rawText();
            if (typeof trialViewRaw == 'number') {
                if (self.expData.translations()[trialViewRaw]) {
                    if (self.expData.translations()[trialViewRaw].hasOwnProperty("languages")) {
                        var rawText = self.expData.translations()[trialViewRaw].languages()[self.expData.currentLanguage()]();
                        if (rawText == null) {
                            rawText = self.expData.translations()[trialViewRaw].languages()[0]();
                        }
                        return rawText.replace(regex, function (match, id) { return replaceId(match, id); });
                    }
                }
            }
            else {
                return trialViewRaw.replace(regex, function (match, id) { return replaceId(match, id); });
            }

        });
    };

    EditableTextElementPlayerViewModel.prototype.dispose = function () {
        this.playerText.dispose();
    };

    ko.components.register('editable-text-element-playerview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                return new EditableTextElementPlayerViewModel(dataModel);
            }
        },
        template: { element: 'editable-text-element-playerview-template' }
    });
}
