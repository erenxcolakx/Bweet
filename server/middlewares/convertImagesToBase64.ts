/*The convertImagesToBase64 middleware is designed to handle image conversion
for posts before the data is sent as a response to the client. Specifically,
it processes any cover_image fields in the post data, converting the image data
(stored as a binary buffer in the database) into a Base64-encoded string.
This conversion is necessary because binary data such as images cannot be directly
transmitted in JSON format and needs to be converted to a more web-friendly format
like Base64.*/

import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

const convertImagesToBase64 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const modifyData = (item: any) => {
      if (item && item.cover_image) {
        if (Buffer.isBuffer(item.cover_image)) {
          const base64String = item.cover_image.toString('base64');
          return {
            ...item,
            cover_image: encodeURI(`data:image/jpeg;base64,${base64String}`)
          };
        }
      }
      return item;
    };

    if (res.locals.data) {
      if (Array.isArray(res.locals.data)) {
        res.locals.data = res.locals.data.map(modifyData);
      } else {
        res.locals.data = modifyData(res.locals.data);
      }
    }
    next();
  } catch (error) {
    logger.error('Error converting images to base64:', error);
    next(error);
  }
};

export default convertImagesToBase64;