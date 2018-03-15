
var EditableTextElement = function(expData, parent, text) {
    var self = this;
    this.expData = expData;
    this.parent = parent;

    //serialized
    this.type = "EditableTextElement";
    this.rawText = ko.observable(text);// for example: '<span>Your score: <variable varid="239da92acb23"></span>'
    this.globalVars = [];
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
EditableTextElement.prototype.dataType =  ["string"];


EditableTextElement.prototype.reLinkVar = function(oldVar,newVar) {
    var oldVarId = oldVar.id();
    var newVarId = newVar.id();
    var oldVarName = oldVar.name();
    var newVarName = newVar.name();
    var replStrin1= oldVarId+'">'+oldVarName;
    var replStrin2= oldVarId+'">null';
    var newString = newVarId+'">'+newVarName;

    this.rawText(this.rawText().replace(replStrin1,newString));
    this.rawText(this.rawText().replace(replStrin2,newString));
};


EditableTextElement.prototype.init = function() {
    if (this.expData.translationsEnabled()) {
        this.markTranslatable();
    }
};

EditableTextElement.prototype.getAllModifiers = function(modifiersArr) {
    modifiersArr.push(this.modifier());
};

EditableTextElement.prototype.markTranslatable = function () {
    var text = this.rawText();

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
        this.rawText(translationIdx);
    }
};

EditableTextElement.prototype.setText = function (text) {
    this.rawText(text);
};

EditableTextElement.prototype.addVar = function (globalVarId) {
    this.globalVars.push(globalVarId);
    this.globalVarIds.push(globalVarId);
    this.setVariableBackRef(globalVarId);
};

EditableTextElement.prototype.removeVar = function (varId) {
    var index =this.globalVars.indexOf(varId);
    if(index>=0){
        this.globalVars.splice(index,1);
        this.globalVarIds.splice(index,1);
    }
    this.removeRefbyId(varId);

};

EditableTextElement.prototype.setVariableBackRef = function(globalVarId){
    var entity = this.expData.entities.byId[globalVarId];
    if(entity) {
        var ref = entity.addBackRef(this, this.parent.parent, false, true, 'withinText');
        this.globalVarRefs[globalVarId] = ref;
    }
};


EditableTextElement.prototype.removeBackRefs = function () {
    for(var id in this.globalVarRefs){
        if(this.globalVarRefs.hasOwnProperty(id)){
            var entity = this.expData.entities.byId[id];
            if (entity){
                entity.removeBackRef(this.globalVarRefs[id]);
            }
        }
    }
    this.globalVars = [];
    this.globalVarIds([]);
    this.globalVarRefs = {};
};

EditableTextElement.prototype.removeRefbyId = function (varId) {

    if(this.globalVarRefs.hasOwnProperty(varId)){
        var entity = this.expData.entities.byId[varId];
        if (entity) {
            entity.removeBackRef(this.globalVarRefs[varId]);
        }
        delete this.globalVarRefs[varId];
    }

};



EditableTextElement.prototype.setPointers = function(entitiesArr) {
    for(var k=0; k<this.globalVars.length; k++){
        this.setVariableBackRef(this.globalVars[k]);
    }
    this.modifier().setPointers(entitiesArr);
};

EditableTextElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

EditableTextElement.prototype.selectTrialType = function(selectionSpec) {
    this.isEditingText(false); // This line is important! Otherwise, bug resets text when clicking on DefaultTrial!
    this.modifier().selectTrialType(selectionSpec);
};

EditableTextElement.prototype.getTextRefs = function(textArr, label){
    if(this.modifier().ndimModifierTrialTypes.length ==0){
        textArr.push([label, this.rawText, this]);
    }
    else{
        var flattend = this.modifier().getFlattendArray();
        for(var k=0; k<flattend.length; k++){
            if(flattend[k].modifiedProp.rawText) {
                textArr.push([label, flattend[k].modifiedProp.rawText, this]);
            }
            else {
                textArr.push([label, this.rawText, this]);
            }
        }
    }
    return textArr;
};

EditableTextElement.prototype.toJS = function() {
    return {
        type: this.type,
        rawText: this.rawText(),
        modifier: this.modifier().toJS(),
        globalVars: this.globalVars,
        globalVarIds: this.globalVarIds()
    };
};

EditableTextElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.rawText(data.rawText);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
    this.globalVars = data.globalVars;

    if (data.hasOwnProperty('globalVarIds')){
        this.globalVarIds(data.globalVarIds);
    }

};

EditableTextElement.prototype.dispose = function () {
    if(typeof this.rawText() === 'number'){
        this.expData.translations.splice(this.rawText(),1);
        this.rawText('');
    }
    this.removeBackRefs();
};

