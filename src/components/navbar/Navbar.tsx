"use client";

import React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Navbar = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: 'Movimiento', href: '/movement' },
        { name: 'Registros', href: '/registers' },
        { name: 'Resumen', href: '/resumen' },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <nav className=" w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                {/* Logo o Título */}
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-bold">Cuentas Abuela</span>
                    </Link>
                </div>

                {/* Navegación Desktop */}
                <div className="hidden md:flex md:flex-1">
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`transition-colors hover:text-foreground/80 ${isActive(item.href)
                                        ? 'text-foreground'
                                        : 'text-foreground/60'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Menú Móvil */}
                <div className="flex md:hidden flex-1">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="mr-2">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[80%] max-w-sm">
                            <nav className="flex flex-col space-y-4 mt-6">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`text-lg font-medium transition-colors hover:text-foreground/80 ${isActive(item.href)
                                                ? 'text-foreground'
                                                : 'text-foreground/60'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="flex flex-1 items-center justify-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="font-bold">Mi App</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;