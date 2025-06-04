import { Request, Response } from "express";
import { createClient } from '@supabase/supabase-js';
import { BodyCreateUser } from "../../../dto";
import { getPage, responseAPI, responseAPIData, responseAPITable } from "../../utils";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { validateToken } from "../auth/auth.controller";
import bcrypt from 'bcryptjs'
import config from "../../../config";
import { BodyUpdateProfile, BodyUpdateUser } from "../../../dto/user.dto";
import { parseSort } from "../../utils/data.util";

const supabaseStorage = createClient(config.bucketUrl, config.bucketKey);
const bucketName = config.bucketName;

const uploadToSupabaseStorage = async (file: Express.Multer.File, username: string): Promise<string | undefined> => {
    try {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${username}-${Date.now()}.${fileExt}`;

        const { error } = await supabaseStorage.storage.from(bucketName).upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });

        if (error) {
            console.error('Error uploading file:', error);
        }

        return supabaseStorage.storage.from(bucketName).getPublicUrl(fileName).data.publicUrl;
    } catch (error) {
        console.error('Error uploading file to Supabase Storage:', error);
    }
}

const deleteFromSupabaseStorage = async (avatarUrl: string): Promise<void> => {
    try {
       const publicPrefix = '/storage/v1/object/public/';
        const startIndex = avatarUrl.indexOf(publicPrefix);
        if (startIndex === -1) return;

        // Ambil path relatif terhadap bucket
        const fullPath = avatarUrl.substring(startIndex + publicPrefix.length); 
        const bucket = fullPath.split('/')[0]; // Misal: 'avatars'
        const filePath = fullPath.split('/').slice(1).join('/'); // Misal: 'user123/avatar.jpg'

        await supabaseStorage.storage.from(bucket).remove([filePath]);
    } catch (error) {
        console.error('Error deleting file from Supabase Storage:', error);
    }
}

export const createUser = async (req: Request, res: Response) => {
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
        const body = req.body as BodyCreateUser;
        if (!body) {
            responseAPI(res, {status: 400, message: "No data provided"});
        };

        if (!body.username) {
            responseAPI(res, {
                status: 400,
                message: 'Username is required!',
            });
        }

        if (!body.password) {
            responseAPI(res, {
                status: 400,
                message: 'Password is required!',
            });
        }

        if (!body.email) {
            responseAPI(res, {
                status: 400,
                message: 'Email is required!',
            });
        }

        if (!body.name) {
            responseAPI(res, {
                status: 400,
                message: 'Name is required!',
            });
        }

        if (!body.role) {
            responseAPI(res, {
                status: 400,
                message: 'Role is required!',
            });
        }

        const existingUser = await prismaClient.user.findUnique({
            where: {
                username: body.username,
            },
        });

        if (existingUser) {
            return responseAPI(res, {
                status: 400,
                message: 'Username already exists!',
            });
        }

        const existingEmail = await prismaClient.user.findUnique({
            where: {
                email: body.email,
            },
        });
        
        if (existingEmail) {
            return responseAPI(res, {
                status: 400,
                message: 'Email already exists!',
            });
        }

        let avatarUrl: string | undefined = undefined;
        if (req.file) {
            avatarUrl = await uploadToSupabaseStorage(req.file, body.username);
        }

        // const imageBuffer = req.file ? req.file.buffer : null;

        const hashed = await bcrypt.hash(body.password, 10)

        await prismaClient.user.create({
            data: {
                name: body.name,
                username: body.username,
                email: body.email,
                password: hashed,
                photo: avatarUrl || null,
                refreshToken: null,
                createdBy: {
                    connect: {
                        id: user.id,
                    }
                },
                updatedBy: {
                    connect: {
                        id: user.id,
                    }
                },
                roles: {
                    connect: {
                        id: Number(body.role),
                    },
                }
            }
        })
        
        responseAPI(res, {
            status: 200,
            message: 'User created successfully',
        })
    } catch (error) {
        res.status(403);
    }
}

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const queryParams = req.query as QueryParams;
    const search = queryParams.search?.toString().trim();
    const roles = queryParams.role ? JSON.parse(queryParams.role as string) as string[] : undefined;
    let where: any = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          username: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          roles: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (Array.isArray(roles) && roles.length > 0) {
      where.roles = {
        name: {
          in: roles.map(r => r.trim()),
          mode: 'insensitive',
        },
      };
    }

    if (queryParams.createdAt) {
      const createdAt = JSON.parse(queryParams.createdAt as string) as string[];
      where.createdAt = {};
      if (createdAt[0]) where.createdAt.gte = new Date(createdAt[0]);
      if (createdAt[1]) where.createdAt.lte = new Date(createdAt[1]);
    }

    if (queryParams.updatedAt) {
      const updatedAt = JSON.parse(queryParams.updatedAt as string) as string[];
      where.updatedAt = {};
      if (updatedAt[0]) where.updatedAt.gte = new Date(updatedAt[0]);
      if (updatedAt[1]) where.updatedAt.lte = new Date(updatedAt[1]);
    }

    let queryTable: any = {
      where,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    };

    const orderBy = parseSort({
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    });

    if (orderBy) {
      queryTable.orderBy = orderBy;
    }

    if (queryParams.page || queryParams.limit) {
      const paramPage = queryParams.page ? Number(queryParams.page) : 1;
      const paramLimit = queryParams.limit ? Number(queryParams.limit) : 10;
      const page = getPage(paramPage, paramLimit);
      queryTable.skip = page.skip;
      queryTable.take = page.take;
    }

    const users = await prismaClient.user.findMany(queryTable);
    const totalRecords = await prismaClient.user.count({ where });

    responseAPITable(res, {
      status: 200,
      message: 'Get all user successfully',
      data: {
        totalRecords,
        data: users,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getUserById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return responseAPI(res, {
                status: 400,
                message: 'User ID is required',
            });
        }

        const user = await prismaClient.user.findUnique({
            where: { id: id },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                photo: true,
                createdAt: true,
                updatedAt: true,
                roles: {
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
                }
            }
        });

        if (!user) {
            return responseAPI(res, {
                status: 404,
                message: 'User not found',
            });
        }

        responseAPIData(res, {
            status: 200,
            message: 'User retrieved successfully',
            data: user,
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const tokenHead = req.headers['authorization']?.split(' ')[1] as string;
        const userUpdated = await validateToken(tokenHead);
        if (!userUpdated) {
            responseAPI(res, {
                status: 401,
                message: 'Unauthorized',
            });
            return;
        }
        const id = Number(req.params.id);
        const body = req.body as BodyUpdateUser;
        if (!body) {
            responseAPI(res, {status: 400, message: "No data provided"});
        };

        if (!id) {
            return responseAPI(res, {
                status: 400,
                message: 'User ID is required',
            });
        }

        if (!body.name) {
            return responseAPI(res, {
                status: 400,
                message: 'Name is required',
            });
        }

        if (!body.username) {
            return responseAPI(res, {
                status: 400,
                message: 'Username is required',
            });
        }

        if (!body.email) {
            return responseAPI(res, {
                status: 400,
                message: 'Email is required',
            });
        }

        if (!body.role) {
            return responseAPI(res, {
                status: 400,
                message: 'Role is required',
            });
        }

        const existingUser = await prismaClient.user.findUnique({
            where: { id: id },
        });

        if (!existingUser) {
            return responseAPI(res, {
                status: 404,
                message: 'User not found',
            });
        }

        if (body.password) {
            const hashed = await bcrypt.hash(body.password, 10)
            body.password = hashed;
        } else {
            if (!existingUser) {
                return responseAPI(res, {
                    status: 404,
                    message: 'User not found',
                });
            }
            body.password = existingUser.password; // Keep the existing password if not provided
        }

        let avatarUrl: string | undefined = undefined;
        if (req.file) {
            if (existingUser.photo) {
                await deleteFromSupabaseStorage(existingUser.photo);
            }
            avatarUrl = await uploadToSupabaseStorage(req.file, existingUser.username);
        }


        await prismaClient.user.update({
            where: { id: Number(id) },
            data: {
                name: body.name,
                username: body.username,
                email: body.email,
                password: body.password,
                photo: avatarUrl || existingUser.photo, // Keep the existing photo if not updated
                updatedBy: {
                    connect: {
                        id: userUpdated.id,
                    }
                },
                roles: {
                    connect: {
                        id: Number(body.role),
                    },
                }
            },
        })
        
        responseAPI(res, {
            status: 200,
            message: 'User updated successfully',
        })
    } catch (error) {
        res.status(403);
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const body = req.body as { id: string[] };

        if (!body || !body.id || body.id.length === 0) {
            return responseAPI(res, {
                status: 400,
                message: 'No user ID provided',
            });
        }

        const userIds = body.id.map(id => Number(id));
        const users = await prismaClient.user.findMany({
            where: {
                id: {
                    in: userIds,
                },
            },
            select: {
                id: true,
                photo: true, // Include photo field to handle deletion if needed
            },
        });

        if (users.length === 0) {
            return responseAPI(res, {
                status: 404,
                message: 'No users found with the provided IDs',
            });
        }

        await Promise.all(
            users.map(async user => {
                if (user.photo) {
                    await deleteFromSupabaseStorage(user.photo);
                }
            })
        )

        await Promise.all(
            users.map(user => 
                prismaClient.user.delete({
                    where: { id: user.id },
                })
            )
        )
        
        responseAPI(res, {
            status: 200,
            message: 'User deleted successfully',
        });
    } catch (error) {
        res.status(403);
    }
}

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id ? Number(req.params.id) : null;

        if (!userId) {
            return responseAPI(res, {
                status: 400,
                message: 'User ID is required',
            });
        }

        const userProfile = await prismaClient.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                photo: true,
                roles: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        if (!userProfile) {
            return responseAPI(res, {
                status: 404,
                message: 'User not found',
            });
        }

        if (userId !== userProfile.id) {
            return responseAPI(res, {
                status: 403,
                message: 'Forbidden: You do not have permission to access this resource',
            });
        }

        responseAPIData(res, {
            status: 200,
            message: 'User profile retrieved successfully',
            data: userProfile,
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const tokenHead = req.headers['authorization']?.split(' ')[1] as string;
        const userUpdated = await validateToken(tokenHead);
        if (!userUpdated) {
            responseAPI(res, {
                status: 401,
                message: 'Unauthorized',
            });
            return;
        }
        const userId = req.params.id ? Number(req.params.id) : null;

        if (!userId) {
            return responseAPI(res, {
                status: 400,
                message: 'User ID is required',
            });
        }

        const body = req.body as BodyUpdateProfile;
        if (!body) {
            return responseAPI(res, {status: 400, message: "No data provided"});
        };

        if (!body.name) {
            return responseAPI(res, {
                status: 400,
                message: 'Name is required',
            });
        }

        if (!body.username) {
            return responseAPI(res, {
                status: 400,
                message: 'Username is required',
            });
        }

        if (!body.email) {
            return responseAPI(res, {
                status: 400,
                message: 'Email is required',
            });
        }

        const existingUser = await prismaClient.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!existingUser) {
            return responseAPI(res, {
                status: 404,
                message: 'User not found',
            });
        }
        
        let avatarUrl: string | undefined = undefined;
        if (req.file) {
            if (existingUser.photo) {
                await deleteFromSupabaseStorage(existingUser.photo);
            }
            avatarUrl = await uploadToSupabaseStorage(req.file, existingUser.username);
        }

        if (body.password) {
            const hashed = await bcrypt.hash(body.password, 10)
            body.password = hashed;
        } else {
            if (!existingUser) {
                return responseAPI(res, {
                    status: 404,
                    message: 'User not found',
                });
            }
            body.password = existingUser.password; // Keep the existing password if not provided
        }

        await prismaClient.user.update({
            where: { id: userId },
            data: {
                name: body.name,
                username: body.username,
                email: body.email,
                password: body.password,
                photo: avatarUrl || existingUser.photo,
                updatedBy: {
                    connect: {
                        id: userId,
                    }
                },
            }
        });

        responseAPI(res, {
            status: 200,
            message: 'User profile updated successfully',
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}