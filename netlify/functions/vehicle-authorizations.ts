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
            { authorizationNumber: { contains: search } },
            { issuingAuthority: { contains: search } },
            { purpose: { contains: search } },
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

        const [authorizations, total] = await Promise.all([
          prisma.vehicleauthorizations.findMany({
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
          prisma.vehicleauthorizations.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            authorizations,
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
        
        const requiredFields = ['vehicleId', 'authorizationNumber', 'issueDate', 'expiryDate', 'issuingAuthority', 'autorisationtype', 'purpose'];
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
        let issueDate: Date;
        const issueDateObj = new Date(postData.issueDate);
        if (isNaN(issueDateObj.getTime())) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Invalid issueDate format' }),
          };
        }
        issueDate = issueDateObj;

        let expiryDate: Date;
        const expiryDateObj = new Date(postData.expiryDate);
        if (isNaN(expiryDateObj.getTime())) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Invalid expiryDate format' }),
          };
        }
        expiryDate = expiryDateObj;

        const newAuthorization = await prisma.vehicleauthorizations.create({
          data: {
            vehicleId: parseInt(postData.vehicleId),
            authorizationNumber: postData.authorizationNumber,
            issueDate: issueDate,
            expiryDate: expiryDate,
            issuingAuthority: postData.issuingAuthority,
            autorisationtype: postData.autorisationtype,
            purpose: postData.purpose,
            status: postData.status || 'ACTIVE',
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
          body: JSON.stringify(newAuthorization),
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
            body: JSON.stringify({ error: 'Authorization ID is required' }),
          };
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }
        
        // Handle dates properly for updates as well
        let updateIssueDate: Date | undefined = undefined;
        if (updateData.issueDate !== undefined) {
          if (updateData.issueDate === null || updateData.issueDate === '') {
            return {
              statusCode: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'issueDate is required' }),
            };
          } else {
            const date = new Date(updateData.issueDate);
            if (!isNaN(date.getTime())) {
              updateIssueDate = date;
            } else {
              return {
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Invalid issueDate format' }),
              };
            }
          }
        }

        let updateExpiryDate: Date | undefined = undefined;
        if (updateData.expiryDate !== undefined) {
          if (updateData.expiryDate === null || updateData.expiryDate === '') {
            return {
              statusCode: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'expiryDate is required' }),
            };
          } else {
            const date = new Date(updateData.expiryDate);
            if (!isNaN(date.getTime())) {
              updateExpiryDate = date;
            } else {
              return {
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Invalid expiryDate format' }),
              };
            }
          }
        }

        const updatedAuthorization = await prisma.vehicleauthorizations.update({
          where: { authorizationId: parseInt(updateId) },
          data: {
            ...updateData,
            vehicleId: updateData.vehicleId ? parseInt(updateData.vehicleId) : undefined,
            issueDate: updateIssueDate,
            expiryDate: updateExpiryDate,
          },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(updatedAuthorization),
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
            body: JSON.stringify({ error: 'Authorization ID is required' }),
          };
        }

        await prisma.vehicleauthorizations.delete({
          where: { authorizationId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Authorization deleted successfully' }),
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

