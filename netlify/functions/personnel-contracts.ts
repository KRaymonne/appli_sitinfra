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
        
        const contracts = await prisma.contract.findMany({
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
        return json(200, contracts);
      }
      case 'POST': {
        if (!event.body) {
          return json(400, { error: 'Missing request body' });
        }
        const payload = JSON.parse(event.body);
        const {
          userId,
          contractType,
          startDate,
          endDate,
          post,
          department,
          unit,
          grossSalary,
          netSalary,
          currency,
          contractFile
        } = payload || {};

        // Basic validation
        const required = {
          userId,
          contractType,
          startDate,
          post,
          department,
          grossSalary,
          netSalary,
          currency
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

        const created = await prisma.contract.create({
          data: {
            userId: Number(userId),
            contractType,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            post,
            department,
            unit: unit || null,
            grossSalary: Number(grossSalary),
            netSalary: Number(netSalary),
            currency,
            contractFile: contractFile || null,
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
          return json(400, { error: 'Missing contract ID' });
        }

        const payload = JSON.parse(event.body);
        const updateData: any = {};

        if (payload.userId !== undefined) updateData.userId = Number(payload.userId);
        if (payload.contractType) updateData.contractType = payload.contractType;
        if (payload.startDate) updateData.startDate = new Date(payload.startDate);
        if (payload.endDate !== undefined) updateData.endDate = payload.endDate ? new Date(payload.endDate) : null;
        if (payload.post) updateData.post = payload.post;
        if (payload.department) updateData.department = payload.department;
        if (payload.unit !== undefined) updateData.unit = payload.unit || null;
        if (payload.grossSalary !== undefined) updateData.grossSalary = Number(payload.grossSalary);
        if (payload.netSalary !== undefined) updateData.netSalary = Number(payload.netSalary);
        if (payload.currency) updateData.currency = payload.currency;
        if (payload.contractFile !== undefined) updateData.contractFile = payload.contractFile || null;

        const updated = await prisma.contract.update({
          where: { contractId: Number(id) },
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
          return json(400, { error: 'Missing contract ID' });
        }

        await prisma.contract.delete({
          where: { contractId: Number(id) }
        });
        return json(200, { message: 'Contract deleted successfully' });
      }
      default:
        return json(405, { error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Contracts function error', error);
    return json(500, { error: 'Internal Server Error' });
  }
};

