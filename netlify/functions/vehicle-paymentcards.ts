import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '10', typeBadge, InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { numBadge: { contains: search } },
            { description: { contains: search } },
            { typeBadgeLibre: { contains: search } },
          ];
        }
        if (typeBadge && typeBadge !== 'all') {
          where.typeBadge = typeBadge;
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [paymentCards, total] = await Promise.all([
          prisma.paymentcards.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.paymentcards.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            paymentCards,
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
        
        const requiredFields = ['dateAchat', 'typeBadge', 'numBadge', 'montant', 'dateMiseEnService', 'devise'];
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

        const newPaymentCard = await prisma.paymentcards.create({
          data: {
            dateAchat: new Date(postData.dateAchat),
            typeBadge: postData.typeBadge,
            typeBadgeLibre: postData.typeBadgeLibre || null,
            numBadge: postData.numBadge,
            description: postData.description || null,
            montant: parseFloat(postData.montant),
            devise: postData.devise,
            dateMiseEnService: new Date(postData.dateMiseEnService),
            fichierJoint: postData.fichierJoint || null,
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
          body: JSON.stringify(newPaymentCard),
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
            body: JSON.stringify({ error: 'Payment Card ID is required' }),
          };
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }
        const updatedPaymentCard = await prisma.paymentcards.update({
          where: { cardId: parseInt(updateId) },
          data: {
            ...updateData,
            dateAchat: updateData.dateAchat ? new Date(updateData.dateAchat) : undefined,
            montant: updateData.montant ? parseFloat(updateData.montant) : undefined,
            dateMiseEnService: updateData.dateMiseEnService ? new Date(updateData.dateMiseEnService) : undefined,
          },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(updatedPaymentCard),
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
            body: JSON.stringify({ error: 'Payment Card ID is required' }),
          };
        }

        await prisma.paymentcards.delete({
          where: { cardId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Payment Card deleted successfully' }),
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

