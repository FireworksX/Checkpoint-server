export function omit<T extends Record<any, any>, P extends string[]>(obj: T, ...props: P): Omit<T, P[number]> {
  const result = { ...obj };

  props.forEach((prop) => {
    delete result[prop];
  });

  return result;
}
