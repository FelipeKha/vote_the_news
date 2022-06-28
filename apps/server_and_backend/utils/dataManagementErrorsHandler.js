function dataManagementErrorsHandler(e) {
    if (
        e.name === 'InvalidMongoUrlError' ||
        e.name === 'ArticleAlreadyPostedError' ||
        e.name === 'MongoCastError' ||
        e.name === 'MongoValidatorError' ||
        e.name === 'InvalidArticleIDError' ||
        e.name === 'MongoCastError' ||
        e.name === 'ArticleAlreadyHasLinkPreviewError'
    ) {
        throw e;
    } else if (e.name !== '') {
        throw e;
    } else {
        throw e;
    }
}

export default dataManagementErrorsHandler;