import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    try {
        switch (httpMethod) {
            case 'GET':
                const { search, page = '1', limit = '10', status, documentType, entity, InserterCountry } = queryStringParameters || {};
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (search) {
                    where.OR = [
                        { title: { contains: search } },
                        { createdBy: { contains: search } },
                        { version: { contains: search } },
                        { documentNumber: { contains: search } },
                        { description: { contains: search } },
                        { fileName: { contains: search } },
                    ];
                }
                if (status && status !== 'all') {
                    where.status = status;
                }
                if (documentType && documentType !== 'all') {
                    where.documentType = documentType;
                }
                if (entity && entity !== 'all') {
                    where.entity = entity;
                }
                if (InserterCountry) {
                    where.InserterCountry = InserterCountry;
                }
                const [documents, total] = await Promise.all([
                    prisma.document.findMany({
                        where,
                        skip,
                        take: limitNum,
                        orderBy: { createdAt: 'desc' },
                    }),
                    prisma.document.count({ where }),
                ]);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        documents,
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
                const requiredFields = ['title', 'createdBy', 'fileName'];
                for (const field of requiredFields) {
                    if (postData[field] === undefined || postData[field] === null || postData[field] === '') {
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
                const newDocument = await prisma.document.create({
                    data: {
                        version: postData.version || null,
                        date: postData.date ? new Date(postData.date) : new Date(),
                        title: postData.title,
                        createdBy: postData.createdBy,
                        verifiedBy: postData.verifiedBy || null,
                        validatedBy: postData.validatedBy || null,
                        fileName: postData.fileName,
                        fileSize: postData.fileSize || null,
                        status: postData.status || 'ACTIVE',
                        filePath: postData.filePath || null,
                        description: postData.description || null,
                        category: postData.category || null,
                        entity: postData.entity || null,
                        countryCode: postData.countryCode || null,
                        projectCode: postData.projectCode || null,
                        processCode: postData.processCode || null,
                        documentType: postData.documentType || null,
                        documentNumber: postData.documentNumber || null,
                        index: postData.index || null,
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
                    body: JSON.stringify(newDocument),
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
                        body: JSON.stringify({ error: 'Document ID is required' }),
                    };
                }
                if (updateData && updateData.Inserteridentity != null) {
                    updateData.Inserteridentity = String(updateData.Inserteridentity);
                }
                const updatedDocument = await prisma.document.update({
                    where: { documentId: parseInt(updateId) },
                    data: {
                        version: updateData.version,
                        date: updateData.date ? new Date(updateData.date) : undefined,
                        title: updateData.title,
                        createdBy: updateData.createdBy,
                        verifiedBy: updateData.verifiedBy,
                        validatedBy: updateData.validatedBy,
                        fileName: updateData.fileName,
                        fileSize: updateData.fileSize,
                        status: updateData.status,
                        filePath: updateData.filePath,
                        description: updateData.description,
                        category: updateData.category,
                        entity: updateData.entity,
                        countryCode: updateData.countryCode,
                        projectCode: updateData.projectCode,
                        processCode: updateData.processCode,
                        documentType: updateData.documentType,
                        documentNumber: updateData.documentNumber,
                        index: updateData.index,
                    },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify(updatedDocument),
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
                        body: JSON.stringify({ error: 'Document ID is required' }),
                    };
                }
                await prisma.document.delete({
                    where: { documentId: parseInt(deleteId) },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ message: 'Document deleted successfully' }),
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
