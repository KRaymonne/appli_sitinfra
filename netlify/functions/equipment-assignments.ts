import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '50', status } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (status && status !== 'all') {
          where.status = status;
        }

        const [assignments, total] = await Promise.all([
          prisma.assignment.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
            include: {
              equipment: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          }),
          prisma.assignment.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            assignments,
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
        
        const requiredFields = ['equipmentId', 'userId', 'assignmentDate', 'status'];
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
        const newAssignment = await prisma.assignment.create({
          data: {
            equipmentId: parseInt(postData.equipmentId),
            userId: parseInt(postData.userId),
            assignmentDate: new Date(postData.assignmentDate),
            returnDate: postData.returnDate ? new Date(postData.returnDate) : null,
            purpose: postData.purpose || null,
            notes: postData.notes || null,
            status: postData.status,
            attachmentFile: postData.attachmentFile || null,
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
          body: JSON.stringify(newAssignment),
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
            body: JSON.stringify({ error: 'Assignment ID is required' }),
          };
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }
        const updatedAssignment = await prisma.assignment.update({
          where: { assignmentId: parseInt(updateId) },
          data: {
            equipmentId: updateData.equipmentId ? parseInt(updateData.equipmentId) : undefined,
            userId: updateData.userId ? parseInt(updateData.userId) : undefined,
            assignmentDate: updateData.assignmentDate ? new Date(updateData.assignmentDate) : undefined,
            returnDate: updateData.returnDate ? new Date(updateData.returnDate) : undefined,
            purpose: updateData.purpose !== undefined ? updateData.purpose : undefined,
            notes: updateData.notes !== undefined ? updateData.notes : undefined,
            status: updateData.status,
            attachmentFile: updateData.attachmentFile !== undefined ? updateData.attachmentFile : undefined,
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
          body: JSON.stringify(updatedAssignment),
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
            body: JSON.stringify({ error: 'Assignment ID is required' }),
          };
        }

        await prisma.assignment.delete({
          where: { assignmentId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Assignment deleted successfully' }),
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

