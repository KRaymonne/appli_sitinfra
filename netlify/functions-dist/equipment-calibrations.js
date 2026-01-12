import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    try {
        switch (httpMethod) {
            case 'GET':
                const { search, page = '1', limit = '50' } = queryStringParameters || {};
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const [calibrations, total] = await Promise.all([
                    prisma.calibration.findMany({
                        skip,
                        take: limitNum,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            equipment: true,
                        },
                    }),
                    prisma.calibration.count(),
                ]);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        calibrations,
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
                const requiredFields = ['equipmentId', 'calibrationDate', 'amount', 'supplier', 'devise'];
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
                const newCalibration = await prisma.calibration.create({
                    data: {
                        equipmentId: parseInt(postData.equipmentId),
                        calibrationDate: new Date(postData.calibrationDate),
                        validityDate: postData.validityDate ? new Date(postData.validityDate) : null,
                        amount: parseFloat(postData.amount),
                        supplier: postData.supplier,
                        referenceNumber: postData.referenceNumber || null,
                        description: postData.description || null,
                        nextCalibrationDate: postData.nextCalibrationDate ? new Date(postData.nextCalibrationDate) : null,
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
                    body: JSON.stringify(newCalibration),
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
                        body: JSON.stringify({ error: 'Calibration ID is required' }),
                    };
                }
                if (updateData && updateData.Inserteridentity != null) {
                    updateData.Inserteridentity = String(updateData.Inserteridentity);
                }
                const updatedCalibration = await prisma.calibration.update({
                    where: { calibrationId: parseInt(updateId) },
                    data: {
                        equipmentId: updateData.equipmentId ? parseInt(updateData.equipmentId) : undefined,
                        calibrationDate: updateData.calibrationDate ? new Date(updateData.calibrationDate) : undefined,
                        validityDate: updateData.validityDate ? new Date(updateData.validityDate) : undefined,
                        amount: updateData.amount ? parseFloat(updateData.amount) : undefined,
                        supplier: updateData.supplier,
                        referenceNumber: updateData.referenceNumber || undefined,
                        description: updateData.description || undefined,
                        nextCalibrationDate: updateData.nextCalibrationDate ? new Date(updateData.nextCalibrationDate) : undefined,
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
                    body: JSON.stringify(updatedCalibration),
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
                        body: JSON.stringify({ error: 'Calibration ID is required' }),
                    };
                }
                await prisma.calibration.delete({
                    where: { calibrationId: parseInt(deleteId) },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ message: 'Calibration deleted successfully' }),
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
