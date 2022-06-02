import { PopulateOptions, Schema } from 'mongoose';

export type PopulateBySchema = { populateTransform(fields: PopulateOptions[]): Promise<string> };

export const populateBySchema = <T extends Schema>(schema: T): void => {
  schema.method('populateTransform', async function (fields: PopulateOptions[]) {
    const filedPromises = await Promise.all(fields.map((field) => this.populate(field)));

    if (this.transform) {
      return this.transform(filedPromises);
    }

    return filedPromises;
  });
};
