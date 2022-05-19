import multer from 'multer';
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import { convertMimeType } from '@server/utils/convertMediaType';

export const TEMP_DIR = 'uploads'

export const mediaUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, file, callback) => {
      const type = convertMimeType(file.mimetype as 'default')
      const fullPath = path.resolve(TEMP_DIR, type);

      if (!fs.existsSync(path.resolve(TEMP_DIR))) {
        fs.mkdirSync(path.resolve(TEMP_DIR));
      }

      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath);
      }

      callback(null, fullPath);
    },
    filename: (_req, file, callback) => {
      //originalname is the uploaded file's name with extn
      callback(null, `${dayjs().unix()}_${file.originalname}`);
    },
  }),
});
