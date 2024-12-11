"use strict";
/*The convertImagesToBase64 middleware is designed to handle image conversion
for posts before the data is sent as a response to the client. Specifically,
it processes any cover_image fields in the post data, converting the image data
(stored as a binary buffer in the database) into a Base64-encoded string.
This conversion is necessary because binary data such as images cannot be directly
transmitted in JSON format and needs to be converted to a more web-friendly format
like Base64.*/
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("buffer");
// Helper function to recursively convert cover_image fields in objects or arrays
const convertCoverImageToBase64 = (data) => {
    if (Array.isArray(data)) {
        return data.map(item => convertCoverImageToBase64(item));
    }
    else if (typeof data === 'object' && data !== null) {
        const newData = Object.assign({}, data);
        // Check if the object contains a cover_image field
        if (newData.cover_image && buffer_1.Buffer.isBuffer(newData.cover_image)) {
            newData.cover_image = newData.cover_image.toString('base64');
        }
        // Recursively process all properties
        for (const key in newData) {
            if (newData.hasOwnProperty(key)) {
                if (newData[key] instanceof Date) {
                    // Leave Date objects unchanged
                    newData[key] = newData[key];
                }
                else {
                    // Recursively convert other object properties (including nested ones)
                    newData[key] = convertCoverImageToBase64(newData[key]);
                }
            }
        }
        return newData;
    }
    // Return non-object data (string, number, etc.) unchanged
    return data;
};
const convertImagesToBase64 = (req, res, next) => {
    const originalJson = res.json;
    // Overriding res.json
    res.json = function (data) {
        // Recursively convert all cover_image fields in the response data
        const transformedData = convertCoverImageToBase64(data);
        // Calling the original res.json function with transformed data
        return originalJson.call(this, transformedData);
    };
    next(); // Passing control to the next middleware
};
exports.default = convertImagesToBase64;
