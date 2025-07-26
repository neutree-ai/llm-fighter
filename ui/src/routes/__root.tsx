import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { to: "/", label: "Home" },
  { to: "/games", label: "Games" },
  { to: "/docs/design", label: "Design Doc" },
  { to: "/docs/faq", label: "FAQ" },
] as const;

function NavLink({
  to,
  label,
  className,
  onClick,
}: {
  to: string;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "text-foreground transition-colors hover:text-primary",
        isActive && "text-primary font-medium",
        className
      )}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

function DesktopNavigation() {
  return (
    <NavigationMenu className="hidden md:flex w-full">
      <NavigationMenuList>
        <NavigationMenuItem className="flex items-center">
          <img
            src="/logo.png"
            alt="LLM Fighter Logo"
            className="h-8 w-8 inline-block mr-2"
          />
        </NavigationMenuItem>

        {menuItems.map((item) => (
          <NavigationMenuItem key={item.to}>
            <NavigationMenuLink asChild>
              <NavLink to={item.to} label={item.label} />
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}

        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <div className="md:hidden flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="dark">
            <nav className="flex flex-col space-y-2 p-4">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  className="text-lg py-2"
                  onClick={handleClose}
                />
              ))}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg py-2 text-foreground hover:text-primary transition-colors flex items-center"
                onClick={handleClose}
              >
                <img
                  src="/github-mark-white.png"
                  alt="GitHub Logo"
                  className="h-5 w-5 inline-block mr-2"
                />
                GitHub
              </a>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="text-foreground">Menu</div>
      </div>
      <img
        src="/logo.png"
        alt="LLM Fighter Logo"
        className="h-8 w-8 inline-block mr-2"
      />
    </div>
  );
}

export const Route = createRootRoute({
  component: () => (
    <div className="relative">
      <div className="bg-background py-2 px-4 fixed top-2 z-50 left-8 right-8 rounded-xl shadow-xl flex justify-between items-center">
        <DesktopNavigation />
        <MobileNavigation />

        <a
          className="hidden md:block cursor-pointer"
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/github-mark-white.png"
            alt="GitHub Logo"
            className="h-6 w-6 inline-block"
          />
        </a>
      </div>

      <Outlet />

      <footer className="py-8 bg-background">
        <div className="container mx-auto px-8 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 Neutree AI. Built for the AI community.
            </div>

            <div className="flex items-center space-x-6">
              <a
                href="https://github.com"
                className="text-muted-foreground hover:text-primary transition-colors font-fighter"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  ),
});
