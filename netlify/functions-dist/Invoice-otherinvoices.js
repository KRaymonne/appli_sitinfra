import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    try {
        switch (httpMethod) {
            case 'GET':
                const { search, page = '1', limit = '10', category, status, InserterCountry } = queryStringParameters || {};
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (search) {
                    where.OR = [
                        { invoiceNumber: { contains: search } },
                        { supplier: { contains: search } },
                        { description: { contains: search } },
                        { category: { contains: search } },
                    ];
                }
                if (category && category !== 'all') {
                    where.category = category;
                }
                if (status && status !== 'all') {
                    where.status = status;
                }
                if (InserterCountry) {
                    where.InserterCountry = InserterCountry;
                }
                const [otherInvoices, total] = await Promise.all([
                    prisma.otherInvoice.findMany({
                        where,
                        skip,
                        take: limitNum,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            supplierContact: {
                                select: {
                                    contactId: true,
                                    firstName: true,
                                    lastName: true,
                                    companyName: true,
                                },
                            },
                        },
                    }),
                    prisma.otherInvoice.count({ where }),
                ]);
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        otherInvoices,
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
                const requiredFields = ['invoiceNumber', 'supplier', 'amount', 'devise', 'invoiceDate', 'status'];
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
                const newInvoice = await prisma.otherInvoice.create({
                    data: {
                        invoiceNumber: postData.invoiceNumber,
                        category: postData.category || null,
                        description: postData.description || null,
                        amount: parseFloat(postData.amount),
                        devise: postData.devise,
                        invoiceDate: new Date(postData.invoiceDate),
                        paymentDate: postData.paymentDate ? new Date(postData.paymentDate) : null,
                        supplier: postData.supplier,
                        supplierContactId: postData.supplierContactId ? parseInt(postData.supplierContactId) : null,
                        status: postData.status,
                        service: postData.service || null,
                        attachment: postData.attachment || null,
                        Inserteridentity: postData.Inserteridentity || null,
                        InserterCountry: postData.InserterCountry || null,
                    },
                    include: {
                        supplierContact: {
                            select: {
                                contactId: true,
                                firstName: true,
                                lastName: true,
                                companyName: true,
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
                    body: JSON.stringify(newInvoice),
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
                        body: JSON.stringify({ error: 'Other Invoice ID is required' }),
                    };
                }
                if (updateData && updateData.Inserteridentity != null) {
                    updateData.Inserteridentity = String(updateData.Inserteridentity);
                }
                const updatedInvoice = await prisma.otherInvoice.update({
                    where: { otherInvoiceId: parseInt(updateId) },
                    data: {
                        invoiceNumber: updateData.invoiceNumber,
                        category: updateData.category || null,
                        description: updateData.description || null,
                        amount: parseFloat(updateData.amount),
                        devise: updateData.devise,
                        invoiceDate: new Date(updateData.invoiceDate),
                        paymentDate: updateData.paymentDate ? new Date(updateData.paymentDate) : null,
                        supplier: updateData.supplier,
                        supplierContactId: updateData.supplierContactId ? parseInt(updateData.supplierContactId) : null,
                        status: updateData.status,
                        service: updateData.service || null,
                        attachment: updateData.attachment || null,
                        Inserteridentity: updateData.Inserteridentity !== undefined ? (updateData.Inserteridentity ? String(updateData.Inserteridentity) : null) : undefined,
                        InserterCountry: updateData.InserterCountry !== undefined ? updateData.InserterCountry : undefined,
                    },
                    include: {
                        supplierContact: {
                            select: {
                                contactId: true,
                                firstName: true,
                                lastName: true,
                                companyName: true,
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
                    body: JSON.stringify(updatedInvoice),
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
                        body: JSON.stringify({ error: 'Other Invoice ID is required' }),
                    };
                }
                await prisma.otherInvoice.delete({
                    where: { otherInvoiceId: parseInt(deleteId) },
                });
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ message: 'Other Invoice deleted successfully' }),
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
