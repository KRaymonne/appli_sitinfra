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
        
        const absences = await prisma.absence.findMany({
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
        return json(200, absences);
      }
      case 'POST': {
        if (!event.body) {
          return json(400, { error: 'Missing request body' });
        }
        const payload = JSON.parse(event.body);
        const {
          userId,
          absenceType,
          description,
          startDate,
          endDate,
          daysCount,
          returnDate,
          supportingDocument,
          Inserteridentity,
          InserterCountry
        } = payload || {};

        // Basic validation
        const required = {
          userId,
          absenceType,
          startDate,
          endDate,
          daysCount,
          returnDate
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

        const created = await prisma.absence.create({
          data: {
            userId: Number(userId),
            absenceType,
            description: description || null,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            daysCount: Number(daysCount),
            returnDate: new Date(returnDate),
            supportingDocument: supportingDocument || null,
            Inserteridentity: Inserteridentity != null ? String(Inserteridentity) : null,
            InserterCountry: InserterCountry || null
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
          return json(400, { error: 'Missing absence ID' });
        }

        const payload = JSON.parse(event.body);
        const updateData: any = {};

        if (payload.userId !== undefined) updateData.userId = Number(payload.userId);
        if (payload.absenceType) updateData.absenceType = payload.absenceType;
        if (payload.description !== undefined) updateData.description = payload.description || null;
        if (payload.startDate) updateData.startDate = new Date(payload.startDate);
        if (payload.endDate) updateData.endDate = new Date(payload.endDate);
        if (payload.daysCount !== undefined) updateData.daysCount = Number(payload.daysCount);
        if (payload.returnDate) updateData.returnDate = new Date(payload.returnDate);
        if (payload.supportingDocument !== undefined) updateData.supportingDocument = payload.supportingDocument || null;

        const updated = await prisma.absence.update({
          where: { absenceId: Number(id) },
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
          return json(400, { error: 'Missing absence ID' });
        }

        await prisma.absence.delete({
          where: { absenceId: Number(id) }
        });
        return json(200, { message: 'Absence deleted successfully' });
      }
      default:
        return json(405, { error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Absences function error', error);
    return json(500, { error: 'Internal Server Error' });
  }
};

