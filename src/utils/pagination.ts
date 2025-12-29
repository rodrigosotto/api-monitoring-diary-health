export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export function calculatePagination(params: PaginationParams) {
  const { page, limit } = params;
  const skip = (page - 1) * limit;
  const take = limit;

  return { skip, take };
}

export function createPaginationMeta(
  params: PaginationParams,
  totalItems: number
): PaginationMeta {
  const { page, limit } = params;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    currentPage: page,
    itemsPerPage: limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  params: PaginationParams,
  totalItems: number
): PaginatedResponse<T> {
  return {
    data,
    meta: createPaginationMeta(params, totalItems),
  };
}
