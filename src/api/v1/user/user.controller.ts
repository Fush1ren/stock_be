import { Request, Response } from "express";
import { createClient } from '@supabase/supabase-js';
import { BodyCreateUser } from "../../../dto";
import { getPage, responseAPI, responseAPIData, responseAPITable } from "../../utils";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { IQuery } from "../../types/data.type";
import { validateToken } from "../auth/auth.controller";
import bcrypt from 'bcryptjs'
import config from "../../../config";
import { BodyUpdateUser } from "../../../dto/user.dto";

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
        const filePath = avatarUrl.split('/storage/v1/object/public/')[1];

        if (!filePath) return;
        await supabaseStorage.storage.from(bucketName).remove([filePath]);
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
        let queryTable = {
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
                }
            },
        } as IQuery;
        if (queryParams.page || queryParams.limit) {
            const paramPage = queryParams.page ? Number(queryParams.page) : 1;
            const paramLimit = queryParams.limit ? Number(queryParams.limit) : 10;
            const page = getPage(paramPage,paramLimit);
            queryTable = {
                ...queryTable,
                skip: page.skip,
                take: page.take,
            }
        }
        const users = await prismaClient.user.findMany(queryTable);
        const totalRecords = await prismaClient.user.count();

        responseAPITable(res, {
            status: 200,
            message: 'Get all user successfully',
            data: {
                totalRecords: totalRecords,
                data: users,
            },
        })
    } catch (error) {
        res.status(403);
    }
}

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
                createdAt: true,
                updatedAt: true,
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

        const body = req.body as BodyUpdateUser;
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

        if (!body.role) {
            return responseAPI(res, {
                status: 400,
                message: 'Role is required',
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
                roles: {
                    connect: {
                        id: Number(body.role),
                    },
                }
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