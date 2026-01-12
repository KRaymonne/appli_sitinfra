import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '10', priority, type, InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { title: { contains: search } },
            { description: { contains: search } },
            { type: { contains: search } },
          ];
        }
        if (priority && priority !== 'all') {
          where.priority = priority;
        }
        if (type && type !== 'all') {
          where.type = type;
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [alerts, total] = await Promise.all([
          prisma.alert.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { dueDate: 'asc' },
            include: {
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
          prisma.alert.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            alerts,
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
        
        const requiredFields = ['title', 'dueDate', 'priority', 'type'];
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

        // Validate priority enum
        const validPriorities = ['HIGH', 'MEDIUM', 'LOW'];
        if (!validPriorities.includes(postData.priority)) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Invalid priority value' }),
          };
        }

        if (postData && postData.Inserteridentity != null) {
          postData.Inserteridentity = String(postData.Inserteridentity);
        }

        const newAlert = await prisma.alert.create({
          data: {
            title: postData.title,
            description: postData.description || null,
            dueDate: new Date(postData.dueDate),
            dueTime: postData.dueTime || null,
            priority: postData.priority,
            type: postData.type,
            userId: postData.userId ? parseInt(postData.userId) : null,
            Inserteridentity: postData.Inserteridentity || null,
            InserterCountry: postData.InserterCountry || null,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
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
          body: JSON.stringify(newAlert),
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
            body: JSON.stringify({ error: 'Alert ID is required' }),
          };
        }

        // Validate priority enum if provided
        if (updateData.priority) {
          const validPriorities = ['HIGH', 'MEDIUM', 'LOW'];
          if (!validPriorities.includes(updateData.priority)) {
            return {
              statusCode: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'Invalid priority value' }),
            };
          }
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }

        const dataToUpdate: any = {};
        if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
        if (updateData.description !== undefined) dataToUpdate.description = updateData.description || null;
        if (updateData.dueDate !== undefined) dataToUpdate.dueDate = new Date(updateData.dueDate);
        if (updateData.dueTime !== undefined) dataToUpdate.dueTime = updateData.dueTime || null;
        if (updateData.priority !== undefined) dataToUpdate.priority = updateData.priority;
        if (updateData.type !== undefined) dataToUpdate.type = updateData.type;
        if (updateData.userId !== undefined) dataToUpdate.userId = updateData.userId ? parseInt(updateData.userId) : null;
        if (updateData.Inserteridentity !== undefined) {
          dataToUpdate.Inserteridentity = updateData.Inserteridentity ? String(updateData.Inserteridentity) : null;
        }
        if (updateData.InserterCountry !== undefined) dataToUpdate.InserterCountry = updateData.InserterCountry;

        const updatedAlert = await prisma.alert.update({
          where: { alertId: parseInt(updateId) },
          data: dataToUpdate,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
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
          body: JSON.stringify(updatedAlert),
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
            body: JSON.stringify({ error: 'Alert ID is required' }),
          };
        }

        await prisma.alert.delete({
          where: { alertId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Alert deleted successfully' }),
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

