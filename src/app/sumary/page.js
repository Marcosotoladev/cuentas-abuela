"use client";

import { useState, useEffect } from "react";

const Page = () => {
    const [movements, setMovements] = useState([]);
    const [pageNum, setPageNum] = useState(1);
    const [filters, setFilters] = useState({});
    const [lastVisible, setLastVisible] = useState(null);

    const fetchMovements = async (pageNum = 1, reset = false) => {
        try {
            const queryParams = new URLSearchParams({
                page: pageNum.toString(),
                ...filters,
                lastVisible: reset ? "" : lastVisible || "",
            });

            const response = await fetch(`/api/movements?${queryParams}`);
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            // Actualiza los movimientos en el estado
            setMovements(reset ? data.movements : [...movements, ...data.movements]);
            setLastVisible(data.lastVisible); // Supone que la API retorna esta clave
        } catch (error) {
            console.error("Error fetching movements:", error);
        }
    };

    useEffect(() => {
        fetchMovements(1, true);
    }, []); // Solo se ejecuta al montar el componente

    return (
        <div>
            <h1>Summary</h1>
            <button onClick={() => fetchMovements(pageNum, false)}>Fetch Movements</button>
            <div>
                {movements.map((movement) => (
                    <div key={movement.id}>
                        <h2>{movement.date}</h2>
                        <p>{movement.type}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Page;