function createEditableTextComponents() {
    ko.components.register('editable-text-element-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = dataModel;
                    this.expData = dataModel.expData;

                    //regex to parse variable id
                    var regex = /<vars.*?globvarid="([^"]*)">.*?<\/vars>/g;


                    this.text = ko.pureComputed({

                        read: function () {
                            if(typeof self.dataModel.modifier().selectedTrialView.rawText() == 'number'){
                                var rawText = self.expData.translations()[self.dataModel.modifier().selectedTrialView.rawText()].languages()[self.expData.currentLanguage()]();
                                if (rawText==null) {
                                    rawText = self.expData.translations()[self.dataModel.modifier().selectedTrialView.rawText()].languages()[0]();
                                }
                                return rawText;
                            }
                            else{
                                return self.dataModel.modifier().selectedTrialView.rawText();
                            }
                        },

                        write: function (value) {
                            var match;
                            var ids = [];
                            //parse varids
                            while(match = regex.exec(value)){
                                if(match[1] !== "undefined"){
                                    ids.push(match[1]);
                                }
                            }

                            var difference = self.dataModel.globalVarIds().filter(function(n) {
                                return ids.indexOf(n) === -1;
                            });
                            // remove variable references
                            difference.forEach(function (elem) {
                              self.dataModel.removeVar(elem);
                            });

                            // add variable references
                            for(var i=0; i<ids.length; i++){
                                if(!(ids[i] in self.dataModel.globalVarRefs)) {
                                    self.dataModel.addVar(ids[i]);
                                }
                            }
                            if(typeof self.dataModel.modifier().selectedTrialView.rawText() == 'number'){
                                self.expData.translations()[self.dataModel.modifier().selectedTrialView.rawText()].languages()[self.expData.currentLanguage()](value);
                            }
                            else{
                                self.dataModel.modifier().selectedTrialView.rawText(value);
                            }
                        },
                        owner: self
                    });


                    //function to replace globalvar in rawText
                    var replaceId = function (_match, id){
                        if(id=='undefined') {
                            return id;
                        }
                        var entity = self.expData.entities.byId[id];
                        if(!entity){
                            return id;
                        }
                        else{
                            if (entity.startValue() instanceof GlobalVarValueDatetime){
                                if (entity.startValue().value()){
                                    return entity.startValue().value().toISOString().substring(0,10);
                                }
                                else{
                                    return ''
                                }

                            }
                            else if(entity.startValue() instanceof GlobalVarValueTime || entity.startValue() instanceof GlobalVarValueCategorical){
                                return entity.startValue().value().toString();
                            }
                            else{
                                return entity.startValue().toString();
                            }
                        }
                    };

                    this.previewText = ko.computed(function() {
                        return self.text().replace(regex, function(match, id){return replaceId(match, id);});
                    });


                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'editable-text-element-preview-template'}
    });


    ko.components.register('editable-text-element-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = dataModel;
                    this.expData = dataModel.expData;

                    //regex to parse variable id
                    var regex = /<vars.*?globvarid="([^"]*)">.*?<\/vars>/g;

                    //function to replace globalvar in rawText
                    var replaceId = function (_match, id){
                        if(id=='undefined') {
                            return id;
                        }
                        var entity = self.expData.entities.byId[id];
                        if(!entity){
                            return id;
                        }
                        else {
                            if (entity.value() instanceof GlobalVarValueDatetime){
                                if (entity.value().value()!= null){
                                    return entity.value().value().toISOString().substring(0,10);
                                }
                                else{
                                    return null
                                }

                            }
                            else if(entity.value() instanceof GlobalVarValueTime || entity.value() instanceof GlobalVarValueCategorical){
                                if (entity.value().value()!= null){
                                    return entity.value().value().toString();
                                }
                                else{
                                    return null
                                }

                            }
                            else{
                                return entity.value().toString();
                            }


                        }
                    };

                    this.playerText = ko.computed(function() {
                        if(typeof self.dataModel.modifier().selectedTrialView.rawText() == 'number'){
                            var rawText = self.expData.translations()[self.dataModel.modifier().selectedTrialView.rawText()].languages()[self.expData.currentLanguage()]();
                            if (rawText==null) {
                                rawText = self.expData.translations()[self.dataModel.modifier().selectedTrialView.rawText()].languages()[0]();
                            }
                            return rawText.replace(regex, function(match, id){return replaceId(match, id);});
                        }
                        else{
                            return self.dataModel.modifier().selectedTrialView.rawText().replace(regex, function(match, id){return replaceId(match, id);});
                        }

                    });
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'editable-text-element-playerview-template'}
    });
}
