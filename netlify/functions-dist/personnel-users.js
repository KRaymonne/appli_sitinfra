import { PrismaClient } from '@prisma/client';
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
const json = (statusCode, data) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(data),
});
export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return json(200, { ok: true });
    }
    try {
        switch (event.httpMethod) {
            case 'GET': {
                const users = await prisma.user.findMany({
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        employeeNumber: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        password: true,
                        role: true,
                        status: true,
                        dateOfBirth: true,
                        placeOfBirth: true,
                        devise: true,
                        civilityDropdown: true,
                        maritalStatus: true,
                        nationality: true,
                        identityType: true,
                        identity: true,
                        workcountry: true,
                        structureName: true,
                        isStructureResponsible: true,
                        address: true,
                        phone: true,
                        phoneno: true,
                        gender: true,
                        country: true,
                        emergencyName: true,
                        emergencyContact: true,
                        childrenCount: true,
                        department: true,
                        salary: true,
                        hireDate: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                });
                return json(200, users);
            }
            case 'POST': {
                if (!event.body) {
                    return json(400, { error: 'Missing request body' });
                }
                const payload = JSON.parse(event.body);
                const { 
                // identifiers
                employeeNumber, role, status, 
                // personal info
                firstName, lastName, email, password, dateOfBirth, placeOfBirth, devise, civilityDropdown, maritalStatus, nationality, identityType, identity, workcountry, structureName, isStructureResponsible, 
                // contacts
                address, phone, phoneno, gender, country, 
                // emergency
                emergencyName, emergencyContact, childrenCount, 
                // job
                department, salary, hireDate, } = payload || {};
                // basic validation
                const required = {
                    employeeNumber,
                    role,
                    status,
                    firstName,
                    lastName,
                    email,
                    password,
                    dateOfBirth,
                    placeOfBirth,
                    devise,
                    civilityDropdown,
                    maritalStatus,
                    nationality,
                    identityType,
                    identity,
                    workcountry,
                    address,
                    phone,
                    phoneno,
                    gender,
                    country,
                    emergencyName,
                    emergencyContact,
                    department,
                    salary,
                    // structureName and isStructureResponsible are optional
                };
                const missing = Object.entries(required)
                    .filter(([, v]) => v === undefined || v === null || v === '')
                    .map(([k]) => k);
                if (missing.length > 0) {
                    return json(400, { error: `Missing fields: ${missing.join(', ')}` });
                }
                // Prepare data for database
                const finalStructureName = structureName && structureName.trim() !== '' ? structureName : null;
                const finalIsStructureResponsible = isStructureResponsible !== undefined ? Boolean(isStructureResponsible) : false;
                const created = await prisma.user.create({
                    data: {
                        employeeNumber,
                        role,
                        status,
                        firstName,
                        lastName,
                        email,
                        password,
                        dateOfBirth: new Date(dateOfBirth),
                        placeOfBirth,
                        devise,
                        civilityDropdown,
                        maritalStatus,
                        nationality,
                        identityType,
                        identity,
                        workcountry,
                        structureName: finalStructureName,
                        isStructureResponsible: finalIsStructureResponsible,
                        address,
                        phone,
                        phoneno,
                        gender,
                        country,
                        emergencyName,
                        emergencyContact,
                        childrenCount: childrenCount != null ? Number(childrenCount) : 0,
                        department,
                        salary: Number(salary),
                        hireDate: hireDate ? new Date(hireDate) : undefined,
                    },
                    select: {
                        id: true,
                        employeeNumber: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        password: true,
                        role: true,
                        status: true,
                        dateOfBirth: true,
                        placeOfBirth: true,
                        devise: true,
                        civilityDropdown: true,
                        maritalStatus: true,
                        nationality: true,
                        identityType: true,
                        identity: true,
                        workcountry: true,
                        structureName: true,
                        isStructureResponsible: true,
                        address: true,
                        phone: true,
                        phoneno: true,
                        gender: true,
                        country: true,
                        emergencyName: true,
                        emergencyContact: true,
                        childrenCount: true,
                        department: true,
                        salary: true,
                        hireDate: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                });
                return json(201, created);
            }
            case 'PUT': {
                if (!event.body) {
                    return json(400, { error: 'Missing request body' });
                }
                const { id } = event.queryStringParameters || {};
                if (!id) {
                    return json(400, { error: 'Missing user ID' });
                }
                const payload = JSON.parse(event.body);
                const updateData = {};
                if (payload.firstName)
                    updateData.firstName = payload.firstName;
                if (payload.lastName)
                    updateData.lastName = payload.lastName;
                if (payload.email)
                    updateData.email = payload.email;
                if (payload.password)
                    updateData.password = payload.password;
                if (payload.role)
                    updateData.role = payload.role;
                if (payload.status)
                    updateData.status = payload.status;
                if (payload.dateOfBirth)
                    updateData.dateOfBirth = new Date(payload.dateOfBirth);
                if (payload.placeOfBirth)
                    updateData.placeOfBirth = payload.placeOfBirth;
                if (payload.devise)
                    updateData.devise = payload.devise;
                if (payload.civilityDropdown)
                    updateData.civilityDropdown = payload.civilityDropdown;
                if (payload.maritalStatus)
                    updateData.maritalStatus = payload.maritalStatus;
                if (payload.nationality)
                    updateData.nationality = payload.nationality;
                if (payload.identityType)
                    updateData.identityType = payload.identityType;
                if (payload.identity)
                    updateData.identity = payload.identity;
                if (payload.workcountry)
                    updateData.workcountry = payload.workcountry;
                if (payload.structureName !== undefined)
                    updateData.structureName = payload.structureName && payload.structureName.trim() !== '' ? payload.structureName : null;
                if (payload.isStructureResponsible !== undefined)
                    updateData.isStructureResponsible = Boolean(payload.isStructureResponsible);
                if (payload.address)
                    updateData.address = payload.address;
                if (payload.phone)
                    updateData.phone = payload.phone;
                if (payload.phoneno)
                    updateData.phoneno = payload.phoneno;
                if (payload.gender)
                    updateData.gender = payload.gender;
                if (payload.country)
                    updateData.country = payload.country;
                if (payload.emergencyName !== undefined)
                    updateData.emergencyName = payload.emergencyName;
                if (payload.emergencyContact !== undefined)
                    updateData.emergencyContact = payload.emergencyContact;
                if (payload.childrenCount !== undefined)
                    updateData.childrenCount = Number(payload.childrenCount);
                if (payload.department)
                    updateData.department = payload.department;
                if (payload.salary !== undefined)
                    updateData.salary = Number(payload.salary);
                if (payload.hireDate)
                    updateData.hireDate = new Date(payload.hireDate);
                const updated = await prisma.user.update({
                    where: { id: Number(id) },
                    data: updateData,
                    select: {
                        id: true,
                        employeeNumber: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        password: true,
                        role: true,
                        status: true,
                        dateOfBirth: true,
                        placeOfBirth: true,
                        devise: true,
                        civilityDropdown: true,
                        maritalStatus: true,
                        nationality: true,
                        identityType: true,
                        identity: true,
                        workcountry: true,
                        structureName: true,
                        isStructureResponsible: true,
                        address: true,
                        phone: true,
                        phoneno: true,
                        gender: true,
                        country: true,
                        emergencyName: true,
                        emergencyContact: true,
                        childrenCount: true,
                        department: true,
                        salary: true,
                        hireDate: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                });
                return json(200, updated);
            }
            case 'DELETE': {
                const { id } = event.queryStringParameters || {};
                if (!id) {
                    return json(400, { error: 'Missing user ID' });
                }
                await prisma.user.delete({
                    where: { id: Number(id) }
                });
                return json(200, { message: 'User deleted successfully' });
            }
            default:
                return json(405, { error: 'Method not allowed' });
        }
    }
    catch (error) {
        console.error('Users function error', error);
        return json(500, { error: 'Internal Server Error' });
    }
};
