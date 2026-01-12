import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    try {
        switch (httpMethod) {
            case 'GET':
                const { search, page = '1', limit = '50', status } = queryStringParameters || {};
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (status && status !== 'all') {
                    where.status = status;
                }
                const [revisions, total] = await Promise.all([
                    prisma.equipmentRevisions.findMany({
                        where,
                        skip,
                        take: limitNum,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            equipment: true,
                        },
                    }),
                    prisma.equipmentRevisions.count({ where }),
                ]);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        revisions,
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
                const requiredFields = ['equipmentId', 'revisionDate', 'amount', 'supplier', 'status', 'devise'];
                for (const field of requiredFields) {
                    if (!postData[field]) {
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
                if (postData && postData.Inserteridentity != null) {
                    postData.Inserteridentity = String(postData.Inserteridentity);
                }
                const newRevision = await prisma.equipmentRevisions.create({
                    data: {
                        equipmentId: parseInt(postData.equipmentId),
                        revisionDate: new Date(postData.revisionDate),
                        validityDate: postData.validityDate ? new Date(postData.validityDate) : null,
                        amount: parseFloat(postData.amount),
                        supplier: postData.supplier,
                        referenceNumber: postData.referenceNumber || null,
                        description: postData.description || null,
                        status: postData.status,
                        nextRevisionDate: postData.nextRevisionDate ? new Date(postData.nextRevisionDate) : null,
                        devise: postData.devise,
                        Inserteridentity: postData.Inserteridentity || null,
                        InserterCountry: postData.InserterCountry || null,
                    },
                });
                return {
                    statusCode: 201,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify(newRevision),
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
                        body: JSON.stringify({ error: 'Revision ID is required' }),
                    };
                }
                if (updateData && updateData.Inserteridentity != null) {
                    updateData.Inserteridentity = String(updateData.Inserteridentity);
                }
                const updatedRevision = await prisma.equipmentRevisions.update({
                    where: { revisionId: parseInt(updateId) },
                    data: {
                        equipmentId: updateData.equipmentId ? parseInt(updateData.equipmentId) : undefined,
                        revisionDate: updateData.revisionDate ? new Date(updateData.revisionDate) : undefined,
                        validityDate: updateData.validityDate ? new Date(updateData.validityDate) : undefined,
                        amount: updateData.amount ? parseFloat(updateData.amount) : undefined,
                        supplier: updateData.supplier,
                        referenceNumber: updateData.referenceNumber || undefined,
                        description: updateData.description || undefined,
                        status: updateData.status,
                        nextRevisionDate: updateData.nextRevisionDate ? new Date(updateData.nextRevisionDate) : undefined,
                        devise: updateData.devise,
                        Inserteridentity: updateData.Inserteridentity !== undefined ? updateData.Inserteridentity : undefined,
                        InserterCountry: updateData.InserterCountry !== undefined ? updateData.InserterCountry : undefined,
                    },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify(updatedRevision),
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
                        body: JSON.stringify({ error: 'Revision ID is required' }),
                    };
                }
                await prisma.equipmentRevisions.delete({
                    where: { revisionId: parseInt(deleteId) },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ message: 'Revision deleted successfully' }),
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
