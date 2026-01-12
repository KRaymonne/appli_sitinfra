import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    try {
        switch (httpMethod) {
            case 'GET':
                const { search, page = '1', limit = '10', role, InserterCountry } = queryStringParameters || {};
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (search) {
                    where.OR = [
                        { name: { contains: search } },
                        { role: { contains: search } },
                        { phone: { contains: search } },
                        { email: { contains: search } },
                        { software: { name: { contains: search } } },
                        { notes: { contains: search } },
                    ];
                }
                if (role && role !== 'all') {
                    where.role = role;
                }
                if (InserterCountry) {
                    where.InserterCountry = InserterCountry;
                }
                const [contacts, total] = await Promise.all([
                    prisma.softwareContact.findMany({
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
                        },
                        orderBy: { createdAt: 'desc' },
                    }),
                    prisma.softwareContact.count({ where }),
                ]);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        contacts,
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
                const requiredFields = ['softwareId', 'role'];
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
                const newContact = await prisma.softwareContact.create({
                    data: {
                        softwareId: parseInt(postData.softwareId),
                        role: postData.role,
                        name: postData.name || null,
                        phone: postData.phone || null,
                        email: postData.email || null,
                        notes: postData.notes || null,
                        onlineAssistant: postData.onlineAssistant || null,
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
                    },
                });
                return {
                    statusCode: 201,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify(newContact),
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
                        body: JSON.stringify({ error: 'Contact ID is required' }),
                    };
                }
                if (updateData && updateData.Inserteridentity != null) {
                    updateData.Inserteridentity = String(updateData.Inserteridentity);
                }
                const updatedContact = await prisma.softwareContact.update({
                    where: { contactId: parseInt(updateId) },
                    data: {
                        role: updateData.role,
                        name: updateData.name,
                        phone: updateData.phone,
                        email: updateData.email,
                        notes: updateData.notes,
                        onlineAssistant: updateData.onlineAssistant,
                    },
                    include: {
                        software: {
                            select: {
                                name: true,
                                version: true,
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
                    body: JSON.stringify(updatedContact),
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
                        body: JSON.stringify({ error: 'Contact ID is required' }),
                    };
                }
                await prisma.softwareContact.delete({
                    where: { contactId: parseInt(deleteId) },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ message: 'Contact deleted successfully' }),
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
