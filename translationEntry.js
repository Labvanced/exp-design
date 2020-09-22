var TranslationEntry = function (expData) {
    var self = this;

    this.expData = expData;
    this.namedEntity = null;

    this.languages = ko.observableArray([]);
};

TranslationEntry.prototype.init = function (namedEntity) {
    this.namedEntity = namedEntity;
};

TranslationEntry.prototype.addTranslation = function (translation) {
    this.languages.push(translation);
};

TranslationEntry.prototype.setPointers = function (entitiesArr) {
    if (this.namedEntity) {
        this.namedEntity = entitiesArr.byId[this.namedEntity];
    }
};

TranslationEntry.prototype.toJS = function () {
    return {
        namedEntity: this.namedEntity ? this.namedEntity.id() : null,
        languages: jQuery.map(this.languages(), function (elem) {
            return [elem()]; // use array so that null values are not removed
        })
    };
};

TranslationEntry.prototype.fromJS = function (data) {
    this.namedEntity = data.namedEntity;
    var purify_config = { ADD_TAGS: ['vars'], ADD_ATTR: ['globvarid'] };
    this.languages(jQuery.map(data.languages, function (elem) {
        var clean = DOMPurify.sanitize(elem, purify_config);
        return ko.observable(clean);
    }));
};