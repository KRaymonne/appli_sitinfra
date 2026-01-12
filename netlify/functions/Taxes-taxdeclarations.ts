import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '10', status, taxType, InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { referenceNumber: { contains: search } },
            { notes: { contains: search } },
          ];
        }
        if (status && status !== 'all') {
          where.status = status;
        }
        if (taxType && taxType !== 'all') {
          where.taxType = taxType;
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [taxDeclarations, total] = await Promise.all([
          prisma.taxDeclaration.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { declarationDate: 'desc' },
          }),
          prisma.taxDeclaration.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            taxDeclarations,
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
        
        const requiredFields = ['taxType', 'taxAmount', 'declarationDate', 'status', 'referenceNumber'];
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

        // Validate TaxType enum
        const validTaxTypes = ['VAT', 'INCOME_TAX', 'CORPORATE_TAX', 'SOCIAL_CONTRIBUTIONS', 'OTHER_TAX'];
        if (!validTaxTypes.includes(postData.taxType)) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Invalid taxType value' }),
          };
        }

        // Validate TaxStatus enum
        const validStatuses = ['TO_PAY', 'PAID', 'OVERDUE'];
        if (!validStatuses.includes(postData.status)) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Invalid status value' }),
          };
        }

        const newTaxDeclaration = await prisma.taxDeclaration.create({
          data: {
            taxType: postData.taxType,
            taxAmount: parseFloat(postData.taxAmount),
            penalties: postData.penalties ? parseFloat(postData.penalties) : 0,
            declarationDate: new Date(postData.declarationDate),
            paymentDate: postData.paymentDate ? new Date(postData.paymentDate) : null,
            status: postData.status,
            devise: postData.devise || 'XAF',
            referenceNumber: postData.referenceNumber,
            notes: postData.notes || null,
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
          body: JSON.stringify(newTaxDeclaration),
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
            body: JSON.stringify({ error: 'Tax declaration ID is required' }),
          };
        }

        // Validate enums if provided
        if (updateData.taxType) {
          const validTaxTypes = ['VAT', 'INCOME_TAX', 'CORPORATE_TAX', 'SOCIAL_CONTRIBUTIONS', 'OTHER_TAX'];
          if (!validTaxTypes.includes(updateData.taxType)) {
            return {
              statusCode: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'Invalid taxType value' }),
            };
          }
        }

        if (updateData.status) {
          const validStatuses = ['TO_PAY', 'PAID', 'OVERDUE'];
          if (!validStatuses.includes(updateData.status)) {
            return {
              statusCode: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'Invalid status value' }),
            };
          }
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }

        const dataToUpdate: any = {};
        if (updateData.taxType !== undefined) dataToUpdate.taxType = updateData.taxType;
        if (updateData.taxAmount !== undefined) dataToUpdate.taxAmount = parseFloat(updateData.taxAmount);
        if (updateData.penalties !== undefined) dataToUpdate.penalties = parseFloat(updateData.penalties);
        if (updateData.declarationDate !== undefined) dataToUpdate.declarationDate = new Date(updateData.declarationDate);
        if (updateData.paymentDate !== undefined) dataToUpdate.paymentDate = updateData.paymentDate ? new Date(updateData.paymentDate) : null;
        if (updateData.status !== undefined) dataToUpdate.status = updateData.status;
        if (updateData.devise !== undefined) dataToUpdate.devise = updateData.devise;
        if (updateData.referenceNumber !== undefined) dataToUpdate.referenceNumber = updateData.referenceNumber;
        if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes || null;
        if (updateData.Inserteridentity !== undefined) {
          dataToUpdate.Inserteridentity = updateData.Inserteridentity ? String(updateData.Inserteridentity) : null;
        }
        if (updateData.InserterCountry !== undefined) dataToUpdate.InserterCountry = updateData.InserterCountry;

        const updatedTaxDeclaration = await prisma.taxDeclaration.update({
          where: { id: parseInt(updateId) },
          data: dataToUpdate,
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(updatedTaxDeclaration),
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
            body: JSON.stringify({ error: 'Tax declaration ID is required' }),
          };
        }

        await prisma.taxDeclaration.delete({
          where: { id: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Tax declaration deleted successfully' }),
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

