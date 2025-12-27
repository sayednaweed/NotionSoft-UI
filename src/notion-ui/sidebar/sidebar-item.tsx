import { useMemo, useCallback, memo, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useLocation } from "react-router";
import CachedSvg, {
  CachedSvgProps,
} from "@/components/notion-ui/cached-svg/cached-svg";
import AnimatedItem from "@/components/notion-ui/animated-item";
import { cn } from "@/utils/cn";

export interface SubPermission {
  id: number;
  name: string;
  is_category: boolean;
}

export type Permission = {
  id: number;
  visible: boolean;
  permission: string;
  icon: string;
  sub: Map<number, SubPermission>;
};

export interface SidebarItemProps {
  path: string;
  isActive: boolean;
  permission: Permission;
  icon: CachedSvgProps;
  navigateTo: (path: string) => void;
  translate?: (key: string) => string;
  classNames?: {};
}

export const SidebarItem = memo(function SidebarItem({
  isActive,
  navigateTo,
  permission,
  path,
  icon,
  translate,
}: SidebarItemProps) {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // Calculate categories and selectedSubId
  const { categories, selectedSubId } = useMemo(() => {
    const subs = Array.from(permission.sub.values()).filter(
      (sub) => sub.is_category
    );
    const selectedId = Number(location.pathname.split("/").pop());
    return { categories: subs, selectedSubId: selectedId };
  }, [permission.sub, location.pathname]);

  // Auto-open dropdown if current URL matches any category
  useEffect(() => {
    const matched = categories.find((sub) =>
      location.pathname.includes(`${path}/${sub.id}`)
    );
    setShowDropdown(matched ? true : false);
  }, [location.pathname, categories, path]);
  useEffect(() => {
    const handleCloseDropdowns = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.forceClose) {
        setShowDropdown(false);
      }
    };

    // Listen for close events
    window.addEventListener("sidebar-close-dropdowns", handleCloseDropdowns);

    return () => {
      window.removeEventListener(
        "sidebar-close-dropdowns",
        handleCloseDropdowns
      );
    };
  }, []);
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (categories.length === 0) {
        navigateTo(path);
      } else {
        setShowDropdown((prev) => !prev);
        // Dispatch custom event to parent (Sidebar)
        const expandEvent = new CustomEvent("sidebar-item-expand", {
          bubbles: true, // This makes the event bubble up through DOM
          composed: true, // This allows it to cross shadow DOM boundaries if any
          detail: {
            hasChildren: true,
          },
        });

        // Dispatch from the clicked element
        e.currentTarget.dispatchEvent(expandEvent);
      }
    },
    [categories.length, navigateTo, path]
  );

  const handleCategoryClick = useCallback(
    (cat: SubPermission) => {
      navigateTo(`${path}/${cat.id}`);
    },
    [navigateTo, path]
  );

  const spring = useMemo(
    () => ({
      springProps: {
        from: { opacity: 0, transform: "translateY(-8px)" },
        config: { mass: 1, tension: 210, friction: 20 },
        to: { opacity: 1, transform: "translateY(0px)" },
      },
      intersectionArgs: { rootMargin: "-10% 0%", once: true },
    }),
    []
  );

  const dropdownContent = useMemo(() => {
    if (!showDropdown || categories.length === 0) return null;
    return (
      <div className="relative ltr:ml-5 rtl:mr-5 mt-1 mb-4 space-y-1 ltr:pl-2 rtl:pr-2 before:absolute before:top-3 before:bottom-0 rtl:before:right-1 ltr:before:left-1 before:w-px rounded-full before:bg-primary/30">
        {categories.map((cat, index) => {
          const selected = selectedSubId === cat.id;
          return (
            <AnimatedItem
              key={cat.id}
              springProps={{
                ...spring.springProps,
                delay: index * 100,
                to: {
                  ...spring.springProps.to,
                  delay: index * 100,
                },
              }}
              intersectionArgs={spring.intersectionArgs}
            >
              <div className="relative flex items-center before:absolute ltr:before:left-1 rtl:before:right-1 before:top-1/2 before:w-3 before:h-px before:bg-primary/40">
                <button
                  onClick={handleCategoryClick.bind(null, cat)}
                  className={`cursor-pointer text-primary/80 ltr:ml-5 rtl:mr-5 rtl:text-sm rtl:font-bold ltr:text-xs flex items-center gap-x-2 py-1 px-2 w-[85%] rounded-sm transition-colors ${
                    selected
                      ? "font-semibold bg-tertiary/10 text-primary"
                      : "hover:opacity-75"
                  }`}
                >
                  {translate ? translate(cat.name) : cat.name}
                </button>
              </div>
            </AnimatedItem>
          );
        })}
      </div>
    );
  }, [
    showDropdown,
    categories,
    selectedSubId,
    spring,
    handleCategoryClick,
    translate,
  ]);
  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          `grid grid-cols-[1fr_auto] ltr:py-2 dark:text-primary/70 rtl:p-1 ltr:pl-2.5 rtl:pr-[7px] ltr:mx-1 rtl:mx-1.5 text-primary items-center rtl:text-lg ltr:text-xs cursor-pointer rounded-md ${
            isActive
              ? `bg-tertiary/90 text-card dark:text-primary font-semibold`
              : "hover:opacity-75"
          }`
        )}
        key={permission.permission}
      >
        <div className="flex items-center gap-x-4 w-full">
          <CachedSvg {...icon} className={cn("rtl", icon.className)} />
          <h1 className="truncate">
            {translate
              ? translate(permission.permission)
              : permission.permission}
          </h1>
        </div>

        {categories.length > 0 && (
          <ChevronRight
            className={`size-3.5 min-h-3.5 min-w-3.5 text-primary ltr:mr-2 transition-transform duration-300 ease-in-out ${
              showDropdown ? "rotate-90" : "rtl:rotate-180"
            }`}
          />
        )}
      </div>

      {dropdownContent}
    </>
  );
}); // Pass custom comparison function
