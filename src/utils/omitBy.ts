export function omitBy<T extends Record<any, any>>(inputObj: T, predictor: (value) => boolean): T {
  return Object.keys(inputObj)
    .filter((key) => predictor(inputObj[key]))
    .reduce((acc, key) => {
      acc[key] = inputObj[key];
      return acc;
    }, {}) as T;
}
