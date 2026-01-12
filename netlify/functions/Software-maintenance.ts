import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '10', maintenanceType, periodicity, InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { provider: { contains: search } },
            { software: { name: { contains: search } } },
            { software: { vendor: { contains: search } } },
            { observations: { contains: search } },
          ];
        }
        if (maintenanceType && maintenanceType !== 'all') {
          where.maintenanceType = maintenanceType;
        }
        if (periodicity && periodicity !== 'all') {
          where.periodicity = periodicity;
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [maintenances, total] = await Promise.all([
          prisma.softwareMaintenance.findMany({
            where,
            skip,
            take: limitNum,
            include: {
              software: {
                select: {
                  name: true,
                  version: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.softwareMaintenance.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            maintenances,
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

        const requiredFields = ['softwareId', 'provider', 'startDate', 'endDate', 'price', 'periodicity', 'maintenanceType'];
        for (const field of requiredFields) {
          if (postData[field] === undefined || postData[field] === null) {
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

        const newMaintenance = await prisma.softwareMaintenance.create({
          data: {
            softwareId: parseInt(postData.softwareId),
            provider: postData.provider,
            startDate: postData.startDate,
            endDate: postData.endDate,
            price: parseFloat(postData.price),
            currency: postData.currency || 'XAF',
            periodicity: postData.periodicity,
            maintenanceType: postData.maintenanceType,
            observations: postData.observations || null,
            Inserteridentity: postData.Inserteridentity || null,
            InserterCountry: postData.InserterCountry || null,
          },
          include: {
            software: {
              select: {
                name: true,
                version: true,
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
          body: JSON.stringify(newMaintenance),
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
            body: JSON.stringify({ error: 'Maintenance ID is required' }),
          };
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }

        const updatedMaintenance = await prisma.softwareMaintenance.update({
          where: { maintenanceId: parseInt(updateId) },
          data: {
            provider: updateData.provider,
            startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
            endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
            price: updateData.price ? parseFloat(updateData.price) : undefined,
            currency: updateData.currency,
            periodicity: updateData.periodicity,
            maintenanceType: updateData.maintenanceType,
            observations: updateData.observations,
          },
          include: {
            software: {
              select: {
                name: true,
                version: true,
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
          body: JSON.stringify(updatedMaintenance),
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
            body: JSON.stringify({ error: 'Maintenance ID is required' }),
          };
        }

        await prisma.softwareMaintenance.delete({
          where: { maintenanceId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Maintenance deleted successfully' }),
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
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  } finally {
    await prisma.$disconnect();
  }
};

