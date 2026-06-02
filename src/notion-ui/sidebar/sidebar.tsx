import React, { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { AlignLeft, type LucideIcon } from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  collapsed?: boolean;
  setCollapsed?: (open: boolean) => void;
  mobileHamburgerIcon?: {
    icon: LucideIcon;
    className?: string;
    onClick?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  };
  desktopHamburgerIcon?: {
    icon: LucideIcon;
    className?: string;
    onClick?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  };
  classNames?: {
    wrapperClassName?: string;
  };
}
interface SidebarExpandEventDetail {
  hasChildren: boolean;
}
type SidebarCompound = React.FC<SidebarProps> & {
  Header: typeof SidebarHeader;
  Footer: typeof SidebarFooter;
  Content: typeof SidebarContent;
};

const Sidebar: SidebarCompound = ({
  children,
  className,
  collapsed,
  setCollapsed,
  mobileHamburgerIcon = { icon: AlignLeft },
  desktopHamburgerIcon = { icon: AlignLeft },
  classNames,
  ...rest
}) => {
  const { wrapperClassName } = classNames || {};
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    return stored ? JSON.parse(stored) : false;
  });
  const sidebarRef = useRef<HTMLElement>(null); // This is already your nav ref
  const open = collapsed ?? internalCollapsed;
  const [hideSiderbar, setHideSiderbar] = useState(false);

  useEffect(() => {
    const handleExpandEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail as SidebarExpandEventDetail;
      if (detail?.hasChildren) {
        if (open) {
          if (setCollapsed) {
            // Controlled: call parent callback
            setCollapsed(false);
          } else {
            // Uncontrolled: update internal state + localStorage
            setInternalCollapsed(() => {
              localStorage.setItem("sidebar_collapsed", JSON.stringify(false));
              return false;
            });
          }
        }
      }
    };

    if (sidebarRef.current) {
      sidebarRef.current.addEventListener(
        "sidebar-item-expand",
        handleExpandEvent,
      );
    }

    return () => {
      if (sidebarRef.current) {
        sidebarRef.current.removeEventListener(
          "sidebar-item-expand",
          handleExpandEvent,
        );
      }
    };
  }, [open]);
  const toggle = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (desktopHamburgerIcon.onClick) desktopHamburgerIcon.onClick(e);
    if (setCollapsed) {
      // Controlled: call parent callback
      setCollapsed(!open);
    } else {
      // Uncontrolled: update internal state + localStorage
      setInternalCollapsed((prev) => {
        const newValue = !prev;
        localStorage.setItem("sidebar_collapsed", JSON.stringify(newValue));
        return newValue;
      });
    }
  };

  let header: React.ReactNode = null;
  let footer: React.ReactNode = null;
  let content: React.ReactNode = null;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    switch (child.type) {
      case SidebarHeader:
        header = child;
        break;
      case SidebarFooter:
        footer = child;
        break;
      case SidebarContent:
        content = child;
        break;
    }
  });
  // In Sidebar component, add this useEffect
  useEffect(() => {
    const closeAllDropdowns = () => {
      if (open) {
        // When sidebar is collapsed (w-12)
        // Dispatch an event to tell all sidebar items to close their dropdowns
        const closeEvent = new CustomEvent("sidebar-close-dropdowns", {
          bubbles: true,
          composed: true,
          detail: { forceClose: true },
        });

        if (sidebarRef.current) {
          sidebarRef.current.dispatchEvent(closeEvent);
        }
      }
    };

    closeAllDropdowns();
  }, [open]); // Run whenever collapsed state changes

  return (
    <>
      <div
        onClick={() => setHideSiderbar(false)}
        className={cn(
          "fixed z-50 ltr:left-0 rtl:right-0 lg:hidden top-0 px-2 pt-1",
          hideSiderbar
            ? "w-screen h-screen bg-black/20" // Full screen with semi-transparent bg
            : "w-auto h-auto", // Just icon size
          wrapperClassName,
        )}
      >
        <mobileHamburgerIcon.icon
          onClick={(e) => {
            e.stopPropagation(); // Prevent event from bubbling to parent
            if (mobileHamburgerIcon.onClick) mobileHamburgerIcon.onClick(e);
            setHideSiderbar(true);
          }}
          className={cn(
            `size-5 mt-2 text-tertiary hover:scale-105 transition-transform mx-auto cursor-pointer`,
            hideSiderbar ? "hidden" : "block",
            mobileHamburgerIcon.className,
          )}
        />
      </div>
      <nav
        ref={sidebarRef}
        {...rest}
        className={cn(
          "overflow-x-hidden bg-card fixed grid lg:grid-rows-[auto_auto_1fr_auto] grid-rows-[auto_1fr_auto] overflow-hidden z-50 transition-all duration-200 dark:text-card-foreground text-primary-foreground h-screen",
          // Mobile behavior
          hideSiderbar
            ? "ltr:left-0 rtl:right-0"
            : "ltr:left-[-300px] rtl:right-[-300px]",
          // Desktop behavior - always visible with proper width
          "lg:relative! lg:left-0! lg:right-0! lg:w-[280px]!", // Default desktop width
          // Collapsed state on desktop
          open ? "lg:w-12!" : "lg:w-[280px]",
          // Mobile width
          `w-[280px]`, // Set a proper width for mobile too
          className,
        )}
      >
        <desktopHamburgerIcon.icon
          onClick={toggle}
          className={cn(
            `size-5 mt-2 text-tertiary hidden lg:block hover:scale-105 transition-transform mx-auto cursor-pointer`,
            desktopHamburgerIcon.className,
          )}
        />
        {header}
        {content}
        {footer}
      </nav>
    </>
  );
};
interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

// Use forwardRef to accept ref prop
const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
  function SidebarContent({ children, className, ...rest }, ref) {
    return (
      <div
        ref={ref} // Pass the ref here
        {...rest}
        className={cn(
          "overflow-y-auto flex flex-col overflow-x-hidden pb-12",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

SidebarContent.displayName = "SidebarContent";

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarFooter = forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        {...rest}
        className={cn(
          "sticky w-full overflow-x-hidden bottom-0 z-50 flex flex-col items-center gap-y-1 border-t border-secondary-foreground/15 pt-4 mt-4 bg-transparent",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

SidebarFooter.displayName = "SidebarFooter";

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarHeader = forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        {...rest}
        className={cn(
          "sticky w-full overflow-x-hidden top-0 z-50 flex flex-col justify-center items-center gap-y-1 border-b border-secondary-foreground/15 pb-4 mt-2 bg-transparent",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

SidebarHeader.displayName = "SidebarHeader";

interface SeparatorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {}

function Separator({ className, ...rest }: SeparatorProps) {
  return (
    <div
      {...rest}
      className={cn("w-full bg-secondary-foreground/15 h-px", className)}
    />
  );
}
Separator.displayName = "Separator";

/* Compound attachments */
Sidebar.Header = SidebarHeader;
Sidebar.Footer = SidebarFooter;
Sidebar.Content = SidebarContent;

export {
  type SidebarProps,
  Sidebar,
  Separator,
  type SidebarHeaderProps,
  type SidebarContentProps,
  SidebarContent,
  type SidebarFooterProps,
  SidebarFooter,
  SidebarHeader,
  type SeparatorProps,
};
