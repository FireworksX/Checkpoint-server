import { Schema } from 'mongoose';
import { slugify } from '@config/slugify';

export type GenerateSlugBySchema = { generateSlug(text: string): Promise<string> };

export const generateSlugBySchema = <T extends Schema>(schema: T): void => {
  schema.static('generateSlug', async function (text: string) {
    let generatedSlug = slugify(text);
    const count = await this.count({ slug: new RegExp(`${generatedSlug}|${generatedSlug}-`) });

    if (count > 0) {
      generatedSlug = `${generatedSlug}-${count + 1}`;
    }

    return generatedSlug;
  });
};
