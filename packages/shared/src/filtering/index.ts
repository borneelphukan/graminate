import { z, ZodObject, ZodType, type ZodRawShape } from "zod";

export function withFilters<F extends ZodRawShape, T extends ZodRawShape>(
  filters: ZodObject<F>,
  schema: ZodObject<T>
) {
  const properties = filters.keyof();

  const where = createWhereFilter(filters);
  const sort = z.object({
    id: properties,
    direction: z.enum(["asc", "desc"]),
  });

  const filteredSchema = z.object({
    where: where.partial().optional(),
    sort: z.union([sort, z.array(sort)]).optional(),
    limit: z.number().optional(),
    page: z.number().optional(),
  });

  return schema.extend(filteredSchema.shape);
}

// TODO: improve these based on the type of the property
function createWhereFilterValue<T extends ZodType>(valueType: T) {
  return z.object({
    equals: valueType.optional(),
    not_equals: valueType.optional(),
    greater_than: z.number().optional(),
    greater_than_equal: z.number().optional(),
    less_than: z.number().optional(),
    less_than_equal: z.number().optional(),
    like: z.string().optional(),
    contains: z.string().optional(),
    in: z.string().optional(),
    not_in: z.string().optional(),
    all: z.string().optional(),
    exists: z.boolean().optional(),
    near: z.any().optional(),
    within: z.any().optional(),
    intersect: z.any().optional(),
  });
}

type ShapeFrom<F extends ZodRawShape> = {
  [K in keyof F]: ReturnType<typeof createWhereFilterValue<F[K] & ZodType>>;
};
// not proud of this code, but it works
export function createWhereFilter<F extends ZodRawShape>(
  filters: ZodObject<F>
) {
  const shape = Object.keys(filters.shape).reduce((acc, key) => {
    const k = key as keyof F;
    acc[k] = createWhereFilterValue(
      filters.shape[k] as unknown as ZodType
    ) as ShapeFrom<F>[typeof k];
    return acc;
  }, {} as ShapeFrom<F>);

  return z.object(shape).partial().strict();
}
