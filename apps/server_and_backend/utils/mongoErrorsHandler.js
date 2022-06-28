import {
    ArticleAlreadyPostedError,
    MongoCastError,
    MongoValidatorError,
    InvalidArticleIDError,
    InvalidMongoUrlError
} from "../errors.js";


function mongoErrorsHandler(e) {
    // console.log('There is an error handled');
    // console.log(e);
    if (e.name === 'MongoParseError') {
        throw new InvalidMongoUrlError('Mongo url is invalid');
    } else if (e.name === 'MongoServerError') {
        if (e.code === 11000) {
            throw new ArticleAlreadyPostedError('Article already posted');
        }
    } else if (e.name === 'ValidationError') {
        const errorsArray = Object.keys(e.errors)
        let errorsInfo = [];
        errorsArray.forEach((item) => {
            if (e.errors[item].name === 'CastError') {
                const castError = {
                    path: e.errors[item].path,
                    expectedType: e.errors[item].kind,
                    receivedType: e.errors[item].valueType,
                    receivedValue: e.errors[item].value
                }
                errorsInfo.push(castError);
                throw new MongoCastError(errorsInfo);
            } else if (e.errors[item].name === 'ValidatorError') {
                const validatorError = {
                    path: e.errors[item].path,
                    reasonNonValid: e.errors[item].kind,
                    receivedValue: e.errors[item].value
                }
                errorsInfo.push(validatorError);
                throw new MongoValidatorError(errorsInfo);
            }
        })
    } else if (e.name === 'CastError') {
        if (e.path === '_id') {
            throw new InvalidArticleIDError(`Article ID is invalid. ${e.message}`)
        } else {
            handleCastError(e)
        }
    } else {
        throw e;
    }
}

function handleCastError(e) {
    const castError = [
        {
            path: e.path,
            expectedType: e.kind,
            receivedType: e.valueType,
            receivedValue: e.value
        }
    ]
    throw new MongoCastError(castError);
}

export default mongoErrorsHandler;