"use client";

import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Filter, Loader2 } from "lucide-react";

export default function MovementsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [movements, setMovements] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState(null);
    const [filters, setFilters] = useState({
        dateFrom: "",
        dateTo: "",
        type: "",
        category: "",
    });


    const fetchMovements = async (pageNum, reset = false) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: pageNum.toString(),
                ...filters,
                lastVisible: reset ? "" : lastVisible,
            });

            const response = await fetch(`/api/movements?${queryParams}`);
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setMovements((prev) => (reset ? data.movements : [...prev, ...data.movements]));
            setLastVisible(data.lastVisible);
            setHasMore(data.hasMore);
            setPage(pageNum);
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar los movimientos",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovements(1, true);
    }, []);

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/movements/${deleteId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Error al eliminar el movimiento");

            setMovements((prev) => prev.filter((m) => m.id !== deleteId));
            setDeleteId(null);

            toast({
                title: "Éxito",
                description: "El movimiento se eliminó correctamente",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "No se pudo eliminar el movimiento",
            });
        }
    };

    const categories = {
        ingreso: [
            { value: "sueldo", label: "Sueldo" },
            { value: "ofrenda", label: "Ofrenda" },
            { value: "alquiler", label: "Alquiler" },
        ],
        egreso: [
            { value: "salud", label: "Salud" },
            { value: "supermercado", label: "Supermercado" },
            { value: "impuestos", label: "Impuestos y Servicios" },
            { value: "mantenimiento", label: "Mantenimiento" },
            { value: "traslado", label: "Traslado" },
            { value: "otros", label: "Otros" },
        ],
    };

    return (
        <div className="p-4">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros
                    </CardTitle>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Input
                                type="date"
                                placeholder="Desde"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                            />
                        </div>
                        <div>
                            <Input
                                type="date"
                                placeholder="Hasta"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                            />
                        </div>
                        <Select
                            value={filters.type || undefined}
                            onValueChange={(value) => setFilters({ ...filters, type: value, category: "" })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="ingreso">Ingreso</SelectItem>
                                <SelectItem value="egreso">Egreso</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.category || undefined}
                            onValueChange={(value) => setFilters({ ...filters, category: value })}
                            disabled={!filters.type}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {filters.type &&
                                    categories[filters.type]?.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {movements.map((movement) => (
                                <TableRow key={movement.id}>
                                    <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{movement.type === "ingreso" ? "Ingreso" : "Egreso"}</TableCell>
                                    <TableCell>{movement.amount}</TableCell>
                                    <TableCell>{movement.category}</TableCell>
                                    <TableCell>{movement.observations}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="link"
                                            onClick={() => console.log("Edit", movement.id)}
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            variant="link"
                                            onClick={() => setDeleteId(movement.id)}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {loading && <Loader2 className="animate-spin h-6 w-6 mx-auto" />}
                    {hasMore && !loading && (
                        <Button onClick={() => fetchMovements(page + 1)} className="mt-4">
                            Cargar más
                        </Button>
                    )}
                </CardContent>
            </Card>

            {deleteId !== null && (
                <AlertDialog
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) setDeleteId(null);
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar Movimiento</AlertDialogTitle>
                            <AlertDialogDescription>
                                ¿Estás seguro de que deseas eliminar este movimiento? Esta acción no se
                                puede deshacer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteId(null)}>
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}

