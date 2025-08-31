"use client";

import { ArrowLeft, User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "~/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean;
  title?: string;
}

export function Header({ onBack, showBack = false, title }: HeaderProps) {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getUserInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 max-w-none">
        {/* Left side - Back button or title */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          {showBack && onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 hover:bg-muted shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {title && (
            <h1 className="text-sm sm:text-lg font-semibold text-foreground truncate">
              {title}
            </h1>
          )}
        </div>

        {/* Center - App title */}
        <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
            <Image
              src="/alissa-waifu.png"
              alt="Alissa"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-base sm:text-lg font-bold text-primary hidden sm:block">
            AI Trivia
          </span>
        </div>

        {/* Right side - User dropdown */}
        <div className="flex justify-end flex-1">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full p-0 shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.user?.image || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials(session.user?.name, session.user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {getUserInitials(session.user?.name, session.user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">
                      {session.user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>
      </div>
    </header>
  );
}
