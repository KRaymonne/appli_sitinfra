import { PrismaClient } from '@prisma/client';
import type { Handler } from '@netlify/functions';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

const json = (statusCode: number, data: unknown) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  },
  body: JSON.stringify(data),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { ok: true });
  }

  try {
    switch (event.httpMethod) {
      case 'GET': {
        const { InserterCountry } = event.queryStringParameters || {};
        const where: any = {};
        
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }
        
        const sanctions = await prisma.sanction.findMany({
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
        return json(200, sanctions);
      }
      case 'POST': {
        if (!event.body) {
          return json(400, { error: 'Missing request body' });
        }
        const payload = JSON.parse(event.body);
        const {
          userId,
          sanctionType,
          reason,
          sanctionDate,
          durationDays,
          decision,
          supportingDocument
        } = payload || {};

        // Basic validation
        const required = {
          userId,
          sanctionType,
          reason,
          sanctionDate
        } as Record<string, unknown>;

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

        const created = await prisma.sanction.create({
          data: {
            userId: Number(userId),
            sanctionType,
            reason,
            sanctionDate: new Date(sanctionDate),
            durationDays: durationDays ? Number(durationDays) : null,
            decision: decision || null,
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
          return json(400, { error: 'Missing sanction ID' });
        }

        const payload = JSON.parse(event.body);
        const updateData: any = {};

        if (payload.userId !== undefined) updateData.userId = Number(payload.userId);
        if (payload.sanctionType) updateData.sanctionType = payload.sanctionType;
        if (payload.reason) updateData.reason = payload.reason;
        if (payload.sanctionDate) updateData.sanctionDate = new Date(payload.sanctionDate);
        if (payload.durationDays !== undefined) updateData.durationDays = payload.durationDays ? Number(payload.durationDays) : null;
        if (payload.decision !== undefined) updateData.decision = payload.decision || null;
        if (payload.supportingDocument !== undefined) updateData.supportingDocument = payload.supportingDocument || null;

        const updated = await prisma.sanction.update({
          where: { sanctionId: Number(id) },
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
          return json(400, { error: 'Missing sanction ID' });
        }

        await prisma.sanction.delete({
          where: { sanctionId: Number(id) }
        });
        return json(200, { message: 'Sanction deleted successfully' });
      }
      default:
        return json(405, { error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Sanctions function error', error);
    return json(500, { error: 'Internal Server Error' });
  }
};

