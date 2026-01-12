import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '10', type, InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { name: { contains: search } },
            { vendor: { contains: search } },
            { version: { contains: search } },
            { description: { contains: search } },
          ];
        }
        if (type && type !== 'all') {
          where.type = type;
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [softwares, total] = await Promise.all([
          prisma.software.findMany({
            where,
            skip,
            take: limitNum,
            include: {
              maintenance: {
                select: {
                  endDate: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.software.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            softwares,
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

        const requiredFields = ['name', 'vendor', 'version', 'type', 'purchaseDate', 'amount', 'licenseCount'];
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

        const newSoftware = await prisma.software.create({
          data: {
            name: postData.name,
            vendor: postData.vendor,
            version: postData.version,
            type: postData.type,
            purchaseDate: new Date(postData.purchaseDate),
            amount: parseFloat(postData.amount),
            currency: postData.currency || 'XAF',
            licenseCount: parseInt(postData.licenseCount),
            description: postData.description || null,
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
          body: JSON.stringify(newSoftware),
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
            body: JSON.stringify({ error: 'Software ID is required' }),
          };
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }

        const updatedSoftware = await prisma.software.update({
          where: { softwareId: parseInt(updateId) },
          data: {
            name: updateData.name,
            vendor: updateData.vendor,
            version: updateData.version,
            type: updateData.type,
            purchaseDate: updateData.purchaseDate ? new Date(updateData.purchaseDate) : undefined,
            amount: updateData.amount ? parseFloat(updateData.amount) : undefined,
            currency: updateData.currency,
            licenseCount: updateData.licenseCount ? parseInt(updateData.licenseCount) : undefined,
            description: updateData.description,
          },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(updatedSoftware),
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
            body: JSON.stringify({ error: 'Software ID is required' }),
          };
        }

        await prisma.software.delete({
          where: { softwareId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Software deleted successfully' }),
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

