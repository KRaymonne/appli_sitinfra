import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    try {
        switch (httpMethod) {
            case 'GET':
                const { search, page = '1', limit = '10', typePaiement, vehicleId, InserterCountry } = queryStringParameters || {};
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (search) {
                    where.OR = [
                        { station: { contains: search } },
                    ];
                }
                if (typePaiement && typePaiement !== 'all') {
                    where.typePaiement = typePaiement;
                }
                if (vehicleId) {
                    where.vehicleId = parseInt(vehicleId);
                }
                if (InserterCountry) {
                    where.InserterCountry = InserterCountry;
                }
                const [fuelManagements, total] = await Promise.all([
                    prisma.fuelmanagements.findMany({
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
                    prisma.fuelmanagements.count({ where }),
                ]);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        fuelManagements,
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
                const requiredFields = ['vehicleId', 'date', 'typePaiement', 'quantity', 'amount', 'prixLitre', 'station', 'devise'];
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
                let date;
                const dateObj = new Date(postData.date);
                if (isNaN(dateObj.getTime())) {
                    return {
                        statusCode: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                        body: JSON.stringify({ error: 'Invalid date format' }),
                    };
                }
                date = dateObj;
                const newFuelManagement = await prisma.fuelmanagements.create({
                    data: {
                        vehicleId: parseInt(postData.vehicleId),
                        date: date,
                        typePaiement: postData.typePaiement,
                        distance: parseInt(postData.distance) || 0,
                        quantity: parseFloat(postData.quantity),
                        amount: parseFloat(postData.amount),
                        prixLitre: parseFloat(postData.prixLitre),
                        station: postData.station,
                        devise: postData.devise,
                        fichierJoint: postData.fichierJoint || null,
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
                    body: JSON.stringify(newFuelManagement),
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
                        body: JSON.stringify({ error: 'Fuel Management ID is required' }),
                    };
                }
                if (updateData && updateData.Inserteridentity != null) {
                    updateData.Inserteridentity = String(updateData.Inserteridentity);
                }
                // Handle dates properly for updates as well
                let updateDate = undefined;
                if (updateData.date !== undefined) {
                    if (updateData.date === null || updateData.date === '') {
                        return {
                            statusCode: 400,
                            headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                            },
                            body: JSON.stringify({ error: 'date is required' }),
                        };
                    }
                    else {
                        const date = new Date(updateData.date);
                        if (!isNaN(date.getTime())) {
                            updateDate = date;
                        }
                        else {
                            return {
                                statusCode: 400,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*',
                                },
                                body: JSON.stringify({ error: 'Invalid date format' }),
                            };
                        }
                    }
                }
                const updatedFuelManagement = await prisma.fuelmanagements.update({
                    where: { fuelManagementId: parseInt(updateId) },
                    data: {
                        ...updateData,
                        vehicleId: updateData.vehicleId ? parseInt(updateData.vehicleId) : undefined,
                        date: updateDate,
                        distance: updateData.distance ? parseInt(updateData.distance) : undefined,
                        quantity: updateData.quantity ? parseFloat(updateData.quantity) : undefined,
                        amount: updateData.amount ? parseFloat(updateData.amount) : undefined,
                        prixLitre: updateData.prixLitre ? parseFloat(updateData.prixLitre) : undefined,
                    },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify(updatedFuelManagement),
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
                        body: JSON.stringify({ error: 'Fuel Management ID is required' }),
                    };
                }
                await prisma.fuelmanagements.delete({
                    where: { fuelManagementId: parseInt(deleteId) },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ message: 'Fuel Management deleted successfully' }),
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
