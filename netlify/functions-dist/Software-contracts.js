import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    try {
        switch (httpMethod) {
            case 'GET':
                const { search, page = '1', limit = '10', status, contractType, InserterCountry } = queryStringParameters || {};
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (search) {
                    where.OR = [
                        { contractNumber: { contains: search } },
                        { provider: { contains: search } },
                        { description: { contains: search } },
                        { software: { name: { contains: search } } },
                    ];
                }
                if (status && status !== 'all') {
                    where.status = status;
                }
                if (contractType && contractType !== 'all') {
                    where.contractType = contractType;
                }
                if (InserterCountry) {
                    where.InserterCountry = InserterCountry;
                }
                const [contracts, total] = await Promise.all([
                    prisma.softwareContract.findMany({
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
                    prisma.softwareContract.count({ where }),
                ]);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        contracts,
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
                const requiredFields = ['softwareId', 'provider', 'contractType'];
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
                const newContract = await prisma.softwareContract.create({
                    data: {
                        softwareId: parseInt(postData.softwareId),
                        contractNumber: postData.contractNumber || null,
                        provider: postData.provider,
                        startDate: postData.startDate || null,
                        endDate: postData.endDate || null,
                        renewalDate: postData.renewalDate || null,
                        amount: postData.amount ? parseFloat(postData.amount) : null,
                        currency: postData.currency || 'XAF',
                        contractType: postData.contractType,
                        status: postData.status || 'ACTIVE',
                        description: postData.description || null,
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
                    body: JSON.stringify(newContract),
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
                        body: JSON.stringify({ error: 'Contract ID is required' }),
                    };
                }
                if (updateData && updateData.Inserteridentity != null) {
                    updateData.Inserteridentity = String(updateData.Inserteridentity);
                }
                const updatedContract = await prisma.softwareContract.update({
                    where: { contractId: parseInt(updateId) },
                    data: {
                        contractNumber: updateData.contractNumber,
                        provider: updateData.provider,
                        startDate: updateData.startDate ? (updateData.startDate ? new Date(updateData.startDate) : null) : undefined,
                        endDate: updateData.endDate ? (updateData.endDate ? new Date(updateData.endDate) : null) : undefined,
                        renewalDate: updateData.renewalDate ? (updateData.renewalDate ? new Date(updateData.renewalDate) : null) : undefined,
                        amount: updateData.amount !== undefined ? (updateData.amount ? parseFloat(updateData.amount) : null) : undefined,
                        currency: updateData.currency,
                        contractType: updateData.contractType,
                        status: updateData.status,
                        description: updateData.description,
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
                    body: JSON.stringify(updatedContract),
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
                        body: JSON.stringify({ error: 'Contract ID is required' }),
                    };
                }
                await prisma.softwareContract.delete({
                    where: { contractId: parseInt(deleteId) },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ message: 'Contract deleted successfully' }),
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
