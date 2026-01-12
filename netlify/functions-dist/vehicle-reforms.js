import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    try {
        switch (httpMethod) {
            case 'GET':
                const { search, page = '1', limit = '10', disposalMethod, vehicleId, InserterCountry } = queryStringParameters || {};
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (search) {
                    where.OR = [
                        { reformReason: { contains: search } },
                        { buyer: { contains: search } },
                        { buyerNumber: { contains: search } },
                    ];
                }
                if (disposalMethod && disposalMethod !== 'all') {
                    where.disposalMethod = disposalMethod;
                }
                if (vehicleId) {
                    where.vehicleId = parseInt(vehicleId);
                }
                if (InserterCountry) {
                    where.InserterCountry = InserterCountry;
                }
                const [reforms, total] = await Promise.all([
                    prisma.vehiclereforms.findMany({
                        where,
                        skip,
                        take: limitNum,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            vehicle: {
                                select: {
                                    vehicleId: true,
                                    licensePlate: true,
                                    brand: true,
                                    model: true,
                                },
                            },
                        },
                    }),
                    prisma.vehiclereforms.count({ where }),
                ]);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        reforms,
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
                const requiredFields = ['vehicleId', 'reformDate', 'reformReason', 'disposalMethod', 'devise'];
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
                let reformDate;
                const reformDateObj = new Date(postData.reformDate);
                if (isNaN(reformDateObj.getTime())) {
                    return {
                        statusCode: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                        body: JSON.stringify({ error: 'Invalid reformDate format' }),
                    };
                }
                reformDate = reformDateObj;
                const newReform = await prisma.vehiclereforms.create({
                    data: {
                        vehicleId: parseInt(postData.vehicleId),
                        reformDate: reformDate,
                        reformReason: postData.reformReason,
                        salePrice: postData.salePrice ? parseFloat(postData.salePrice) : null,
                        buyer: postData.buyer || null,
                        buyerNumber: postData.buyerNumber || null,
                        buyerAddress: postData.buyerAddress || null,
                        devise: postData.devise,
                        disposalMethod: postData.disposalMethod,
                        reformReport: postData.reformReport || null,
                        reformCertificate: postData.reformCertificate || null,
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
                    body: JSON.stringify(newReform),
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
                        body: JSON.stringify({ error: 'Reform ID is required' }),
                    };
                }
                if (updateData && updateData.Inserteridentity != null) {
                    updateData.Inserteridentity = String(updateData.Inserteridentity);
                }
                // Handle dates properly for updates as well
                let updateReformDate = undefined;
                if (updateData.reformDate !== undefined) {
                    if (updateData.reformDate === null || updateData.reformDate === '') {
                        return {
                            statusCode: 400,
                            headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                            },
                            body: JSON.stringify({ error: 'reformDate is required' }),
                        };
                    }
                    else {
                        const date = new Date(updateData.reformDate);
                        if (!isNaN(date.getTime())) {
                            updateReformDate = date;
                        }
                        else {
                            return {
                                statusCode: 400,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*',
                                },
                                body: JSON.stringify({ error: 'Invalid reformDate format' }),
                            };
                        }
                    }
                }
                const updatedReform = await prisma.vehiclereforms.update({
                    where: { reformId: parseInt(updateId) },
                    data: {
                        ...updateData,
                        vehicleId: updateData.vehicleId ? parseInt(updateData.vehicleId) : undefined,
                        reformDate: updateReformDate,
                        salePrice: updateData.salePrice ? parseFloat(updateData.salePrice) : undefined,
                    },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify(updatedReform),
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
                        body: JSON.stringify({ error: 'Reform ID is required' }),
                    };
                }
                await prisma.vehiclereforms.delete({
                    where: { reformId: parseInt(deleteId) },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ message: 'Reform deleted successfully' }),
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
