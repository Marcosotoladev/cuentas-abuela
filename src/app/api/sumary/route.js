import { getMonthlySummary, getDateRangeSummary } from '@/lib/firebase';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year');
        const month = searchParams.get('month');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');

        let summary;
        if (year && month) {
            summary = await getMonthlySummary(year, month);
        } else if (dateFrom && dateTo) {
            summary = await getDateRangeSummary(dateFrom, dateTo);
        }

        return new Response(JSON.stringify({ summary }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
