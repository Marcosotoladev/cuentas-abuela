// /lib/firebase.js
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    writeBatch,
    increment,
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Estructura de datos principal
const COLLECTIONS = {
    MOVEMENTS: 'movements',
    BALANCE: 'balance',
    SUMMARIES: 'summaries',
};

// Función para añadir un nuevo movimiento
export async function addMovement(movementData) {
    try {
        const balanceRef = doc(db, COLLECTIONS.BALANCE, 'current');
        const balanceDoc = await getDoc(balanceRef);
        const currentBalance = balanceDoc.exists() ? balanceDoc.data().amount : 0;

        const amount = parseFloat(movementData.amount);
        const newBalance =
            movementData.type === 'ingreso'
                ? currentBalance + amount
                : currentBalance - amount;

        const movementRef = doc(collection(db, COLLECTIONS.MOVEMENTS));
        const timestamp = new Date();
        const movement = {
            ...movementData,
            id: movementRef.id,
            timestamp,
            month: timestamp.getMonth() + 1,
            year: timestamp.getFullYear(),
        };

        const summaryRef = doc(
            db,
            COLLECTIONS.SUMMARIES,
            `${movement.year}-${movement.month}`
        );

        const batch = writeBatch(db);

        batch.set(movementRef, movement);
        batch.set(balanceRef, { amount: newBalance }, { merge: true });
        batch.set(
            summaryRef,
            {
                [`${movement.category}Total`]: increment(amount),
                [`${movement.type}Total`]: increment(amount),
                lastUpdated: timestamp,
            },
            { merge: true }
        );

        await batch.commit();

        return { success: true, movement, newBalance };
    } catch (error) {
        console.error('Error adding movement:', error);
        return { success: false, error };
    }
}

// Función para obtener el balance actual
export async function getCurrentBalance() {
    const balanceRef = doc(db, COLLECTIONS.BALANCE, 'current');
    const balanceDoc = await getDoc(balanceRef);
    return balanceDoc.exists() ? balanceDoc.data().amount : 0;
}

// Función para obtener movimientos paginados
export async function getMovements({ page = 1, limit: limitValue = 10, filters = {} }) {
    try {
        if (!Number.isInteger(limitValue) || limitValue <= 0) {
            throw new Error("El valor de 'limit' debe ser un número entero positivo.");
        }

        let q = collection(db, COLLECTIONS.MOVEMENTS);

        if (filters.dateFrom) {
            q = query(q, where('timestamp', '>=', new Date(filters.dateFrom)));
        }
        if (filters.dateTo) {
            q = query(q, where('timestamp', '<=', new Date(filters.dateTo)));
        }
        if (filters.type) {
            q = query(q, where('type', '==', filters.type));
        }
        if (filters.category) {
            q = query(q, where('category', '==', filters.category));
        }

        q = query(q, orderBy('timestamp', 'desc'));
        q = query(q, limit(limitValue));

        if (page > 1 && filters.lastVisible) {
            q = query(q, startAfter(filters.lastVisible));
        }

        const snapshot = await getDocs(q);
        const movements = [];
        let lastVisible = null;

        snapshot.forEach((doc) => {
            movements.push(doc.data());
            lastVisible = doc;
        });

        return {
            movements,
            lastVisible,
            hasMore: movements.length === limitValue,
        };
    } catch (error) {
        console.error('Error getting movements:', error);
        return { movements: [], error };
    }
}


// Función para obtener resumen mensual
export async function getMonthlySummary(year, month) {
    try {
        const summaryRef = doc(db, COLLECTIONS.SUMMARIES, `${year}-${month}`);
        const summaryDoc = await getDoc(summaryRef);
        return summaryDoc.exists() ? summaryDoc.data() : null;
    } catch (error) {
        console.error('Error getting monthly summary:', error);
        return null;
    }
}

// Función para obtener resumen por rango de fechas
export async function getDateRangeSummary(dateFrom, dateTo) {
    try {
        const summariesRef = collection(db, COLLECTIONS.SUMMARIES);
        const q = query(
            summariesRef,
            where('timestamp', '>=', new Date(dateFrom)),
            where('timestamp', '<=', new Date(dateTo))
        );

        const snapshot = await getDocs(q);
        const summaries = [];

        snapshot.forEach((doc) => {
            summaries.push(doc.data());
        });

        return summaries;
    } catch (error) {
        console.error('Error getting date range summary:', error);
        return [];
    }
}


// Función para eliminar un movimiento

// En lib/firebase.js

export async function deleteMovement(id) {
    try {
        console.log('Starting deletion process for movement:', id); // Log para depuración
        
        const movementRef = doc(db, COLLECTIONS.MOVEMENTS, id);
        const movementDoc = await getDoc(movementRef);

        if (!movementDoc.exists()) {
            console.log('Movement not found:', id); // Log para depuración
            return { 
                success: false, 
                error: 'Movimiento no encontrado' 
            };
        }

        const movement = movementDoc.data();
        console.log('Movement data:', movement); // Log para depuración

        const { amount, type, category } = movement;
        const timestamp = movement.timestamp.toDate(); // Convertir Timestamp a Date

        const balanceRef = doc(db, COLLECTIONS.BALANCE, 'current');
        const balanceDoc = await getDoc(balanceRef);
        
        if (!balanceDoc.exists()) {
            console.log('Balance document not found'); // Log para depuración
            return { 
                success: false, 
                error: 'Balance no encontrado' 
            };
        }

        const currentBalance = balanceDoc.data().amount;
        const newBalance = type === 'ingreso' 
            ? currentBalance - amount 
            : currentBalance + amount;

        const summaryRef = doc(
            db,
            COLLECTIONS.SUMMARIES,
            `${timestamp.getFullYear()}-${timestamp.getMonth() + 1}`
        );

        const batch = writeBatch(db);

        batch.delete(movementRef);
        batch.set(balanceRef, { amount: newBalance }, { merge: true });
        batch.set(
            summaryRef,
            {
                [`${category}Total`]: increment(-amount),
                [`${type}Total`]: increment(-amount),
                lastUpdated: new Date()
            },
            { merge: true }
        );

        await batch.commit();
        console.log('Deletion completed successfully'); // Log para depuración

        return { success: true };
    } catch (error) {
        console.error('Error in deleteMovement:', error); // Log para depuración
        return { 
            success: false, 
            error: error.message,
            details: error 
        };
    }
}

export { db };
