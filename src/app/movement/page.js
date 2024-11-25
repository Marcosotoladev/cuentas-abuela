"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Tag,
    FileText,
    Loader2
} from 'lucide-react';

import Balance from '@/components/balance/Balance';

export default function HomePage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: '',
        amount: '',
        category: '',
        observations: ''
    });

    const incomeCategories = [
        { value: 'sueldo', label: 'Sueldo' },
        { value: 'ofrenda', label: 'Ofrenda' },
        { value: 'alquiler', label: 'Alquiler' }
    ];

    const expenseCategories = [
        { value: 'salud', label: 'Salud' },
        { value: 'supermercado', label: 'Supermercado' },
        { value: 'impuestos', label: 'Impuestos y Servicios' },
        { value: 'mantenimiento', label: 'Mantenimiento' },
        { value: 'traslado', label: 'Traslado' },
        { value: 'otros', label: 'Otros' }
    ];


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/movements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    type: '',
                    amount: '',
                    category: '',
                    observations: ''
                });

                toast({
                    title: "Éxito",
                    description: "Movimiento registrado correctamente"
                });
            } else {
                throw new Error(result.error);
            }
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo registrar el movimiento"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">

            <Balance />

            {/* Form Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Nuevo Movimiento</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4">
                            {/* Fecha */}
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="date">
                                    <Calendar className="h-4 w-4 inline-block mr-2" />
                                    Fecha
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Tipo */}
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="type">
                                    {formData.type === 'ingreso' ? (
                                        <ArrowUpRight className="h-4 w-4 inline-block mr-2 text-green-600" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4 inline-block mr-2 text-red-600" />
                                    )}
                                    Tipo
                                </Label>
                                <Select
                                    value={formData.type || ''}
                                    onValueChange={(value) => setFormData({ ...formData, type: value, category: '' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ingreso">Ingreso</SelectItem>
                                        <SelectItem value="egreso">Egreso</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Monto */}
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="amount">
                                    <Wallet className="h-4 w-4 inline-block mr-2" />
                                    Monto
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Categoría */}
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="category">
                                    <Tag className="h-4 w-4 inline-block mr-2" />
                                    Categoría
                                </Label>
                                <Select
                                    value={formData.category || ''}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    disabled={!formData.type}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {formData.type === 'ingreso'
                                            ? incomeCategories.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))
                                            : expenseCategories.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Observaciones */}
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="observations">
                                    <FileText className="h-4 w-4 inline-block mr-2" />
                                    Observaciones
                                </Label>
                                <Textarea
                                    id="observations"
                                    placeholder="Ingrese observaciones..."
                                    value={formData.observations}
                                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Movimiento'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
