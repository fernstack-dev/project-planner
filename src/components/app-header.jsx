"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FolderKanban, User, LogOut, LogIn, UserPlus, Home } from "lucide-react";

export function AppHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const navRefs = useRef({});
  const indicatorRef = useRef(null);
  const navContainerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const navItems = [
    { href: "/", label: "Главная", icon: Home },
    { href: "/projects", label: "Проекты", icon: FolderKanban },
  ];

  // Update indicator position when pathname changes
  useEffect(() => {
    const activeTab = navItems.find(item => item.href === pathname);
    if (activeTab && navRefs.current[activeTab.href] && navContainerRef.current) {
      const tabEl = navRefs.current[activeTab.href];
      const containerRect = navContainerRef.current.getBoundingClientRect();
      const tabRect = tabEl.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    } else {
      setIndicatorStyle({ left: 0, width: 0 });
    }
  }, [pathname, isLoggedIn]);

  // Update indicator on resize
  useEffect(() => {
    const handleResize = () => {
      const activeTab = navItems.find(item => item.href === pathname);
      if (activeTab && navRefs.current[activeTab.href] && navContainerRef.current) {
        const tabEl = navRefs.current[activeTab.href];
        const containerRect = navContainerRef.current.getBoundingClientRect();
        const tabRect = tabEl.getBoundingClientRect();
        setIndicatorStyle({
          left: tabRect.left - containerRect.left,
          width: tabRect.width,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pathname]);

  const handleLogout = () => signOut({ callbackUrl: "https://projify.ru/login" });

  return (
    <TooltipProvider delayDuration={300}>
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8 h-full">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/images/projectPlannerLogo.png"
                alt="Logo"
                width={40}
                height={40}
                priority
                className="transition-transform group-hover:scale-105"
              />
              <span className="hidden md:inline text-xl font-bold text-emerald-400">
                Projify
              </span>
            </Link>

            {isLoggedIn && (
              <div ref={navContainerRef} className="relative h-full">
                <nav className="flex items-center h-full gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            ref={(el) => {
                              if (el) navRefs.current[item.href] = el;
                            }}
                            className={`relative h-full flex items-center px-3 text-sm font-medium transition-colors ${
                              isActive
                                ? "text-emerald-400"
                                : "text-gray-400 hover:text-gray-300"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <item.icon
                                className="h-6 w-6 md:h-4 md:w-4"
                                strokeWidth={1.75}
                              />
                              {/* Label visible only on desktop */}
                              <span className="hidden md:inline">
                                {item.label}
                              </span>
                            </span>
                          </Link>
                        </TooltipTrigger>
                        {/* Tooltip only on mobile */}
                        <TooltipContent side="bottom" className="md:hidden">
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </nav>
                {/* Sliding underline – always at the bottom of the header */}
                {indicatorStyle.width > 0 && (
                  <div
                    ref={indicatorRef}
                    className="absolute bottom-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                    style={{
                      left: indicatorStyle.left,
                      width: indicatorStyle.width,
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="relative h-8 w-8 rounded-full p-0 hover:scale-105 transition-transform">
                      <Avatar className="h-8 w-8 border border-gray-700">
                        <AvatarImage
                          src={session.user?.avatarUrl || "/avatar-placeholder.jpg"}
                          alt={session.user?.name || "User"}
                        />
                        <AvatarFallback className="bg-emerald-500/20 text-emerald-400">
                          {session.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-gray-900 border-gray-800"
                    align="end"
                    sideOffset={8}
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-white">
                          {session.user?.name || "Пользователь"}
                        </p>
                        <p className="text-xs leading-none text-gray-400">
                          {session.user?.email || "user@example.com"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800">
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4 text-gray-400" />
                        <span>Профиль</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-gray-800 text-rose-400"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Выйти</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-emerald-400 transition-colors"
                >
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Войти
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  <Link href="/login?tab=register">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Регистрация
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
