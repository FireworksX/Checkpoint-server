import httpStatus from 'http-status';
import { AppRequestBody, AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { MediaFileModel, TransformMediaFile } from '@server/models/mediaFile.model';
import { convertMimeType } from '@server/utils/convertMediaType';
import path from 'path';
import { TEMP_DIR } from '@server/middleware/mediaUpload.middleware';
import fs from 'fs'

export default {
  upload: async (req, res: AppResponse<TransformMediaFile>, next) => {
    try {
      const { mimetype, filename, size } = req.file;
      const userId = req.user._id;
      const type = convertMimeType(req.file.mimetype as 'default');
      const fullPath = path.resolve(TEMP_DIR, type);

      const newMediaFile = await (
        await new MediaFileModel({
          fileName: filename,
          mimetype,
          size,
          author: userId,
          path: fullPath,
        }).save()
      ).transform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newMediaFile));
    } catch (e) {
      return next(e);
    }
  },

  delete: async (req: AppRequestBody<{ id: string }>, res: AppResponse<any>, next) => {
    try {
      const { id } = req.body;
      // TODO Add user validation for block remove from other users
      const removeResult = await MediaFileModel.delete({ _id: id });

      if (removeResult) {
        fs.unlinkSync(`${removeResult.path}/${removeResult.fileName}`)
      }

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(removeResult));
    } catch (e) {
      return next(e);
    }
  },
};
