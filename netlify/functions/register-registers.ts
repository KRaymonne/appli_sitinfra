import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '10', InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { registerName: { contains: search } },
            { location: { contains: search } },
          ];
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [registers, total] = await Promise.all([
          prisma.register.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
            include: {
              User: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          }),
          prisma.register.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            registers,
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
        
        const requiredFields = ['registerName', 'location', 'responsiblename'];
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

        const newRegister = await prisma.register.create({
          data: {
            registerName: postData.registerName,
            location: postData.location,
            responsiblename: postData.responsiblename,
            userId: postData.userId ? parseInt(postData.userId) : null,
            currentBalance: parseFloat(postData.currentBalance) || 0.0,
            devise: postData.devise || 'XAF',
            attachmentfile: postData.attachmentfile || null,
            Inserteridentity: postData.Inserteridentity || null,
            InserterCountry: postData.InserterCountry || null,
          },
          include: {
            User: {
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
          body: JSON.stringify(newRegister),
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
            body: JSON.stringify({ error: 'Register ID is required' }),
          };
        }

        const dataToUpdate: any = {};
        if (updateData.registerName !== undefined) dataToUpdate.registerName = updateData.registerName;
        if (updateData.location !== undefined) dataToUpdate.location = updateData.location;
        if (updateData.responsiblename !== undefined) dataToUpdate.responsiblename = updateData.responsiblename;
        if (updateData.userId !== undefined) dataToUpdate.userId = updateData.userId ? parseInt(updateData.userId) : null;
        if (updateData.currentBalance !== undefined) dataToUpdate.currentBalance = parseFloat(updateData.currentBalance);
        if (updateData.devise !== undefined) dataToUpdate.devise = updateData.devise;
        if (updateData.attachmentfile !== undefined) dataToUpdate.attachmentfile = updateData.attachmentfile;
        if (updateData.Inserteridentity !== undefined) {
          dataToUpdate.Inserteridentity = updateData.Inserteridentity ? String(updateData.Inserteridentity) : null;
        }
        if (updateData.InserterCountry !== undefined) dataToUpdate.InserterCountry = updateData.InserterCountry;

        const updatedRegister = await prisma.register.update({
          where: { registerId: parseInt(updateId) },
          data: dataToUpdate,
          include: {
            User: {
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
          body: JSON.stringify(updatedRegister),
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
            body: JSON.stringify({ error: 'Register ID is required' }),
          };
        }

        await prisma.register.delete({
          where: { registerId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Register deleted successfully' }),
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

