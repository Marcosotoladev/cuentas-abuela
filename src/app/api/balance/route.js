import { getCurrentBalance } from '@/lib/firebase';

export async function GET() {
    try {
        const balance = await getCurrentBalance();
        return new Response(JSON.stringify({ balance }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
