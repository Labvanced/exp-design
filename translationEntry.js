/**
 * Created by kstandvoss on 12.07.17.
 */


var TranslationEntry = function (expData) {
    var self = this;

    this.expData = expData;
    this.namedEntity = null;
    this.dirty = false;

    this.languages = ko.observableArray([]);
};

TranslationEntry.prototype.init = function (namedEntity) {
    this.namedEntity = namedEntity;
};

TranslationEntry.prototype.addTranslation = function (translation) {
    this.languages.push(translation);
};

TranslationEntry.prototype.setPointers = function (entitiesArr) {
    this.namedEntity = entitiesArr.byId[this.namedEntity];
};

TranslationEntry.prototype.toJS = function () {
    return {
        namedEntity: this.namedEntity.id(),
        dirty: this.dirty,
        languages: jQuery.map(this.languages(), function (elem) {
            return [elem()]; // use array so that null values are not removed
        })
    };
};

TranslationEntry.prototype.fromJS = function (data) {
    this.namedEntity = data.namedEntity;
    this.dirty = data.dirty;
    this.languages(jQuery.map(data.languages, function (elem) {
        return ko.observable(elem);
    }));
};