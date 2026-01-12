import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '10', chargeType, status, InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { description: { contains: search } },
            { service: { contains: search } },
          ];
        }
        if (chargeType && chargeType !== 'all') {
          where.chargeType = chargeType;
        }
        if (status && status !== 'all') {
          where.status = status;
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [companyExpenses, total] = await Promise.all([
          prisma.companyExpense.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  employeeNumber: true,
                },
              },
            },
          }),
          prisma.companyExpense.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            companyExpenses,
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
        
        const requiredFields = ['chargeType', 'amount', 'devise', 'paymentDate', 'status'];
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

        const newExpense = await prisma.companyExpense.create({
          data: {
            chargeType: postData.chargeType,
            userId: postData.userId ? parseInt(postData.userId) : null,
            amount: parseFloat(postData.amount),
            devise: postData.devise,
            paymentDate: new Date(postData.paymentDate),
            description: postData.description || null,
            status: postData.status,
            service: postData.service || null,
            attachment: postData.attachment || null,
            Inserteridentity: postData.Inserteridentity || null,
            InserterCountry: postData.InserterCountry || null,
          },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeNumber: true,
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
          body: JSON.stringify(newExpense),
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
            body: JSON.stringify({ error: 'Company Expense ID is required' }),
          };
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }

        const updatedExpense = await prisma.companyExpense.update({
          where: { companyExpenseId: parseInt(updateId) },
          data: {
            chargeType: updateData.chargeType,
            userId: updateData.userId ? parseInt(updateData.userId) : null,
            amount: parseFloat(updateData.amount),
            devise: updateData.devise,
            paymentDate: new Date(updateData.paymentDate),
            description: updateData.description || null,
            status: updateData.status,
            service: updateData.service || null,
            attachment: updateData.attachment || null,
            Inserteridentity: updateData.Inserteridentity !== undefined ? (updateData.Inserteridentity ? String(updateData.Inserteridentity) : null) : undefined,
            InserterCountry: updateData.InserterCountry !== undefined ? updateData.InserterCountry : undefined,
          },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeNumber: true,
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
          body: JSON.stringify(updatedExpense),
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
            body: JSON.stringify({ error: 'Company Expense ID is required' }),
          };
        }

        await prisma.companyExpense.delete({
          where: { companyExpenseId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Company Expense deleted successfully' }),
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

