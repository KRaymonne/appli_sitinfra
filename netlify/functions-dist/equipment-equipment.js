import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    try {
        switch (httpMethod) {
            case 'GET':
                const { search, page = '1', limit = '50', status, category, InserterCountry } = queryStringParameters || {};
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (search) {
                    where.OR = [
                        { name: { contains: search } },
                        { serialNumber: { contains: search } },
                        { referenceCode: { contains: search } },
                        { brand: { contains: search } },
                    ];
                }
                if (status && status !== 'all') {
                    where.status = status;
                }
                if (category && category !== 'all') {
                    where.category = category;
                }
                if (InserterCountry) {
                    where.InserterCountry = InserterCountry;
                }
                const [equipments, total] = await Promise.all([
                    prisma.equipment.findMany({
                        where,
                        skip,
                        take: limitNum,
                        orderBy: { createdAt: 'desc' },
                    }),
                    prisma.equipment.count({ where }),
                ]);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        data: equipments,
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
                const requiredFields = ['name', 'category', 'type', 'brand', 'serialNumber', 'referenceCode', 'supplier', 'purchaseAmount', 'purchaseDate', 'deliveryDate', 'status', 'location', 'ownership', 'devise'];
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
                const newEquipment = await prisma.equipment.create({
                    data: {
                        name: postData.name,
                        category: postData.category,
                        type: postData.type,
                        brand: postData.brand,
                        model: postData.model || null,
                        serialNumber: postData.serialNumber,
                        referenceCode: postData.referenceCode,
                        supplier: postData.supplier,
                        purchaseAmount: parseFloat(postData.purchaseAmount),
                        purchaseDate: new Date(postData.purchaseDate),
                        deliveryDate: new Date(postData.deliveryDate),
                        warrantyExpiry: postData.warrantyExpiry ? new Date(postData.warrantyExpiry) : null,
                        status: postData.status,
                        devise: postData.devise,
                        location: postData.location,
                        observations: postData.observations || null,
                        ownership: postData.ownership,
                        attachmentFile: postData.attachmentFile || null,
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
                    body: JSON.stringify(newEquipment),
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
                        body: JSON.stringify({ error: 'Equipment ID is required' }),
                    };
                }
                if (updateData && updateData.Inserteridentity != null) {
                    updateData.Inserteridentity = String(updateData.Inserteridentity);
                }
                const updatedEquipment = await prisma.equipment.update({
                    where: { equipmentId: parseInt(updateId) },
                    data: {
                        name: updateData.name,
                        category: updateData.category,
                        type: updateData.type,
                        brand: updateData.brand,
                        model: updateData.model || null,
                        serialNumber: updateData.serialNumber,
                        referenceCode: updateData.referenceCode,
                        supplier: updateData.supplier,
                        purchaseAmount: updateData.purchaseAmount ? parseFloat(updateData.purchaseAmount) : undefined,
                        purchaseDate: updateData.purchaseDate ? new Date(updateData.purchaseDate) : undefined,
                        deliveryDate: updateData.deliveryDate ? new Date(updateData.deliveryDate) : undefined,
                        warrantyExpiry: updateData.warrantyExpiry ? new Date(updateData.warrantyExpiry) : undefined,
                        status: updateData.status,
                        devise: updateData.devise,
                        location: updateData.location,
                        observations: updateData.observations || null,
                        ownership: updateData.ownership,
                        attachmentFile: updateData.attachmentFile || null,
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
                    body: JSON.stringify(updatedEquipment),
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
                        body: JSON.stringify({ error: 'Equipment ID is required' }),
                    };
                }
                await prisma.equipment.delete({
                    where: { equipmentId: parseInt(deleteId) },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ message: 'Equipment deleted successfully' }),
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
