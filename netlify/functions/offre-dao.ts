import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '10', status, submissionType, InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { daoNumber: { contains: search } },
            { activityCode: { contains: search } },
            { object: { contains: search } },
          ];
        }
        if (status && status !== 'all') {
          where.status = status;
        }
        if (submissionType && submissionType !== 'all') {
          where.submissionType = submissionType;
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [offreDAO, total] = await Promise.all([
          prisma.offreDAO.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.offreDAO.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            offreDAO,
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
        
        const requiredFields = ['transmissionDate', 'daoNumber', 'clientname', 'submissionType', 'object', 'status'];
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

        const newDAO = await prisma.offreDAO.create({
          data: {
            activityCode: postData.activityCode || null,
            transmissionDate: new Date(postData.transmissionDate),
            daoNumber: postData.daoNumber,
            clientname: postData.clientname,
            contactname: postData.contactname || null,
            submissionDate: postData.submissionDate ? new Date(postData.submissionDate) : null,
            submissionType: postData.submissionType,
            object: postData.object,
            status: postData.status,
            attachment: postData.attachment || null,
            devise: postData.devise || 'XAF',
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
          body: JSON.stringify(newDAO),
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
            body: JSON.stringify({ error: 'DAO ID is required' }),
          };
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }

        const updatedDAO = await prisma.offreDAO.update({
          where: { daoId: parseInt(updateId) },
          data: {
            activityCode: updateData.activityCode !== undefined ? updateData.activityCode : undefined,
            transmissionDate: updateData.transmissionDate ? new Date(updateData.transmissionDate) : undefined,
            daoNumber: updateData.daoNumber,
            clientname: updateData.clientname,
            contactname: updateData.contactname !== undefined ? updateData.contactname : undefined,
            submissionDate: updateData.submissionDate !== undefined ? (updateData.submissionDate ? new Date(updateData.submissionDate) : null) : undefined,
            submissionType: updateData.submissionType,
            object: updateData.object,
            status: updateData.status,
            attachment: updateData.attachment !== undefined ? updateData.attachment : undefined,
            devise: updateData.devise !== undefined ? updateData.devise : undefined,
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
          body: JSON.stringify(updatedDAO),
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
            body: JSON.stringify({ error: 'DAO ID is required' }),
          };
        }

        await prisma.offreDAO.delete({
          where: { daoId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'DAO deleted successfully' }),
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

