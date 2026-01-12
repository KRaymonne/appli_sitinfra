import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    try {
        switch (httpMethod) {
            case 'GET':
                const { search, page = '1', limit = '10', cardId, InserterCountry } = queryStringParameters || {};
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (search) {
                    where.OR = [
                        { description: { contains: search } },
                    ];
                }
                if (cardId) {
                    where.cardId = parseInt(cardId);
                }
                if (InserterCountry) {
                    where.InserterCountry = InserterCountry;
                }
                const [cardOperations, total] = await Promise.all([
                    prisma.cardoperations.findMany({
                        where,
                        skip,
                        take: limitNum,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            card: {
                                select: {
                                    cardId: true,
                                    numBadge: true,
                                    typeBadge: true,
                                    description: true,
                                },
                            },
                        },
                    }),
                    prisma.cardoperations.count({ where }),
                ]);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        cardOperations,
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
                const requiredFields = ['cardId', 'operationDate', 'amount', 'devise'];
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
                // Handle dates properly - validate required dates
                let operationDate;
                const operationDateObj = new Date(postData.operationDate);
                if (isNaN(operationDateObj.getTime())) {
                    return {
                        statusCode: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                        body: JSON.stringify({ error: 'Invalid operationDate format' }),
                    };
                }
                operationDate = operationDateObj;
                const newCardOperation = await prisma.cardoperations.create({
                    data: {
                        cardId: parseInt(postData.cardId),
                        operationDate: operationDate,
                        amount: parseFloat(postData.amount),
                        description: postData.description || null,
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
                    body: JSON.stringify(newCardOperation),
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
                        body: JSON.stringify({ error: 'Card Operation ID is required' }),
                    };
                }
                if (updateData && updateData.Inserteridentity != null) {
                    updateData.Inserteridentity = String(updateData.Inserteridentity);
                }
                // Handle dates properly for updates as well
                let updateOperationDate = undefined;
                if (updateData.operationDate !== undefined) {
                    if (updateData.operationDate === null || updateData.operationDate === '') {
                        return {
                            statusCode: 400,
                            headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                            },
                            body: JSON.stringify({ error: 'operationDate is required' }),
                        };
                    }
                    else {
                        const date = new Date(updateData.operationDate);
                        if (!isNaN(date.getTime())) {
                            updateOperationDate = date;
                        }
                        else {
                            return {
                                statusCode: 400,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*',
                                },
                                body: JSON.stringify({ error: 'Invalid operationDate format' }),
                            };
                        }
                    }
                }
                const updatedCardOperation = await prisma.cardoperations.update({
                    where: { operationId: parseInt(updateId) },
                    data: {
                        ...updateData,
                        cardId: updateData.cardId ? parseInt(updateData.cardId) : undefined,
                        operationDate: updateOperationDate,
                        amount: updateData.amount ? parseFloat(updateData.amount) : undefined,
                    },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify(updatedCardOperation),
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
                        body: JSON.stringify({ error: 'Card Operation ID is required' }),
                    };
                }
                await prisma.cardoperations.delete({
                    where: { operationId: parseInt(deleteId) },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ message: 'Card Operation deleted successfully' }),
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
