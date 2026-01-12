import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '10', status, InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { licensePlate: { contains: search } },
            { brand: { contains: search } },
            { model: { contains: search } },
            { chassisNumber: { contains: search } },
          ];
        }
        if (status && status !== 'all') {
          where.status = status;
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [vehicles, total] = await Promise.all([
          prisma.vehicles.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.vehicles.count({ where }),
        ]);

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            vehicles,
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
        
        const requiredFields = ['licensePlate', 'brand', 'model', 'type', 'year', 'chassisNumber', 'fuelType'];
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

        // Handle acquisitionDate properly - only create Date object if value is provided
        let acquisitionDate: Date | undefined;
        if (postData.acquisitionDate && postData.acquisitionDate.trim() !== '') {
          const date = new Date(postData.acquisitionDate);
          if (!isNaN(date.getTime())) {
            acquisitionDate = date;
          }
        }

        // Build data object with conditional acquisitionDate
        const vehicleData: any = {
          licensePlate: postData.licensePlate,
          brand: postData.brand,
          model: postData.model,
          type: postData.type,
          vehiclecountry: postData.vehiclecountry || 'IVORY_COAST',
          year: parseInt(postData.year),
          mileage: parseInt(postData.mileage) || 0,
          civilRegistration: postData.civilRegistration || '',
          administrativeRegistration: postData.administrativeRegistration || '',
          usingEntity: postData.usingEntity || '',
          holder: postData.holder || '',
          chassisNumber: postData.chassisNumber,
          status: postData.status || 'AVAILABLE',
          assignedTo: postData.assignedTo || null,
          fuelType: postData.fuelType,
          Inserteridentity: postData.Inserteridentity || null,
          InserterCountry: postData.InserterCountry || null,
        };

        // Only add acquisitionDate if it's defined
        if (acquisitionDate !== undefined) {
          vehicleData.acquisitionDate = acquisitionDate;
        }

        const newVehicle = await prisma.vehicles.create({
          data: vehicleData,
        });

        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(newVehicle),
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
            body: JSON.stringify({ error: 'Vehicle ID is required' }),
          };
        }

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }
        
        // Handle acquisitionDate properly for updates as well
        let updateAcquisitionDate: Date | undefined | null = undefined;
        if (updateData.acquisitionDate !== undefined) {
          if (updateData.acquisitionDate === null || updateData.acquisitionDate === '') {
            updateAcquisitionDate = null; // Explicitly set to null if empty
          } else {
            const date = new Date(updateData.acquisitionDate);
            if (!isNaN(date.getTime())) {
              updateAcquisitionDate = date;
            } else {
              updateAcquisitionDate = null; // Invalid date, set to null
            }
          }
        }

        const updatedVehicle = await prisma.vehicles.update({
          where: { vehicleId: parseInt(updateId) },
          data: {
            ...updateData,
            year: updateData.year ? parseInt(updateData.year) : undefined,
            mileage: updateData.mileage ? parseInt(updateData.mileage) : undefined,
            acquisitionDate: updateAcquisitionDate !== undefined ? updateAcquisitionDate : undefined,
          },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(updatedVehicle),
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
            body: JSON.stringify({ error: 'Vehicle ID is required' }),
          };
        }

        await prisma.vehicles.delete({
          where: { vehicleId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Vehicle deleted successfully' }),
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

