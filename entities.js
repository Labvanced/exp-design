function entityFactory(entityJson, expData) {

    var entity;

    switch (entityJson.type) {
        case 'StartBlock':
            entity = new StartBlock(expData);
            entity.fromJS(entityJson);
            break;
        case 'EndBlock':
            entity = new EndBlock(expData);
            entity.fromJS(entityJson);
            break;
        case 'QuestionnaireEditorData':
            entity = new QuestionnaireEditorData(expData);
            entity.fromJS(entityJson);
            break;
        case 'Connection':
            entity = new Connection(expData);
            entity.fromJS(entityJson);
            break;
        case 'Sequence':
            entity = new Sequence(expData);
            entity.fromJS(entityJson);
            break;
        case 'TextEditorData':
            entity = new TextEditorData(expData);
            entity.fromJS(entityJson);
            break;
        case 'FrameData':
            entity = new FrameData(expData);
            entity.fromJS(entityJson);
            break;
        case 'SubjectGroup':
            entity = new SubjectGroup(expData);
            entity.fromJS(entityJson);
            break;
        case 'ExpSession':
            entity = new ExpSession(expData);
            entity.fromJS(entityJson);
            break;
        case 'ImageData':
            entity = new ImageData(expData);
            entity.fromJS(entityJson);
            break;
        case 'VideoData':
            entity = new VideoData(expData);
            entity.fromJS(entityJson);
            break;
        case 'ExpBlock':
            entity = new ExpBlock(expData);
            entity.fromJS(entityJson);
            break;
        case 'ExpTrialLoop':
            entity = new ExpTrialLoop(expData);
            entity.fromJS(entityJson);
            break;
        case 'GlobalVar':
            entity = new GlobalVar(expData);
            entity.fromJS(entityJson);
            break;
        case 'CheckBoxElement':
            var elem = new CheckBoxElement(expData);
            elem.fromJS(entityJson);
            entity = new QuestionnaireElement(expData);
            entity.id(entityJson.id);
            entity.name(entityJson.name);
            entity.addContent(elem);
            break;
        case 'MChoiceElement':
            var elem = new MChoiceElement(expData);
            elem.fromJS(entityJson);
            entity = new QuestionnaireElement(expData);
            entity.id(entityJson.id);
            entity.name(entityJson.name);
            entity.addContent(elem);
            break;
        case 'ParagraphElement':
            var elem = new ParagraphElement(expData);
            elem.fromJS(entityJson);
            entity = new QuestionnaireElement(expData);
            entity.id(entityJson.id);
            entity.name(entityJson.name);
            entity.addContent(elem);
            break;
        case 'RangeElement':
            var elem = new RangeElement(expData);
            elem.fromJS(entityJson);
            entity = new QuestionnaireElement(expData);
            entity.id(entityJson.id);
            entity.name(entityJson.name);
            entity.addContent(elem);
            break;
        case 'ScaleElement':
            var elem = new ScaleElement(expData);
            elem.fromJS(entityJson);
            entity = new QuestionnaireElement(expData);
            entity.id(entityJson.id);
            entity.name(entityJson.name);
            entity.addContent(elem);
            break;
        case 'TextElement':
            var elem = new TextElement(expData);
            elem.fromJS(entityJson);
            entity = new QuestionnaireElement(expData);
            entity.id(entityJson.id);
            entity.name(entityJson.name);
            entity.addContent(elem);
            break;
        case 'NewPageElement':
            entity = new NewPageElement(expData);
            entity.fromJS(entityJson);
            break;
        case 'htmlElementData':
            entity = new htmlElementData(expData);
            entity.fromJS(entityJson);
            break;
        case 'QuestionnaireElement':
            entity = new QuestionnaireElement(expData);
            entity.fromJS(entityJson);
            break;
        default:
            console.error("type " + entityJson.type + " is not defined in factory method.")
    }

    return entity;
}