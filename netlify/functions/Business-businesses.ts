import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  // Handle file upload separately if needed
  if (httpMethod === 'POST' && event.headers['content-type']?.includes('multipart/form-data')) {
    // This would handle actual file uploads in a real implementation
    // For now, we'll just return a placeholder response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'File upload endpoint - not implemented in this demo' }),
    };
  }

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '100', status, InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { name: { contains: search } },
            { client: { contains: search } },
            { comment: { contains: search } },
          ];
        }
        if (status && status !== 'all') {
          where.status = status;
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [businesses, total] = await Promise.all([
          prisma.business.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.business.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            businesses,
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
        
        const requiredFields = ['name', 'status', 'client', 'startDate', 'estimatedCost', 'salePrice'];
        for (const field of requiredFields) {
          if (postData[field] === undefined || postData[field] === null || postData[field] === '') {
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

        // Handle contact field - convert to integer or null
        let contactValue: number | null = null;
        if (postData.contact) {
          const contactInt = parseInt(postData.contact);
          if (!isNaN(contactInt)) {
            contactValue = contactInt;
          }
        }

        const newBusiness = await prisma.business.create({
          data: {
            name: postData.name,
            status: postData.status,
            client: postData.client,
            contact: contactValue,
            startDate: new Date(postData.startDate),
            endDate: postData.endDate ? new Date(postData.endDate) : null,
            estimatedCost: parseFloat(postData.estimatedCost),
            salePrice: parseFloat(postData.salePrice),
            devise: postData.devise || 'XAF',
            comment: postData.comment || null,
            progress: parseInt(postData.progress) || 0,
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
          body: JSON.stringify(newBusiness),
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
            body: JSON.stringify({ error: 'Business ID is required' }),
          };
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }

        const dataToUpdate: any = {};
        
        if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
        if (updateData.status !== undefined) dataToUpdate.status = updateData.status;
        if (updateData.client !== undefined) dataToUpdate.client = updateData.client;
        
        // Handle contact field - convert to integer or null
        if (updateData.contact !== undefined) {
          if (updateData.contact === null || updateData.contact === '') {
            dataToUpdate.contact = null;
          } else {
            const contactInt = parseInt(updateData.contact);
            if (!isNaN(contactInt)) {
              dataToUpdate.contact = contactInt;
            } else {
              dataToUpdate.contact = null;
            }
          }
        }
        
        if (updateData.startDate !== undefined) dataToUpdate.startDate = new Date(updateData.startDate);
        if (updateData.endDate !== undefined) dataToUpdate.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
        if (updateData.estimatedCost !== undefined) dataToUpdate.estimatedCost = parseFloat(updateData.estimatedCost);
        if (updateData.salePrice !== undefined) dataToUpdate.salePrice = parseFloat(updateData.salePrice);
        if (updateData.devise !== undefined) dataToUpdate.devise = updateData.devise;
        if (updateData.comment !== undefined) dataToUpdate.comment = updateData.comment || null;
        if (updateData.progress !== undefined) dataToUpdate.progress = parseInt(updateData.progress);
        if (updateData.attachment !== undefined) dataToUpdate.attachment = updateData.attachment || null;
        if (updateData.Inserteridentity !== undefined) {
          dataToUpdate.Inserteridentity = updateData.Inserteridentity ? String(updateData.Inserteridentity) : null;
        }
        if (updateData.InserterCountry !== undefined) dataToUpdate.InserterCountry = updateData.InserterCountry;

        const updatedBusiness = await prisma.business.update({
          where: { businessId: parseInt(updateId) },
          data: dataToUpdate,
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(updatedBusiness),
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
            body: JSON.stringify({ error: 'Business ID is required' }),
          };
        }

        await prisma.business.delete({
          where: { businessId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Business deleted successfully' }),
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