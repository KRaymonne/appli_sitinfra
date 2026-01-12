import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '10', serviceType, status, InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { invoiceNumber: { contains: search } },
            { supplier: { contains: search } },
            { description: { contains: search } },
          ];
        }
        if (serviceType && serviceType !== 'all') {
          where.serviceType = serviceType;
        }
        if (status && status !== 'all') {
          where.status = status;
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [professionalServices, total] = await Promise.all([
          prisma.professionalService.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.professionalService.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            professionalServices,
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
        
        const requiredFields = ['invoiceNumber', 'serviceType', 'supplier', 'amount', 'devise', 'invoiceDate', 'status'];
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

        const newService = await prisma.professionalService.create({
          data: {
            invoiceNumber: postData.invoiceNumber,
            serviceType: postData.serviceType,
            supplier: postData.supplier,
            amount: parseFloat(postData.amount),
            devise: postData.devise,
            invoiceDate: new Date(postData.invoiceDate),
            paymentDate: postData.paymentDate ? new Date(postData.paymentDate) : null,
            description: postData.description || null,
            paymentMethod: postData.paymentMethod || null,
            status: postData.status,
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
          body: JSON.stringify(newService),
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
            body: JSON.stringify({ error: 'Professional Service ID is required' }),
          };
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }

        const updatedService = await prisma.professionalService.update({
          where: { professionalServiceId: parseInt(updateId) },
          data: {
            invoiceNumber: updateData.invoiceNumber,
            serviceType: updateData.serviceType,
            supplier: updateData.supplier,
            amount: parseFloat(updateData.amount),
            devise: updateData.devise,
            invoiceDate: new Date(updateData.invoiceDate),
            paymentDate: updateData.paymentDate ? new Date(updateData.paymentDate) : null,
            description: updateData.description || null,
            paymentMethod: updateData.paymentMethod || null,
            status: updateData.status,
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
          body: JSON.stringify(updatedService),
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
            body: JSON.stringify({ error: 'Professional Service ID is required' }),
          };
        }

        await prisma.professionalService.delete({
          where: { professionalServiceId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Professional Service deleted successfully' }),
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

