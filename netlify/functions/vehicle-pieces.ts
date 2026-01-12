import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '10', type, vehicleId, InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { description: { contains: search } },
            { typeLibre: { contains: search } },
          ];
        }
        if (type && type !== 'all') {
          where.type = type;
        }
        if (vehicleId) {
          where.vehicleId = parseInt(vehicleId);
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [pieces, total] = await Promise.all([
          prisma.vehiclepieces.findMany({
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
          prisma.vehiclepieces.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            pieces,
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
        
        const requiredFields = ['vehicleId', 'type', 'montant', 'dateDebut', 'dateFin'];
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
        let dateDebut: Date;
        const dateDebutObj = new Date(postData.dateDebut);
        if (isNaN(dateDebutObj.getTime())) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Invalid dateDebut format' }),
          };
        }
        dateDebut = dateDebutObj;

        let dateFin: Date;
        const dateFinObj = new Date(postData.dateFin);
        if (isNaN(dateFinObj.getTime())) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Invalid dateFin format' }),
          };
        }
        dateFin = dateFinObj;

        let dateProchaine: Date | null = null;
        if (postData.dateProchaine && postData.dateProchaine.trim() !== '') {
          const dateProchaineObj = new Date(postData.dateProchaine);
          if (!isNaN(dateProchaineObj.getTime())) {
            dateProchaine = dateProchaineObj;
          }
        }

        const newPiece = await prisma.vehiclepieces.create({
          data: {
            vehicleId: parseInt(postData.vehicleId),
            type: postData.type,
            typeLibre: postData.typeLibre || null,
            description: postData.description || null,
            montant: parseFloat(postData.montant),
            dateDebut: dateDebut,
            dateFin: dateFin,
            dateProchaine: dateProchaine,
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
          body: JSON.stringify(newPiece),
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
            body: JSON.stringify({ error: 'Piece ID is required' }),
          };
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }
        
        // Handle dates properly for updates as well
        let updateDateDebut: Date | undefined = undefined;
        if (updateData.dateDebut !== undefined) {
          if (updateData.dateDebut === null || updateData.dateDebut === '') {
            return {
              statusCode: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'dateDebut is required' }),
            };
          } else {
            const date = new Date(updateData.dateDebut);
            if (!isNaN(date.getTime())) {
              updateDateDebut = date;
            } else {
              return {
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Invalid dateDebut format' }),
              };
            }
          }
        }

        let updateDateFin: Date | undefined = undefined;
        if (updateData.dateFin !== undefined) {
          if (updateData.dateFin === null || updateData.dateFin === '') {
            return {
              statusCode: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'dateFin is required' }),
            };
          } else {
            const date = new Date(updateData.dateFin);
            if (!isNaN(date.getTime())) {
              updateDateFin = date;
            } else {
              return {
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Invalid dateFin format' }),
              };
            }
          }
        }

        let updateDateProchaine: Date | null | undefined = undefined;
        if (updateData.dateProchaine !== undefined) {
          if (updateData.dateProchaine === null || updateData.dateProchaine === '') {
            updateDateProchaine = null; // Explicitly set to null if empty
          } else {
            const date = new Date(updateData.dateProchaine);
            if (!isNaN(date.getTime())) {
              updateDateProchaine = date;
            } else {
              updateDateProchaine = null; // Invalid date, set to null
            }
          }
        }

        const updatedPiece = await prisma.vehiclepieces.update({
          where: { pieceId: parseInt(updateId) },
          data: {
            ...updateData,
            vehicleId: updateData.vehicleId ? parseInt(updateData.vehicleId) : undefined,
            montant: updateData.montant ? parseFloat(updateData.montant) : undefined,
            dateDebut: updateDateDebut,
            dateFin: updateDateFin,
            dateProchaine: updateDateProchaine !== undefined ? updateDateProchaine : undefined,
          },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(updatedPiece),
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
            body: JSON.stringify({ error: 'Piece ID is required' }),
          };
        }

        await prisma.vehiclepieces.delete({
          where: { pieceId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Piece deleted successfully' }),
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

