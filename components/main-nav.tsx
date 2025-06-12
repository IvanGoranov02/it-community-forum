"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";

const MainNav = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center space-x-4">
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link
            href="/"
            className={cn(
              "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
              pathname === "/" ? "bg-accent/50" : "bg-transparent"
            )}
          >
            Home
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link
            href="/about"
            className={cn(
              "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
              pathname === "/about" ? "bg-accent/50" : "bg-transparent"
            )}
          >
            About
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    </div>
  );
};

export default MainNav; 