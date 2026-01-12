import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '10', status, vehicleId, InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { description: { contains: search } },
            { conclusion: { contains: search } },
          ];
        }
        if (status && status !== 'all') {
          where.status = status;
        }
        if (vehicleId) {
          where.vehicleId = parseInt(vehicleId);
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [contentieux, total] = await Promise.all([
          prisma.contentieux.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
            include: {
              vehicle: {
                select: {
                  vehicleId: true,
                  licensePlate: true,
                  brand: true,
                  model: true,
                },
              },
            },
          }),
          prisma.contentieux.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            contentieux,
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
        
        const requiredFields = ['vehicleId', 'incidentDate', 'description', 'faultAttribution', 'status'];
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

        // Handle dates properly - validate required dates
        let incidentDate: Date;
        const incidentDateObj = new Date(postData.incidentDate);
        if (isNaN(incidentDateObj.getTime())) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Invalid incidentDate format' }),
          };
        }
        incidentDate = incidentDateObj;

        let resolutionDate: Date | null = null;
        if (postData.resolutionDate && postData.resolutionDate.trim() !== '') {
          const resolutionDateObj = new Date(postData.resolutionDate);
          if (!isNaN(resolutionDateObj.getTime())) {
            resolutionDate = resolutionDateObj;
          }
        }

        const newContentieux = await prisma.contentieux.create({
          data: {
            vehicleId: parseInt(postData.vehicleId),
            incidentDate: incidentDate,
            description: postData.description,
            faultAttribution: postData.faultAttribution,
            conclusion: postData.conclusion || null,
            status: postData.status,
            resolutionDate: resolutionDate,
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
          body: JSON.stringify(newContentieux),
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
            body: JSON.stringify({ error: 'Contentieux ID is required' }),
          };
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }
        
        // Handle dates properly for updates as well
        let updateIncidentDate: Date | undefined = undefined;
        if (updateData.incidentDate !== undefined) {
          if (updateData.incidentDate === null || updateData.incidentDate === '') {
            return {
              statusCode: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'incidentDate is required' }),
            };
          } else {
            const date = new Date(updateData.incidentDate);
            if (!isNaN(date.getTime())) {
              updateIncidentDate = date;
            } else {
              return {
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Invalid incidentDate format' }),
              };
            }
          }
        }

        let updateResolutionDate: Date | null | undefined = undefined;
        if (updateData.resolutionDate !== undefined) {
          if (updateData.resolutionDate === null || updateData.resolutionDate === '') {
            updateResolutionDate = null; // Explicitly set to null if empty
          } else {
            const date = new Date(updateData.resolutionDate);
            if (!isNaN(date.getTime())) {
              updateResolutionDate = date;
            } else {
              updateResolutionDate = null; // Invalid date, set to null
            }
          }
        }

        const updatedContentieux = await prisma.contentieux.update({
          where: { contentieuxId: parseInt(updateId) },
          data: {
            ...updateData,
            vehicleId: updateData.vehicleId ? parseInt(updateData.vehicleId) : undefined,
            incidentDate: updateIncidentDate,
            resolutionDate: updateResolutionDate !== undefined ? updateResolutionDate : undefined,
          },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(updatedContentieux),
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
            body: JSON.stringify({ error: 'Contentieux ID is required' }),
          };
        }

        await prisma.contentieux.delete({
          where: { contentieuxId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Contentieux deleted successfully' }),
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

