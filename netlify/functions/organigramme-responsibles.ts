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
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  },
  body: JSON.stringify(data),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { ok: true });
  }

  try {
    if (event.httpMethod === 'GET') {
      // Récupérer les paramètres de requête
      const { workcountry, structureName } = event.queryStringParameters || {};

      // Construire les filtres
      const where: any = {
        isStructureResponsible: true,
      };

      if (workcountry) {
        where.workcountry = workcountry;
      }

      if (structureName) {
        where.structureName = structureName;
      }

      // Récupérer les utilisateurs responsables de structure
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          employeeNumber: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          dateOfBirth: true,
          placeOfBirth: true,
          devise: true,
          civilityDropdown: true,
          maritalStatus: true,
          nationality: true,
          identityType: true,
          identity: true,
          workcountry: true,
          structureName: true,
          isStructureResponsible: true,
          address: true,
          phone: true,
          phoneno: true,
          gender: true,
          country: true,
          emergencyName: true,
          emergencyContact: true,
          childrenCount: true,
          department: true,
          salary: true,
          hireDate: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          lastName: 'asc',
        },
      });

      return json(200, { users });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Error fetching structure responsibles:', error);
    return json(500, { error: 'Internal server error' });
  }
};

