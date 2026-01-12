import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod } = event;

  try {
    if (httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // Get current date and time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format

    // Find overdue alerts
    const overdueAlerts = await prisma.alert.findMany({
      where: {
        OR: [
          // Alerts where due date is before today
          {
            dueDate: {
              lt: new Date(currentDate)
            }
          },
          // Alerts where due date is today but due time has passed
          {
            AND: [
              {
                dueDate: {
                  gte: new Date(currentDate),
                  lt: new Date(new Date(currentDate).getTime() + 24 * 60 * 60 * 1000) // Next day
                }
              },
              {
                dueTime: {
                  not: null
                }
              },
              {
                OR: [
                  {
                    dueTime: {
                      lt: currentTime
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { dueTime: 'asc' }
      ]
    });

    // Count overdue alerts
    const overdueCount = overdueAlerts.length;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        count: overdueCount,
        alerts: overdueAlerts,
        currentDate,
        currentTime
      }),
    };

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
