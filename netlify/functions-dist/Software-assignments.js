import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    try {
        switch (httpMethod) {
            case 'GET':
                const { search, page = '1', limit = '10', status, InserterCountry } = queryStringParameters || {};
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (search) {
                    where.OR = [
                        { department: { contains: search } },
                        { purpose: { contains: search } },
                        { notes: { contains: search } },
                        { software: { name: { contains: search } } },
                        { user: { firstName: { contains: search } } },
                        { user: { lastName: { contains: search } } },
                    ];
                }
                if (status && status !== 'all') {
                    where.status = status;
                }
                if (InserterCountry) {
                    where.InserterCountry = InserterCountry;
                }
                const [assignments, total] = await Promise.all([
                    prisma.softwareAssignment.findMany({
                        where,
                        skip,
                        take: limitNum,
                        include: {
                            software: {
                                select: {
                                    name: true,
                                    version: true,
                                },
                            },
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                    }),
                    prisma.softwareAssignment.count({ where }),
                ]);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        assignments,
                        pagination: {
                            page: pageNum,
                            limit: limitNum,
                            total,
                            totalPages: Math.ceil(total / limitNum),
                        },
                    }),
                };
            case 'POST':
                const postData = JSON.parse(body);
                if (postData && postData.Inserteridentity != null) {
                    postData.Inserteridentity = String(postData.Inserteridentity);
                }
                const requiredFields = ['softwareId', 'assignmentDate', 'status'];
                for (const field of requiredFields) {
                    if (postData[field] === undefined || postData[field] === null) {
                        return {
                            statusCode: 400,
                            headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                            },
                            body: JSON.stringify({ error: `Field ${field} is required` }),
                        };
                    }
                }
                const newAssignment = await prisma.softwareAssignment.create({
                    data: {
                        softwareId: parseInt(postData.softwareId),
                        userId: postData.userId ? parseInt(postData.userId) : null,
                        department: postData.department || null,
                        assignmentDate: new Date(postData.assignmentDate),
                        returnDate: postData.returnDate ? new Date(postData.returnDate) : null,
                        purpose: postData.purpose || null,
                        notes: postData.notes || null,
                        status: postData.status,
                        Inserteridentity: postData.Inserteridentity || null,
                        InserterCountry: postData.InserterCountry || null,
                    },
                    include: {
                        software: {
                            select: {
                                name: true,
                                version: true,
                            },
                        },
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                });
                return {
                    statusCode: 201,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify(newAssignment),
                };
            case 'PUT':
                const updateData = JSON.parse(body);
                const { id: updateId } = queryStringParameters || {};
                if (!updateId) {
                    return {
                        statusCode: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                        body: JSON.stringify({ error: 'Assignment ID is required' }),
                    };
                }
                if (updateData && updateData.Inserteridentity != null) {
                    updateData.Inserteridentity = String(updateData.Inserteridentity);
                }
                const updatedAssignment = await prisma.softwareAssignment.update({
                    where: { assignmentId: parseInt(updateId) },
                    data: {
                        userId: updateData.userId ? parseInt(updateData.userId) : null,
                        department: updateData.department,
                        assignmentDate: updateData.assignmentDate ? new Date(updateData.assignmentDate) : undefined,
                        returnDate: updateData.returnDate ? (updateData.returnDate ? new Date(updateData.returnDate) : null) : undefined,
                        purpose: updateData.purpose,
                        notes: updateData.notes,
                        status: updateData.status,
                    },
                    include: {
                        software: {
                            select: {
                                name: true,
                                version: true,
                            },
                        },
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify(updatedAssignment),
                };
            case 'DELETE':
                const { id: deleteId } = queryStringParameters || {};
                if (!deleteId) {
                    return {
                        statusCode: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                        body: JSON.stringify({ error: 'Assignment ID is required' }),
                    };
                }
                await prisma.softwareAssignment.delete({
                    where: { assignmentId: parseInt(deleteId) },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ message: 'Assignment deleted successfully' }),
                };
            default:
                return {
                    statusCode: 405,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ error: 'Method not allowed' }),
                };
        }
    }
    catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: error.message || 'Internal server error' }),
        };
    }
    finally {
        await prisma.$disconnect();
    }
};
