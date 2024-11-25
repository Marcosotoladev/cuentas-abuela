// app/api/balance/route.js
import { getCurrentBalance } from '@/lib/firebase';

export async function GET() {
    try {
        console.log('API: Fetching current balance...');
        const balance = await getCurrentBalance();
        console.log('API: Balance fetched:', balance);
        
        // Asegurarse de que balance sea un número
        const numericBalance = Number(balance);
        if (isNaN(numericBalance)) {
            throw new Error('Balance retrieved is not a number');
        }

        return new Response(JSON.stringify({ 
            balance: numericBalance,
            timestamp: new Date().toISOString() 
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
            }
        });
    } catch (error) {
        console.error('API Error fetching balance:', error);
        return new Response(JSON.stringify({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
