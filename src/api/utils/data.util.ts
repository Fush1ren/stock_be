import { Prisma } from "@prisma/client";
import { IQuery, ISortParams } from "../types/data.type";

export const getPage = (page: number, limit: number): IQuery => {
    const skip = (page * limit) - limit;
    const take = limit;
    return {
        take,
        skip
    }
}

export function parseSort({
  sortBy,
  sortOrder
}: ISortParams): Prisma.UserFindManyArgs['orderBy'] | undefined {
  if (!sortBy) return undefined

  const sortOrderValue = Number(sortOrder ?? 1) // Default ascending (1)
  const direction: 'asc' | 'desc' = sortOrderValue === -1 ? 'desc' : 'asc'

  if (sortBy.includes('.')) {
    const [relation, field] = sortBy.split('.')
    return {
      [relation]: {
        [field]: direction
      }
    } as Prisma.UserFindManyArgs['orderBy']
  }

  return {
    [sortBy]: direction
  } as Prisma.UserFindManyArgs['orderBy']
}