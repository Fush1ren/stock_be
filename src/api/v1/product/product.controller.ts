import { Request, Response } from "express";
import { prismaClient } from "../../config";
import { getPage, responseAPI, responseAPIData, responseAPITable } from "../../utils";
import { QueryParams } from "../../dto";
import { validateToken } from "../auth/auth.controller";
import { BodyCreateProduct, BodyDeleteProductData, BodyUpdateProduct } from "../../../dto/product.dto";
import { parseSort } from "../../utils/data.util";

export const createProduct = async (req: Request, res: Response) => {
    try {
        const tokenHead = req.headers['authorization']?.split(' ')[1] as string;
        const user = await validateToken(tokenHead);
        if (!user) {
            responseAPI(res, {
                status: 401,
                message: 'Unauthorized',
            });
            return;
        }

        const body = req.body as BodyCreateProduct;

        if (!body) {
            responseAPI(res, {
                status: 400,
                message: 'No data provided',
            });
            return;
        }

        if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
            responseAPI(res, {
                status: 400,
                message: 'Name is required',
            });
            return;
        }

        if (!body.code || typeof body.code !== 'string' || body.code.trim() === '') {
            responseAPI(res, {
                status: 400,
                message: 'Code is required',
            });
            return;
        }

        if (!body.unitId || typeof body.unitId !== 'number') {
            responseAPI(res, {
                status: 400,
                message: 'Unit ID is required',
            });
            return;
        }

        if (!body.categoryId || typeof body.categoryId !== 'number') {
            responseAPI(res, {
                status: 400,
                message: 'Category ID is required',
            });
            return;
        }

        if (!body.brandId || typeof body.brandId !== 'number') {
            responseAPI(res, {
                status: 400,
                message: 'Brand ID is required',
            });
            return;
        }

        const existingProduct = await prismaClient.product.findUnique({
            where: {
                code: body.code.trim(),
            },
        });

        if (existingProduct) {
            responseAPI(res, {
                status: 400,
                message: 'Product with this code already exists',
            });
            return;
        }

        await prismaClient.product.create({
            data: {
                name: body.name.trim(),
                code: body.code.trim(),
                description: body.description ? body.description.trim() : null,
                category: {
                  connect: {
                    id: body.categoryId,
                  }
                },
                unit: {
                    connect: {
                        id: body.unitId,
                    }
                },
                brand: {
                    connect: {
                        id: body.brandId,
                    }
                },
                createdBy: { connect: { id: user.id } },
                updatedBy: { connect: { id: user.id } },
            }
        });
        responseAPI(res, {
            status: 201,
            message: "Product created successfully",
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const tokenHead = req.headers['authorization']?.split(' ')[1] as string;
        const user = await validateToken(tokenHead);
        if (!user) {
            responseAPI(res, {
                status: 401,
                message: 'Unauthorized',
            });
            return;
        }

        const id = Number(req.params.id);
        const body = req.body as BodyUpdateProduct;

        if (!body || !id) {
            responseAPI(res, {
                status: 400,
                message: 'No data provided',
            });
            return;
        }

        if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
            responseAPI(res, {
                status: 400,
                message: 'Name is required',
            });
            return;
        }
        
        const existingProduct = await prismaClient.product.findUnique({
            where: {
                id: id,
            },
        });

        if (!existingProduct) {
            responseAPI(res, {
                status: 404,
                message: 'Product not found',
            });
            return;
        }
        
        await prismaClient.product.update({
            where: {
                id: id,
            },
            data: {
                name: body.name.trim(),
                description: body.description,
                category: body.categoryId ? {
                    connect: {
                        id: body.categoryId,
                    }
                } : undefined,
                unit: body.unitId ? {
                    connect: {
                        id: body.unitId,
                    }
                } : undefined,
                brand: body.brandId ? {
                    connect: {
                        id: body.brandId,
                    }
                } : undefined,
                updatedBy: { connect: { id: user.id } },
            }
        });

        responseAPI(res, {
            status: 200,
            message: 'Product updated successfully',
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const body = req.body as BodyDeleteProductData;

        if (!body) {
            responseAPI(res, {
                status: 400,
                message: 'No data provided',
            });
            return;
        }

        if (!body.id || !Array.isArray(body.id) || body.id.length === 0) {
            responseAPI(res, {
                status: 400,
                message: 'Product IDs are required',
            });
            return;
        }

        const existingProducts = await prismaClient.product.findMany({
            where: {
                id: {
                    in: body.id,
                }
            }
        });

        if (existingProducts.length === 0) {
            responseAPI(res, {
                status: 404,
                message: 'No products found with the provided IDs',
            });
            return;
        }

        await prismaClient.product.deleteMany({
            where: {
                id: {
                    in: body.id,
                }
            }
        });
        responseAPI(res, {
            status: 200,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const queryParams = req.query as QueryParams;
    const search = queryParams.search?.toString().trim();

    let where: any = {};

    // Search (case-insensitive) di beberapa field dan relasi
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        { unit: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Filter merek (brand)
    if (queryParams.brand) {
      const brands = JSON.parse(queryParams.brand as string) as string[];
      if (Array.isArray(brands) && brands.length > 0) {
        where.brand = {
          name: {
            in: brands.map(b => b.trim()),
            mode: 'insensitive',
          }
        };
      }
    }

    // Filter kategori (category)
    if (queryParams.category) {
      const categories = JSON.parse(queryParams.category as string) as string[];
      if (Array.isArray(categories) && categories.length > 0) {
        where.category = {
          name: {
            in: categories.map(c => c.trim()),
            mode: 'insensitive',
          }
        };
      }
    }

    // Filter satuan (unit)
    if (queryParams.unit) {
      const units = JSON.parse(queryParams.unit as string) as string[];
      if (Array.isArray(units) && units.length > 0) {
        where.unit = {
          name: {
            in: units.map(u => u.trim()),
            mode: 'insensitive',
          }
        };
      }
    }

    // Filter createdAt
    if (queryParams.createdAt) {
      const createdAt = JSON.parse(queryParams.createdAt as string) as string[];
      where.createdAt = {};
      if (createdAt[0]) where.createdAt.gte = new Date(createdAt[0]);
      if (createdAt[1]) where.createdAt.lte = new Date(createdAt[1]);
    }

    // Filter updatedAt
    if (queryParams.updatedAt) {
      const updatedAt = JSON.parse(queryParams.updatedAt as string) as string[];
      where.updatedAt = {};
      if (updatedAt[0]) where.updatedAt.gte = new Date(updatedAt[0]);
      if (updatedAt[1]) where.updatedAt.lte = new Date(updatedAt[1]);
    }

    // Build query
    let queryTable: any = {
      where,
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        unit: {
          select: {
            id: true,
            name: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    };

    // Sorting
    const orderBy = parseSort({
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    });
    if (orderBy) {
      queryTable.orderBy = orderBy;
    }

    // Pagination
    if (queryParams.page || queryParams.limit) {
      const paramPage = queryParams.page ? Number(queryParams.page) : 1;
      const paramLimit = queryParams.limit ? Number(queryParams.limit) : 10;
      const page = getPage(paramPage, paramLimit);
      queryTable.skip = page.skip;
      queryTable.take = page.take;
    }

    // Fetch
    const products = await prismaClient.product.findMany(queryTable);
    const totalRecords = await prismaClient.product.count({ where });

    responseAPITable(res, {
      status: 200,
      message: "Products retrieved successfully",
      data: {
        totalRecords,
        data: products,
      },
    });
  } catch (error) {
    console.error(error);
    responseAPI(res, {
      status: 500,
      message: "Internal server error",
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            responseAPI(res, {
                status: 400,
                message: 'Product ID is required',
            });
            return;
        }

        const product = await prismaClient.product.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                unit: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                brand: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
            }
        });

        if (!product) {
            responseAPI(res, {
                status: 404,
                message: 'Product not found',
            });
            return;
        }

        responseAPIData(res, {
            status: 200,
            message: "Product retrieved successfully",
            data: product
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const getNextIndex = async (_req: Request, res: Response) => {
    try {
        const lastProduct = await prismaClient.product.findFirst({
            orderBy: {
                id: 'desc',
            },
            select: {
                id: true,
            },
        });

        const nextIndex = lastProduct ? lastProduct.id + 1 : 1;

        responseAPIData(res, {
            status: 200,
            message: "Next index retrieved successfully",
            data: { nextIndex },
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const getProductDropdown = async (_req: Request, res: Response) => {
    try {
        const products = await prismaClient.product.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        responseAPIData(res, {
            status: 200,
            message: "Products retrieved successfully",
            data: products,
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}