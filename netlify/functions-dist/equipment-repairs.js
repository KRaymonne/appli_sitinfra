import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    try {
        switch (httpMethod) {
            case 'GET':
                const { search, page = '1', limit = '50', repairType } = queryStringParameters || {};
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (repairType && repairType !== 'all') {
                    where.repairType = repairType;
                }
                const [repairs, total] = await Promise.all([
                    prisma.repair.findMany({
                        where,
                        skip,
                        take: limitNum,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            equipment: true,
                        },
                    }),
                    prisma.repair.count({ where }),
                ]);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        repairs,
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
                const requiredFields = ['equipmentId', 'repairDate', 'repairType', 'amount', 'supplier', 'devise'];
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
                const newRepair = await prisma.repair.create({
                    data: {
                        equipmentId: parseInt(postData.equipmentId),
                        repairDate: new Date(postData.repairDate),
                        repairType: postData.repairType,
                        description: postData.description || null,
                        amount: parseFloat(postData.amount),
                        supplier: postData.supplier,
                        technician: postData.technician || null,
                        partsReplaced: postData.partsReplaced || null,
                        warrantyPeriod: postData.warrantyPeriod ? parseInt(postData.warrantyPeriod) : null,
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
                    body: JSON.stringify(newRepair),
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
                        body: JSON.stringify({ error: 'Repair ID is required' }),
                    };
                }
                if (updateData && updateData.Inserteridentity != null) {
                    updateData.Inserteridentity = String(updateData.Inserteridentity);
                }
                const updatedRepair = await prisma.repair.update({
                    where: { repairId: parseInt(updateId) },
                    data: {
                        equipmentId: updateData.equipmentId ? parseInt(updateData.equipmentId) : undefined,
                        repairDate: updateData.repairDate ? new Date(updateData.repairDate) : undefined,
                        repairType: updateData.repairType,
                        description: updateData.description || undefined,
                        amount: updateData.amount ? parseFloat(updateData.amount) : undefined,
                        supplier: updateData.supplier,
                        technician: updateData.technician || undefined,
                        partsReplaced: updateData.partsReplaced || undefined,
                        warrantyPeriod: updateData.warrantyPeriod ? parseInt(updateData.warrantyPeriod) : undefined,
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
                    body: JSON.stringify(updatedRepair),
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
                        body: JSON.stringify({ error: 'Repair ID is required' }),
                    };
                }
                await prisma.repair.delete({
                    where: { repairId: parseInt(deleteId) },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ message: 'Repair deleted successfully' }),
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
