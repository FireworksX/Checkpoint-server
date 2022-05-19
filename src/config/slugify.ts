import slugifyRoot from 'slugify';

const OPTIONS = {
  replacement: '-',
  lower: true,
  strict: false,
  trim: true,
};

export const slugify = (text: string) => slugifyRoot(text, OPTIONS);
