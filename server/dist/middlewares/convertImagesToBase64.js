"use strict";
/*The convertImagesToBase64 middleware is designed to handle image conversion
for posts before the data is sent as a response to the client. Specifically,
it processes any cover_image fields in the post data, converting the image data
(stored as a binary buffer in the database) into a Base64-encoded string.
This conversion is necessary because binary data such as images cannot be directly
transmitted in JSON format and needs to be converted to a more web-friendly format
like Base64.*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../config/logger"));
const convertImagesToBase64 = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const modifyData = (item) => {
            if (item && item.cover_image) {
                if (Buffer.isBuffer(item.cover_image)) {
                    const base64String = item.cover_image.toString('base64');
                    return Object.assign(Object.assign({}, item), { cover_image: encodeURI(`data:image/jpeg;base64,${base64String}`) });
                }
            }
            return item;
        };
        if (res.locals.data) {
            if (Array.isArray(res.locals.data)) {
                res.locals.data = res.locals.data.map(modifyData);
            }
            else {
                res.locals.data = modifyData(res.locals.data);
            }
        }
        next();
    }
    catch (error) {
        logger_1.default.error('Error converting images to base64:', error);
        next(error);
    }
});
exports.default = convertImagesToBase64;
