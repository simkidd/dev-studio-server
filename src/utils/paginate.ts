import { Model, PopulateOptions } from "mongoose";

export interface PaginationResult<T> {
  docs: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface PaginateOptions {
  page?: string | number;
  limit?: string | number;
  sort?: any;
  populate?: string | PopulateOptions | (string | PopulateOptions)[];
  select?: string | Record<string, number>;
}

export async function paginate<T>(
  model: Model<T>,
  filter: Record<string, any> = {},
  options: PaginateOptions = {},
): Promise<PaginationResult<T>> {
  const isAll = options.limit === 0 || options.limit === "all" || options.limit === "0";
  const page = Math.max(1, parseInt(String(options.page || 1), 10));
  const limit = isAll ? 0 : Math.max(1, parseInt(String(options.limit || 50), 10));
  const skip = isAll ? 0 : (page - 1) * limit;

  const query = model.find(filter);

  if (!isAll) {
    query.skip(skip).limit(limit);
  }

  if (options.sort) {
    query.sort(options.sort);
  } else {
    query.sort({ createdAt: -1 });
  }

  if (options.populate) {
    query.populate(options.populate as any);
  }

  if (options.select) {
    query.select(options.select);
  }

  const [docs, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter),
  ]);

  return {
    docs,
    total,
    page,
    limit: isAll ? total : limit,
    pages: isAll ? 1 : Math.ceil(total / limit) || 1,
  };
}
