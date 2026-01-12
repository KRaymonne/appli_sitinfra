import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    try {
        switch (httpMethod) {
            case 'GET':
                const { search, page = '1', limit = '10', accountType, bankId, dateFrom, dateTo, InserterCountry } = queryStringParameters || {};
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (search) {
                    where.OR = [
                        { name: { contains: search } },
                        { description: { contains: search } },
                        { accountNumber: { contains: search } },
                    ];
                }
                if (accountType && accountType !== 'all') {
                    where.accountType = accountType;
                }
                if (bankId) {
                    where.bankId = parseInt(bankId);
                }
                if (dateFrom) {
                    where.date = { ...where.date, gte: new Date(dateFrom) };
                }
                if (dateTo) {
                    where.date = { ...where.date, lte: new Date(dateTo) };
                }
                if (InserterCountry) {
                    where.InserterCountry = InserterCountry;
                }
                const [transactions, total] = await Promise.all([
                    prisma.bankTransaction.findMany({
                        where,
                        skip,
                        take: limitNum,
                        orderBy: { date: 'desc' },
                        include: {
                            bank: true,
                        },
                    }),
                    prisma.bankTransaction.count({ where }),
                ]);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        transactions,
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
                const requiredFields = ['bankId', 'date', 'amount', 'accountType', 'accountNumber', 'devise'];
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
                if (postData && postData.Inserteridentity != null) {
                    postData.Inserteridentity = String(postData.Inserteridentity);
                }
                const newTransaction = await prisma.bankTransaction.create({
                    data: {
                        bankId: parseInt(postData.bankId),
                        date: new Date(postData.date),
                        description: postData.description || null,
                        amount: parseFloat(postData.amount),
                        accountType: postData.accountType,
                        accountNumber: postData.accountNumber,
                        attachment: postData.attachment || null,
                        devise: postData.devise,
                        name: postData.name || null,
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
                    body: JSON.stringify(newTransaction),
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
                        body: JSON.stringify({ error: 'Transaction ID is required' }),
                    };
                }
                if (updateData && updateData.Inserteridentity != null) {
                    updateData.Inserteridentity = String(updateData.Inserteridentity);
                }
                const dataToUpdate = {};
                if (updateData.bankId !== undefined)
                    dataToUpdate.bankId = updateData.bankId ? parseInt(updateData.bankId) : undefined;
                if (updateData.date !== undefined)
                    dataToUpdate.date = updateData.date ? new Date(updateData.date) : undefined;
                if (updateData.description !== undefined)
                    dataToUpdate.description = updateData.description;
                if (updateData.amount !== undefined)
                    dataToUpdate.amount = updateData.amount ? parseFloat(updateData.amount) : undefined;
                if (updateData.accountType !== undefined)
                    dataToUpdate.accountType = updateData.accountType;
                if (updateData.accountNumber !== undefined)
                    dataToUpdate.accountNumber = updateData.accountNumber;
                if (updateData.attachment !== undefined)
                    dataToUpdate.attachment = updateData.attachment;
                if (updateData.devise !== undefined)
                    dataToUpdate.devise = updateData.devise;
                if (updateData.name !== undefined)
                    dataToUpdate.name = updateData.name;
                if (updateData.Inserteridentity !== undefined) {
                    dataToUpdate.Inserteridentity = updateData.Inserteridentity ? String(updateData.Inserteridentity) : null;
                }
                if (updateData.InserterCountry !== undefined)
                    dataToUpdate.InserterCountry = updateData.InserterCountry;
                const updatedTransaction = await prisma.bankTransaction.update({
                    where: { transactionId: parseInt(updateId) },
                    data: dataToUpdate,
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify(updatedTransaction),
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
                        body: JSON.stringify({ error: 'Transaction ID is required' }),
                    };
                }
                await prisma.bankTransaction.delete({
                    where: { transactionId: parseInt(deleteId) },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ message: 'Transaction deleted successfully' }),
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
