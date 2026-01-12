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
        const { email, password } = JSON.parse(event.body || '{}');
        if (!email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Email and password required' }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                }
            };
        }
        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid credentials' }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                }
            };
        }
        // Compare password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid credentials' }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                }
            };
        }
        // Generate JWT
        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        return {
            statusCode: 200,
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
        console.error('Signin error:', error);
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
