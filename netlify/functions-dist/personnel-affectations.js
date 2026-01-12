import { PrismaClient } from '@prisma/client';
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
const json = (statusCode, data) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(data),
});
export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return json(200, { ok: true });
    }
    try {
        switch (event.httpMethod) {
            case 'GET': {
                const { InserterCountry } = event.queryStringParameters || {};
                const where = {};
                if (InserterCountry) {
                    where.InserterCountry = InserterCountry;
                }
                const affectations = await prisma.affectation.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                employeeNumber: true,
                                email: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                });
                return json(200, affectations);
            }
            case 'POST': {
                if (!event.body) {
                    return json(400, { error: 'Missing request body' });
                }
                const payload = JSON.parse(event.body);
                const { userId, workLocation, site, affectationtype, description, startDate, endDate, attached_file } = payload || {};
                // Basic validation
                const required = {
                    userId,
                    workLocation,
                    site,
                    affectationtype,
                    startDate
                };
                const missing = Object.entries(required)
                    .filter(([, v]) => v === undefined || v === null || v === '')
                    .map(([k]) => k);
                if (missing.length > 0) {
                    return json(400, { error: `Missing fields: ${missing.join(', ')}` });
                }
                // Validate user exists
                const user = await prisma.user.findUnique({
                    where: { id: Number(userId) }
                });
                if (!user) {
                    return json(400, { error: 'User not found' });
                }
                const created = await prisma.affectation.create({
                    data: {
                        userId: Number(userId),
                        workLocation,
                        site,
                        affectationtype,
                        description: description || null,
                        startDate: new Date(startDate),
                        endDate: endDate ? new Date(endDate) : null,
                        attached_file: attached_file || null,
                        Inserteridentity: payload?.Inserteridentity != null ? String(payload.Inserteridentity) : null,
                        InserterCountry: payload?.InserterCountry || null
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                employeeNumber: true,
                                email: true
                            }
                        }
                    }
                });
                return json(201, created);
            }
            case 'PUT': {
                if (!event.body) {
                    return json(400, { error: 'Missing request body' });
                }
                const { id } = event.queryStringParameters || {};
                if (!id) {
                    return json(400, { error: 'Missing affectation ID' });
                }
                const payload = JSON.parse(event.body);
                const updateData = {};
                if (payload.userId !== undefined)
                    updateData.userId = Number(payload.userId);
                if (payload.workLocation)
                    updateData.workLocation = payload.workLocation;
                if (payload.site)
                    updateData.site = payload.site;
                if (payload.affectationtype)
                    updateData.affectationtype = payload.affectationtype;
                if (payload.description !== undefined)
                    updateData.description = payload.description || null;
                if (payload.startDate)
                    updateData.startDate = new Date(payload.startDate);
                if (payload.endDate !== undefined)
                    updateData.endDate = payload.endDate ? new Date(payload.endDate) : null;
                if (payload.attached_file !== undefined)
                    updateData.attached_file = payload.attached_file || null;
                const updated = await prisma.affectation.update({
                    where: { affectationsId: Number(id) },
                    data: updateData,
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                employeeNumber: true,
                                email: true
                            }
                        }
                    }
                });
                return json(200, updated);
            }
            case 'DELETE': {
                const { id } = event.queryStringParameters || {};
                if (!id) {
                    return json(400, { error: 'Missing affectation ID' });
                }
                await prisma.affectation.delete({
                    where: { affectationsId: Number(id) }
                });
                return json(200, { message: 'Affectation deleted successfully' });
            }
            default:
                return json(405, { error: 'Method not allowed' });
        }
    }
    catch (error) {
        console.error('Affectations function error', error);
        return json(500, { error: 'Internal Server Error' });
    }
};
