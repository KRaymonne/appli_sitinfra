import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    try {
        switch (httpMethod) {
            case 'GET':
                const { search, page = '1', limit = '10', transactionType, startDate, endDate, InserterCountry } = queryStringParameters || {};
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (search) {
                    where.OR = [
                        { description: { contains: search } },
                        { referenceNumber: { contains: search } },
                        { receiptNumber: { contains: search } },
                        { serviceProvider: { contains: search } },
                    ];
                }
                if (transactionType && transactionType !== 'all') {
                    where.transactionType = transactionType;
                }
                if (startDate) {
                    where.transactionDate = {
                        ...where.transactionDate,
                        gte: new Date(startDate),
                    };
                }
                if (endDate) {
                    where.transactionDate = {
                        ...where.transactionDate,
                        lte: new Date(endDate),
                    };
                }
                if (InserterCountry) {
                    where.InserterCountry = InserterCountry;
                }
                const [transactions, total] = await Promise.all([
                    prisma.transaction.findMany({
                        where,
                        skip,
                        take: limitNum,
                        orderBy: { transactionDate: 'desc' },
                        include: {
                            register: {
                                select: {
                                    registerId: true,
                                    registerName: true,
                                    location: true,
                                },
                            },
                        },
                    }),
                    prisma.transaction.count({ where }),
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
                if (postData && postData.Inserteridentity != null) {
                    postData.Inserteridentity = String(postData.Inserteridentity);
                }
                const requiredFields = ['registerId', 'transactionType', 'amount', 'transactionDate', 'devise'];
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
                const newTransaction = await prisma.transaction.create({
                    data: {
                        registerId: parseInt(postData.registerId),
                        transactionType: postData.transactionType,
                        amount: parseFloat(postData.amount),
                        description: postData.description || null,
                        expenseType: postData.expenseType || null,
                        referenceNumber: postData.referenceNumber || null,
                        receiptNumber: postData.receiptNumber || null,
                        transactionDate: new Date(postData.transactionDate),
                        serviceProvider: postData.serviceProvider || null,
                        supplyType: postData.supplyType || null,
                        attachment: postData.attachment || null,
                        devise: postData.devise,
                        Inserteridentity: postData.Inserteridentity || null,
                        InserterCountry: postData.InserterCountry || null,
                    },
                    include: {
                        register: {
                            select: {
                                registerId: true,
                                registerName: true,
                                location: true,
                            },
                        },
                    },
                });
                // Update register balance based on transaction type
                const register = await prisma.register.findUnique({
                    where: { registerId: parseInt(postData.registerId) },
                });
                if (register) {
                    let balanceChange = 0;
                    switch (postData.transactionType) {
                        case 'INCOME':
                        case 'TRANSFER_IN':
                            balanceChange = parseFloat(postData.amount);
                            break;
                        case 'EXPENSE':
                        case 'TRANSFER_OUT':
                            balanceChange = -parseFloat(postData.amount);
                            break;
                    }
                    await prisma.register.update({
                        where: { registerId: parseInt(postData.registerId) },
                        data: {
                            currentBalance: register.currentBalance + balanceChange,
                        },
                    });
                }
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
                // Get the old transaction to adjust register balance
                const oldTransaction = await prisma.transaction.findUnique({
                    where: { transactionId: parseInt(updateId) },
                });
                if (!oldTransaction) {
                    return {
                        statusCode: 404,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                        body: JSON.stringify({ error: 'Transaction not found' }),
                    };
                }
                const dataToUpdate = {};
                if (updateData.registerId !== undefined)
                    dataToUpdate.registerId = parseInt(updateData.registerId);
                if (updateData.transactionType !== undefined)
                    dataToUpdate.transactionType = updateData.transactionType;
                if (updateData.amount !== undefined)
                    dataToUpdate.amount = parseFloat(updateData.amount);
                if (updateData.description !== undefined)
                    dataToUpdate.description = updateData.description;
                if (updateData.expenseType !== undefined)
                    dataToUpdate.expenseType = updateData.expenseType;
                if (updateData.referenceNumber !== undefined)
                    dataToUpdate.referenceNumber = updateData.referenceNumber;
                if (updateData.receiptNumber !== undefined)
                    dataToUpdate.receiptNumber = updateData.receiptNumber;
                if (updateData.transactionDate !== undefined)
                    dataToUpdate.transactionDate = new Date(updateData.transactionDate);
                if (updateData.serviceProvider !== undefined)
                    dataToUpdate.serviceProvider = updateData.serviceProvider;
                if (updateData.supplyType !== undefined)
                    dataToUpdate.supplyType = updateData.supplyType;
                if (updateData.attachment !== undefined)
                    dataToUpdate.attachment = updateData.attachment;
                if (updateData.devise !== undefined)
                    dataToUpdate.devise = updateData.devise;
                if (updateData.Inserteridentity !== undefined) {
                    dataToUpdate.Inserteridentity = updateData.Inserteridentity ? String(updateData.Inserteridentity) : null;
                }
                if (updateData.InserterCountry !== undefined)
                    dataToUpdate.InserterCountry = updateData.InserterCountry;
                const updatedTransaction = await prisma.transaction.update({
                    where: { transactionId: parseInt(updateId) },
                    data: dataToUpdate,
                    include: {
                        register: {
                            select: {
                                registerId: true,
                                registerName: true,
                                location: true,
                            },
                        },
                    },
                });
                // Revert old balance change
                const oldRegister = await prisma.register.findUnique({
                    where: { registerId: oldTransaction.registerId },
                });
                if (oldRegister) {
                    let oldBalanceChange = 0;
                    switch (oldTransaction.transactionType) {
                        case 'INCOME':
                        case 'TRANSFER_IN':
                            oldBalanceChange = -oldTransaction.amount;
                            break;
                        case 'EXPENSE':
                        case 'TRANSFER_OUT':
                            oldBalanceChange = oldTransaction.amount;
                            break;
                    }
                    await prisma.register.update({
                        where: { registerId: oldTransaction.registerId },
                        data: {
                            currentBalance: oldRegister.currentBalance + oldBalanceChange,
                        },
                    });
                }
                // Apply new balance change
                const newRegister = await prisma.register.findUnique({
                    where: { registerId: updatedTransaction.registerId },
                });
                if (newRegister) {
                    let newBalanceChange = 0;
                    switch (updatedTransaction.transactionType) {
                        case 'INCOME':
                        case 'TRANSFER_IN':
                            newBalanceChange = updatedTransaction.amount;
                            break;
                        case 'EXPENSE':
                        case 'TRANSFER_OUT':
                            newBalanceChange = -updatedTransaction.amount;
                            break;
                    }
                    await prisma.register.update({
                        where: { registerId: updatedTransaction.registerId },
                        data: {
                            currentBalance: newRegister.currentBalance + newBalanceChange,
                        },
                    });
                }
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
                // Get transaction before deleting to adjust register balance
                const transactionToDelete = await prisma.transaction.findUnique({
                    where: { transactionId: parseInt(deleteId) },
                });
                if (!transactionToDelete) {
                    return {
                        statusCode: 404,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                        body: JSON.stringify({ error: 'Transaction not found' }),
                    };
                }
                await prisma.transaction.delete({
                    where: { transactionId: parseInt(deleteId) },
                });
                // Revert balance change
                const registerToUpdate = await prisma.register.findUnique({
                    where: { registerId: transactionToDelete.registerId },
                });
                if (registerToUpdate) {
                    let balanceChange = 0;
                    switch (transactionToDelete.transactionType) {
                        case 'INCOME':
                        case 'TRANSFER_IN':
                            balanceChange = -transactionToDelete.amount;
                            break;
                        case 'EXPENSE':
                        case 'TRANSFER_OUT':
                            balanceChange = transactionToDelete.amount;
                            break;
                    }
                    await prisma.register.update({
                        where: { registerId: transactionToDelete.registerId },
                        data: {
                            currentBalance: registerToUpdate.currentBalance + balanceChange,
                        },
                    });
                }
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
