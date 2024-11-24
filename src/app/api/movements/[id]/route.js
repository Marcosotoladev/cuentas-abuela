// src/app/api/movements/[id]/route.js
import { deleteMovement } from '@/lib/firebase';

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        
        // Agregar log para depuración
        console.log('Attempting to delete movement with ID:', id);
        
        const result = await deleteMovement(id);
        
        // Agregar log para depuración
        console.log('Delete result:', result);

        if (!result?.success) {
            console.error('Delete failed:', result);
            return new Response(
                JSON.stringify({ 
                    error: result?.error || 'Error al eliminar el movimiento',
                    details: result 
                }), 
                { 
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
        }

        return new Response(
            JSON.stringify({ 
                message: 'Movement deleted successfully',
                result 
            }), 
            { 
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    } catch (error) {
        console.error('Server error during deletion:', error);
        return new Response(
            JSON.stringify({ 
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }), 
            { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }
}

