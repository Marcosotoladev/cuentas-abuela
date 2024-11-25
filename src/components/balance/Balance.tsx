"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Loader2 } from "lucide-react";

interface BalanceData {
    balance: number;
    timestamp?: string;
}

export default function Balance() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [balanceError, setBalanceError] = useState<string | null>(null);

    // Memorizar fetchBalance para evitar recrearlo en cada render
    const fetchBalance = useCallback(async () => {
        try {
            setLoading(true);
            console.log("Fetching balance...");

            const response = await fetch("/api/balance");
            console.log("Balance API Response:", response);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = (await response.json()) as BalanceData;
            console.log("Balance data received:", data);

            if (data.balance !== undefined) {
                setBalance(data.balance);
                setBalanceError(null);
            } else {
                throw new Error("Balance undefined in response");
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
            const errorMessage = error instanceof Error ? error.message : "Error desconocido al cargar el balance";
            setBalanceError(errorMessage);
            toast({
                variant: "destructive",
                title: "Error al cargar el balance",
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Saldo
                    {loading && <Loader2 className="h-4 w-4 ml-2 inline animate-spin" />}
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {loading ? (
                        "Cargando..."
                    ) : balanceError ? (
                        <span className="text-red-500 text-sm">Error: {balanceError}</span>
                    ) : (
                        `$${balance !== null ? balance.toFixed(2) : "0.00"}`
                    )}
                </div>
                {balanceError && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchBalance}
                        className="mt-2"
                    >
                        Reintentar
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

