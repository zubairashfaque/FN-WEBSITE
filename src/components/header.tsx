import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import Logo from "./ui/logo";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  onContactClick: () => void;
  isOnBlogPage?: boolean;
}

const Header = ({
  onContactClick = () => {},
  isOnBlogPage = false,
}: HeaderProps) => {
  const location = useLocation();

  // Check if we're on a detail page (blog post or use case)
  const isOnDetailPage =
    location.pathname.startsWith("/blog/") ||
    location.pathname.startsWith("/use-cases/");

  // If we're on a detail page or blog page, links should go to home page sections
  const shouldLinkToHome = isOnDetailPage || isOnBlogPage;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <a href="/">
            <Logo />
          </a>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a
            href={shouldLinkToHome ? "/#services" : "#services"}
            className="text-sm font-medium transition-colors duration-200 text-foreground/60 hover:text-foreground"
          >
            Services
          </a>
          <a
            href={shouldLinkToHome ? "/#process" : "#process"}
            className="text-sm font-medium transition-colors duration-200 text-foreground/60 hover:text-foreground"
          >
            Process
          </a>
          <a
            href={shouldLinkToHome ? "/#team" : "#team"}
            className="text-sm font-medium transition-colors duration-200 text-foreground/60 hover:text-foreground"
          >
            Team
          </a>
          <a
            href="/blog"
            className={`text-sm font-medium transition-colors duration-200 ${location.pathname.startsWith("/blog") ? "text-foreground" : "text-foreground/60 hover:text-foreground"}`}
          >
            Blog
          </a>
          <a
            href="/usecases"
            className={`text-sm font-medium transition-colors duration-200 ${location.pathname.startsWith("/usecases") || location.pathname.startsWith("/use-cases") ? "text-foreground" : "text-foreground/60 hover:text-foreground"}`}
          >
            Use Cases
          </a>

          <div tabIndex={0}>
            <Button
              onClick={onContactClick}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-[#ff3131] hover:bg-[#ff3131]/90 text-white transition-colors duration-200"
            >
              Let's talk
            </Button>
          </div>
        </div>

        <button className="md:hidden" aria-label="Toggle menu" tabIndex={0}>
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </nav>
  );
};

export default Header;
