import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '50', maintenanceType } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (maintenanceType && maintenanceType !== 'all') {
          where.maintenanceType = maintenanceType;
        }

        const [maintenances, total] = await Promise.all([
          prisma.maintenance.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
            include: {
              equipment: true,
            },
          }),
          prisma.maintenance.count({ where }),
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
        
        const requiredFields = ['equipmentId', 'maintenanceDate', 'maintenanceType', 'amount', 'supplier', 'devise'];
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
        const newMaintenance = await prisma.maintenance.create({
          data: {
            equipmentId: parseInt(postData.equipmentId),
            maintenanceDate: new Date(postData.maintenanceDate),
            maintenanceType: postData.maintenanceType,
            description: postData.description || null,
            amount: parseFloat(postData.amount),
            supplier: postData.supplier,
            technician: postData.technician || null,
            downtimeHours: postData.downtimeHours ? parseInt(postData.downtimeHours) : null,
            nextMaintenanceDate: postData.nextMaintenanceDate ? new Date(postData.nextMaintenanceDate) : null,
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
        const updatedMaintenance = await prisma.maintenance.update({
          where: { maintenanceId: parseInt(updateId) },
          data: {
            equipmentId: updateData.equipmentId ? parseInt(updateData.equipmentId) : undefined,
            maintenanceDate: updateData.maintenanceDate ? new Date(updateData.maintenanceDate) : undefined,
            maintenanceType: updateData.maintenanceType,
            description: updateData.description || undefined,
            amount: updateData.amount ? parseFloat(updateData.amount) : undefined,
            supplier: updateData.supplier,
            technician: updateData.technician || undefined,
            downtimeHours: updateData.downtimeHours ? parseInt(updateData.downtimeHours) : undefined,
            nextMaintenanceDate: updateData.nextMaintenanceDate ? new Date(updateData.nextMaintenanceDate) : undefined,
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

        await prisma.maintenance.delete({
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

