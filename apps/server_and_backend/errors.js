class ArticleAlreadyPostedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ArticleAlreadyPostedError';
        // this.statusCode = 
    }
}

class InvalidURLError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidURLError';
    }
}

class NoArticleWithThisIDError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NoArticleWithThisIDError';
    }
}

class NoArticleWithThisUrlError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NoArticleWithThisUrlError';
    }
}

class ArticleAlreadyHasLinkPreviewError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NoArticleWithThisIDError';
    }
}

class FilePathIsNotAFileError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FilePathIsNotAFileError';
    }
}

class FileIsNotJsonExtensionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FileIsNotJsonExtensionError';
    }
}

class FileDatabaseContainsNonArticleObjectError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FileDatabaseContainsNonArticleObjectError';
    }
}

class NewArticlesArrayContainsNonArticleObjectError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NewArticlesArrayContainsNonArticleObjectError';
    }
}

class NotAnArrayError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotAnArrayError';
    }
}

class NotAnObjectError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotAnObjectError';
    }
}

class NotAnArticleObjectError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotAnArticleObjectError';
    }
}

class DoNotHavePostTimePropertyError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DoNotHavePostTimePropertyError';
    }
}

class InvalidDateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidDateError';
    }
}

class InvalidPathError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidPathError';
    }
}

class InvalidArticleIDError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidArticleIDError';
    }
}


class InvalidMongoUrlError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidMongoUrlError';
        this.statusCode = 404;
    }
}

class MongoCastError extends Error {
    constructor(errorsInfo) {
        super();
        this.name = 'MongoCastError';
        this.message = this.messageMongoError(errorsInfo);
    }
    
    messageMongoError (errorsInfo) {
        let messagesArray = [];
        errorsInfo.forEach(element => {
            const message = `Cast error at '${element.path}', expect '${element.expectedType}' type but received '${element.receivedType}' type ('${element.receivedValue}').`;
            messagesArray.push(message);
        });
        const errorMessage = messagesArray.join(' ');
        return errorMessage;
    }
}

class MongoValidatorError extends Error {
    constructor(errorsInfo) {
        super();
        this.name = 'MongoValidatorError';
        this.message = this.messageMongoError(errorsInfo);
    }
    
    messageMongoError (errorsInfo) {
        let messagesArray = [];
        errorsInfo.forEach(element => {
            const message = `Validator error at '${element.path}', element is '${element.reasonNonValid}' and received value is '${element.receivedValue}'.`;
            messagesArray.push(message);
        });
        const errorMessage = messagesArray.join(' ');
        return errorMessage;
    }
}


class NoUserOrArticleWithIDError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NoUserOrArticleWithIDError';
    }
}


export {
    ArticleAlreadyPostedError,
    InvalidURLError,
    NoArticleWithThisIDError,
    NoArticleWithThisUrlError,
    ArticleAlreadyHasLinkPreviewError,
    FilePathIsNotAFileError,
    FileIsNotJsonExtensionError,
    FileDatabaseContainsNonArticleObjectError,
    NewArticlesArrayContainsNonArticleObjectError,
    NotAnArrayError, 
    NotAnObjectError, 
    NotAnArticleObjectError,
    DoNotHavePostTimePropertyError,
    InvalidDateError,
    InvalidPathError, 
    InvalidArticleIDError,
    InvalidMongoUrlError, 
    MongoCastError,
    MongoValidatorError,
    NoUserOrArticleWithIDError,
}