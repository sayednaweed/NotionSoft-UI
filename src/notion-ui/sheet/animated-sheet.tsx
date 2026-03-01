import { cn } from "@/utils/cn";

import { useTransition, animated } from "@react-spring/web";
import { X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import ReactDOM from "react-dom";

type PositionType = "center" | "left" | "top" | "bottom" | "right";
type AnimateType = "left" | "top" | "right" | "bottom";
type AnimatedSheetProps = {
  open?: boolean;
  button?: ReactNode;
  children?: ReactNode;
  onClose?: (open: boolean) => void;
  style?: {
    rootContainerClassName?: string;
    mainContainerClassName?: string;
    iconClassName?: string;
  };
  position: PositionType;
  animate: AnimateType;
};

function AnimatedSheet({
  open,
  onClose,
  children,
  button,
  style,
  position,
  animate,
}: AnimatedSheetProps) {
  const { rootContainerClassName, mainContainerClassName, iconClassName } =
    style || {};
  const [status, setStatus] = useState<boolean | undefined>(false);

  useEffect(() => {
    setStatus(open);
  }, [open]);
  const itemsPosition = useMemo(() => {
    const animation =
      animate == "left"
        ? "translateX(-100%)"
        : animate == "right"
          ? "translateX(100%)"
          : animate == "top"
            ? "translateY(-100%)"
            : "translateY(100%)";

    return position == "left"
      ? {
          rootContainer: "rtl:left-0 ltr:right-0 top-0",
          icon: "",
          transitionFrom: animation,
          transitionEnter: "translateX(0%)",
        }
      : position == "right"
        ? {
            rootContainer: "rtl:right-0 ltr:left-0 top-0",
            icon: "",
            transitionFrom: animation,
            transitionEnter: "translateX(0%)",
          }
        : position == "center"
          ? {
              rootContainer:
                "rtl:left-1/2 ltr:right-1/2 top-0 rtl:-translate-x-1/2 ltr:translate-x-1/2",
              icon: "rtl:order-1",
              transitionFrom: animation,
              transitionEnter: "translateX(0%)",
            }
          : position == "top"
            ? {
                rootContainer:
                  "rtl:left-1/2 ltr:right-1/2 top-0 rtl:-translate-x-1/2 ltr:translate-x-1/2",
                icon: "order-1",
                transitionFrom: animation,
                transitionEnter: "translateY(0%)",
              }
            : {
                rootContainer:
                  "rtl:left-1/2 ltr:right-1/2 top-0 rtl:-translate-x-1/2 ltr:translate-x-1/2",
                icon: "order-1",
                transitionFrom: animation,
                transitionEnter: "translateY(0%)",
              };
  }, [position]);

  const transitions = useTransition(status, {
    from: {
      opacity: 0,
      transform: itemsPosition.transitionFrom,
    },
    enter: { opacity: 1, transform: itemsPosition.transitionEnter },
    config: { tension: 250, friction: 30 },
  });

  const overlayTransitions = useTransition(status, {
    from: { opacity: 0 },
    enter: { opacity: 0.5 },
    config: { tension: 250, friction: 30 },
  });

  const onCloseSheet = () => {
    if (onClose) onClose(!status);
    setStatus((prev) => !prev);
  };

  if (!status) return button;

  return ReactDOM.createPortal(
    <>
      {overlayTransitions(
        (style, item) =>
          item && (
            <animated.div
              style={style}
              onClick={onCloseSheet}
              className="fixed bg-card inset-0 z-50"
              aria-hidden="true"
            />
          ),
      )}

      {transitions(
        (style, item) =>
          item && (
            <div
              onClick={onCloseSheet}
              className={cn(
                "fixed flex w-screen xxl:min-w-[400px] xxl:w-fit z-50 h-screen justify-end",
                itemsPosition.rootContainer,
                rootContainerClassName,
              )}
            >
              <X
                onClick={onCloseSheet}
                className={cn(
                  "fixed xxl:static z-51 text-primary-foreground bg-primary cursor-pointer rounded-full h-6 w-7 p-1 sm:m-4 m-2 hover:bg-primary/90 xxl:hover:bg-primary/90 transition-colors",
                  itemsPosition.icon,
                  iconClassName,
                )}
              />
              <animated.div
                style={style}
                className={cn(
                  "h-full w-full z-50 backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg",
                  mainContainerClassName,
                )}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
              >
                {children}
              </animated.div>
            </div>
          ),
      )}
    </>,
    document.body,
  );
}
export { AnimatedSheet };
