import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
export const handler = async (event) => {
    // Handle CORS preflight first
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            body: '',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            }
        };
    }
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Content-Type': 'application/json',
            }
        };
    }
    try {
        const { employeeNumber, firstName, lastName, email, password, phone, role, status, workcountry, structureName, isStructureResponsible } = JSON.parse(event.body || '{}');
        // Required fields validation
        if (!email || !phone) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Email and phone are required' }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                }
            };
        }
        if (!password || password.length < 6) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Password must be at least 6 characters' }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                }
            };
        }
        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return {
                statusCode: 409,
                body: JSON.stringify({ error: 'User already exists' }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                }
            };
        }
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        // Prepare user data with defaults for optional fields
        const userData = {
            employeeNumber: employeeNumber || `EMP${Date.now()}`,
            firstName: firstName || '',
            lastName: lastName || '',
            email,
            password: passwordHash,
            phone,
            role: role || 'EMPLOYEE',
            status: status || 'ACTIVE',
            // Set defaults for required Prisma fields
            dateOfBirth: new Date('1990-01-01'),
            placeOfBirth: '',
            civilityDropdown: 'MALE',
            maritalStatus: 'SINGLE',
            nationality: '',
            identityType: 'NATIONAL_ID_CARD',
            identity: '',
            workcountry: workcountry || 'IVORY_COAST',
            structureName: structureName || null,
            isStructureResponsible: isStructureResponsible || false,
            address: '',
            phoneno: '',
            gender: 'MALE',
            country: '',
            emergencyName: '',
            emergencyContact: '',
            childrenCount: 0,
            department: '',
            salary: 0,
        };
        // Create user
        const user = await prisma.user.create({
            data: userData,
        });
        // Generate JWT
        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token,
                user: {
                    id: user.id,
                    role: user.role,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            }),
        };
    }
    catch (error) {
        console.error('Signup error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server error', details: error.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            }
        };
    }
    finally {
        await prisma.$disconnect();
    }
};
