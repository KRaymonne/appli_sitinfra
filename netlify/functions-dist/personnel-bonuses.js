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
                const bonuses = await prisma.bonus.findMany({
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
                return json(200, bonuses);
            }
            case 'POST': {
                if (!event.body) {
                    return json(400, { error: 'Missing request body' });
                }
                const payload = JSON.parse(event.body);
                const { userId, bonusType, amount, currency, awardDate, reason, paymentMethod, status, supportingDocument } = payload || {};
                // Basic validation
                const required = {
                    userId,
                    bonusType,
                    amount,
                    currency,
                    awardDate,
                    paymentMethod,
                    status
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
                const created = await prisma.bonus.create({
                    data: {
                        userId: Number(userId),
                        bonusType,
                        amount: Number(amount),
                        currency,
                        awardDate: new Date(awardDate),
                        reason: reason || null,
                        paymentMethod,
                        status,
                        supportingDocument: supportingDocument || null,
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
                    return json(400, { error: 'Missing bonus ID' });
                }
                const payload = JSON.parse(event.body);
                const updateData = {};
                if (payload.userId !== undefined)
                    updateData.userId = Number(payload.userId);
                if (payload.bonusType)
                    updateData.bonusType = payload.bonusType;
                if (payload.amount !== undefined)
                    updateData.amount = Number(payload.amount);
                if (payload.currency)
                    updateData.currency = payload.currency;
                if (payload.awardDate)
                    updateData.awardDate = new Date(payload.awardDate);
                if (payload.reason !== undefined)
                    updateData.reason = payload.reason || null;
                if (payload.paymentMethod)
                    updateData.paymentMethod = payload.paymentMethod;
                if (payload.status)
                    updateData.status = payload.status;
                if (payload.supportingDocument !== undefined)
                    updateData.supportingDocument = payload.supportingDocument || null;
                const updated = await prisma.bonus.update({
                    where: { bonusId: Number(id) },
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
                    return json(400, { error: 'Missing bonus ID' });
                }
                await prisma.bonus.delete({
                    where: { bonusId: Number(id) }
                });
                return json(200, { message: 'Bonus deleted successfully' });
            }
            default:
                return json(405, { error: 'Method not allowed' });
        }
    }
    catch (error) {
        console.error('Bonuses function error', error);
        return json(500, { error: 'Internal Server Error' });
    }
};
