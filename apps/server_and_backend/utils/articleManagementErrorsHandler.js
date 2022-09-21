function articleManagementErrorsHandler(e) {
    if (
        e.name === 'InvalidMongoUrlError' ||
        e.name === 'ArticleAlreadyPostedError' ||
        e.name === 'MongoCastError' ||
        e.name === 'MongoValidatorError' ||
        e.name === 'InvalidArticleIDError' ||
        e.name === 'MongoCastError' ||
        e.name === 'ArticleAlreadyHasLinkPreviewError' ||
        e.name === 'DomainNotInWhiteListError'
    ) {
        throw e;
    } else if (e.name !== '') {
        throw e;
    } else {
        throw e;
    }
}

export default articleManagementErrorsHandler;