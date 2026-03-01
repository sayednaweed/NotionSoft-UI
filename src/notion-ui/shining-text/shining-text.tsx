import * as React from "react";
import { useSpring, animated } from "@react-spring/web";
import { cn } from "@/utils/cn";

interface ShiningTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
}

function ShiningText({ text, className, ...props }: ShiningTextProps) {
  // Animate strictly left → right
  const styles = useSpring({
    from: { backgroundPosition: "-100% 0%" }, // start offscreen left
    to: { backgroundPosition: "100% 0%" }, // end offscreen right
    loop: true,
    config: { duration: 2000 },
  });

  return (
    <animated.span
      style={{
        backgroundSize: "200% 50%",
        ...styles,
      }}
      className={cn(
        "bg-linear-to-r text-md font-medium from-black via-gray-100 to-black", // left→right gradient
        "bg-clip-text text-transparent",
        className,
      )}
      {...props}
    >
      {text}
    </animated.span>
  );
}
export { ShiningText };
