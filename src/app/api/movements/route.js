// src/app/api/movements/route.js
import { addMovement, getMovements } from '@/lib/firebase';

export async function POST(request) {
    try {
        const movement = await request.json();
        const result = await addMovement(movement);

        if (!result.success) {
            return new Response(JSON.stringify({ error: result.error }), { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        }

        return new Response(JSON.stringify(result), { 
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const filters = {
            dateFrom: searchParams.get('dateFrom'),
            dateTo: searchParams.get('dateTo'),
            type: searchParams.get('type'),
            category: searchParams.get('category'),
            lastVisible: searchParams.get('lastVisible'),
        };

        const result = await getMovements({ page, limit, filters });

        if (result.error) {
            return new Response(JSON.stringify({ error: result.error }), { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        }

        return new Response(JSON.stringify(result), { 
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }
}