const mimeTypes = {
  'image/png': 'images',
  'image/jpg': 'images',
  default: 'data',
};

export const convertMimeType = <T extends keyof typeof mimeTypes>(type: T): typeof mimeTypes[T] =>
  type in mimeTypes ? mimeTypes[type] : mimeTypes.default;
