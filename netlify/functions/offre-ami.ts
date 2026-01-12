import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '10', status, InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { name: { contains: search } },
            { activityCode: { contains: search } },
            { client: { contains: search } },
            { object: { contains: search } },
          ];
        }
        if (status && status !== 'all') {
          where.status = status;
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [offreAMI, total] = await Promise.all([
          prisma.offreAMI.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.offreAMI.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            offreAMI,
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
        
        const requiredFields = ['depositDate', 'name', 'client', 'submissionDate', 'object', 'status'];
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

        const newAMI = await prisma.offreAMI.create({
          data: {
            activityCode: postData.activityCode || null,
            depositDate: new Date(postData.depositDate),
            name: postData.name,
            client: postData.client,
            contact: postData.contact || null,
            submissionDate: new Date(postData.submissionDate),
            object: postData.object,
            status: postData.status,
            comment: postData.comment || null,
            soumissionType: postData.soumissionType || null,
            attachment: postData.attachment || null,
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
          body: JSON.stringify(newAMI),
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
            body: JSON.stringify({ error: 'AMI ID is required' }),
          };
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }

        const updatedAMI = await prisma.offreAMI.update({
          where: { amiId: parseInt(updateId) },
          data: {
            activityCode: updateData.activityCode !== undefined ? updateData.activityCode : undefined,
            depositDate: updateData.depositDate ? new Date(updateData.depositDate) : undefined,
            name: updateData.name,
            client: updateData.client,
            contact: updateData.contact !== undefined ? updateData.contact : undefined,
            submissionDate: updateData.submissionDate ? new Date(updateData.submissionDate) : undefined,
            object: updateData.object,
            status: updateData.status,
            comment: updateData.comment !== undefined ? updateData.comment : undefined,
            soumissionType: updateData.soumissionType !== undefined ? updateData.soumissionType : undefined,
            attachment: updateData.attachment !== undefined ? updateData.attachment : undefined,
            Inserteridentity: updateData.Inserteridentity !== undefined ? (updateData.Inserteridentity ? String(updateData.Inserteridentity) : null) : undefined,
            InserterCountry: updateData.InserterCountry !== undefined ? updateData.InserterCountry : undefined,
          },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(updatedAMI),
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
            body: JSON.stringify({ error: 'AMI ID is required' }),
          };
        }

        await prisma.offreAMI.delete({
          where: { amiId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'AMI deleted successfully' }),
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