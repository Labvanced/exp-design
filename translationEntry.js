/**
 * Created by kstandvoss on 12.07.17.
 */


var TranslationEntry = function (expData) {
    var self = this;

    this.expData = expData;
    this.namedEntity = null;
    //this.editableText = null;
    this.dirty = false;

    this.languages = [];

};

TranslationEntry.prototype.init = function (namedEntity, editableText) {
    this.namedEntity = namedEntity;
    //this.editableText = editableText;
};

TranslationEntry.prototype.addTranslation = function (translation) {
    this.languages.push(translation);
};


TranslationEntry.prototype.toJS = function () {
    return {
        namedEntity: this.namedEntity.toJS(),
        //editableText: this.editableText.toJS(),
        dirty: this.dirty,
        languages: jQuery.map(this.languages, function (elem) {
            return elem();
        })
    };
};

TranslationEntry.prototype.fromJS = function (data) {

    if(data.namedEntity.type === 'FrameElement'){
        this.namedEntity = new FrameElement(this.expData);
        this.namedEntity.fromJS(data.namedEntity);
    }
    if(data.namedEntity.type === 'PageElement'){
        this.namedEntity = new PageElement(this.expData);
        this.namedEntity.fromJS(data.namedEntity);
    }

    //this.editableText = data.editableText;
    this.dirty = data.dirty;
    this.languages = jQuery.map(data.languages, function (elem) {
        return ko.observable(elem);
    });
};