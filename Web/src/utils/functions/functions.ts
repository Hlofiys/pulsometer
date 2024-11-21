export const hasAllValuesForKeys = (
  obj: { [key: string]: any },
  keys: string[]
): boolean => {
  for (let key of keys) {
    if (obj.hasOwnProperty(key)) {
      if (
        obj[key] === "" ||
        obj[key] === null ||
        obj[key] === undefined ||
        obj[key] === 0
      ) {
        return false;
      }
    }
  }
  return true;
};
