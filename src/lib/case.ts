// lib/case.ts
export function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => snakeToCamel(v));
  }

  if (obj !== null && obj.constructor === Object) {
    return Object.entries(obj).reduce((acc: any, [key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      acc[camelKey] = snakeToCamel(value);
      return acc;
    }, {});
  }

  return obj;
}
