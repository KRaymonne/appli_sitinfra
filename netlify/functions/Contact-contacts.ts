import { PrismaClient } from '@prisma/client'; 

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  const { httpMethod, body, queryStringParameters } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        const { search, page = '1', limit = '10', contactGroupe, companyName, InserterCountry } = queryStringParameters || {};
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
          where.OR = [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
            { country: { contains: search } },
          ];
        }
        if (contactGroupe && contactGroupe !== 'all') {
          where.contactGroupe = contactGroupe;
        }
        if (companyName && companyName !== 'all') {
          where.companyName = companyName;
        }
        if (InserterCountry) {
          where.InserterCountry = InserterCountry;
        }

        const [contacts, total] = await Promise.all([
          prisma.contact.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.contact.count({ where }),
        ]);

        // Process contacts to split phone numbers
        const processedContacts = contacts.map((contact:any) => {
          if (contact.phone) {
            const phoneNumbers = contact.phone.split(' | ');
            return {
              ...contact,
              phone: phoneNumbers[0] || '',
              secondPhone: phoneNumbers[1] || '',
            };
          }
          return {
            ...contact,
            secondPhone: '',
          };
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            contacts: processedContacts,
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
        
        const requiredFields = ['contactGroupe', 'companyName', 'firstName', 'lastName'];
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

        // Combine phone numbers for storage
        const phoneForStorage = postData.secondPhone 
          ? `${postData.phone} | ${postData.secondPhone}` 
          : postData.phone;

        if (postData && postData.Inserteridentity != null) {
          postData.Inserteridentity = String(postData.Inserteridentity);
        }

        const newContact = await prisma.contact.create({
          data: {
            contactGroupe: postData.contactGroupe,
            companyName: postData.companyName,
            firstName: postData.firstName,
            lastName: postData.lastName,
            email: postData.email || null,
            phone: phoneForStorage || null,
            address: postData.address || null,
            country: postData.country || null,
            Inserteridentity: postData.Inserteridentity || null,
            InserterCountry: postData.InserterCountry || null,
          },
        });

        // Process the response to split phone numbers
        const processedNewContact = {
          ...newContact,
          phone: postData.phone || '',
          secondPhone: postData.secondPhone || '',
        };

        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(processedNewContact),
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
            body: JSON.stringify({ error: 'Contact ID is required' }),
          };
        }

        // Combine phone numbers for storage
        const phoneForUpdate = updateData.secondPhone 
          ? `${updateData.phone} | ${updateData.secondPhone}` 
          : updateData.phone;

        if (updateData && updateData.Inserteridentity != null) {
          updateData.Inserteridentity = String(updateData.Inserteridentity);
        }

        const updatedContact = await prisma.contact.update({
          where: { contactId: parseInt(updateId) },
          data: {
            contactGroupe: updateData.contactGroupe,
            companyName: updateData.companyName,
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            email: updateData.email || null,
            phone: phoneForUpdate || null,
            address: updateData.address || null,
            country: updateData.country || null,
            Inserteridentity: updateData.Inserteridentity !== undefined ? (updateData.Inserteridentity ? String(updateData.Inserteridentity) : null) : undefined,
            InserterCountry: updateData.InserterCountry !== undefined ? updateData.InserterCountry : undefined,
          },
        });

        // Process the response to split phone numbers
        const processedUpdatedContact = {
          ...updatedContact,
          phone: updateData.phone || '',
          secondPhone: updateData.secondPhone || '',
        };

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(processedUpdatedContact),
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
            body: JSON.stringify({ error: 'Contact ID is required' }),
          };
        }

        await prisma.contact.delete({
          where: { contactId: parseInt(deleteId) },
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ message: 'Contact deleted successfully' }),
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
