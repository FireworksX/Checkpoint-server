import { PopulateOptions, Schema } from 'mongoose';

export type PopulateBySchema = { populateFields(fields: PopulateOptions[]): Promise<string> };

export const populateBySchema = <T extends Schema>(schema: T): void => {
  schema.method('populateFields', async function (fields: PopulateOptions[]) {
    const filedPromises = await Promise.all(fields.map((field) => this.populate(field)));

    if (this.transform) {
      return this.transform(filedPromises);
    }

    return filedPromises;
  });
};
