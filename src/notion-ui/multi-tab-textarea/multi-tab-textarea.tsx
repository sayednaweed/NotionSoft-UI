import { AnimatedItem } from "@/components/notion-ui/animated-item";
import { OptionalTabs, Tab, TabState } from "@/components/notion-ui/tab";
import { Textarea } from "@/components/notion-ui/textarea";
import { cn } from "@/utils/cn";
import React, { type ReactElement, useState, useMemo } from "react";

interface MultiTabTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  children:
    | ReactElement<typeof Tab>
    | ReactElement<typeof Tab>[]
    | ReactElement<typeof OptionalTabs>;
  tabData: Record<string, string>;
  errorData?: Map<string, string>;
  onTabChanged?: (key: string, data: string, optional?: boolean) => void;
  onChanged: (value: string, name: string) => void;
  placeholder?: string;
  label?: string;
  name: string;
  classNames?: {
    tabsDivClassName?: string;
    rootDivClassName?: string;
  };
}

const MultiTabTextarea = React.forwardRef<
  HTMLTextAreaElement,
  MultiTabTextareaProps
>((props, ref) => {
  const {
    className,
    name,
    classNames,
    children,
    tabData,
    errorData,
    onTabChanged,
    onChanged,
    placeholder,
    label,
    ...rest
  } = props;
  const { tabsDivClassName, rootDivClassName } = classNames || {};
  // Separate mandatory and optional tabs (memoized)
  const { mandatoryTabs, optionalTabs } = useMemo(() => {
    const mandatory: React.ReactElement<any>[] = [];
    const optional: React.ReactElement<any>[] = [];

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;

      // Type-safe element access
      const element = child as React.ReactElement<any>;
      const typeName = (element.type as any)?.displayName;

      if (typeName === "OptionalTabs") {
        React.Children.forEach(element.props.children, (c) => {
          if (React.isValidElement(c))
            optional.push(c as React.ReactElement<any>);
        });
      } else if (typeName === "Tab") {
        mandatory.push(element);
      }
    });

    return { mandatoryTabs: mandatory, optionalTabs: optional };
  }, [children]);

  // Initialize state
  const [tabState, setTabState] = useState({
    active: mandatoryTabs[0]?.props.children || "",
    mandatory: mandatoryTabs[0]?.props.children || "",
    optional: optionalTabs[0]?.props.children || "",
  });

  const selectionName = `${name}_selections`;

  const handleTabChange = (tabName: string, optional = false) => {
    setTabState((prev) => ({
      ...prev,
      active: tabName,
      [optional ? "optional" : "mandatory"]: tabName,
    }));
    onTabChanged?.(selectionName, tabName, optional);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChanged(e.target.value, e.target.name);
  };

  const generateUniqueName = (base: string, key: string) => `${base}_${key}`;

  const getTabState = (tabName: string, optional = false): TabState => {
    if (tabName === tabState.active) return "active";
    if (optional)
      return tabName === tabState.optional ? "selected" : "unselected";
    return tabName === tabState.mandatory ? "selected" : "unselected";
  };

  const renderTabs = (tabs: React.ReactElement<any>[], optional = false) =>
    tabs.map((tab, idx) => {
      const tabName = tab.props.children;
      const state: TabState = getTabState(tabName, optional);
      const tabHasError = hasError(tabName);

      return React.cloneElement(tab, {
        key: `${optional ? "opt" : "mand"}-${idx}`,
        state,
        optional,
        onClick: () => handleTabChange(tabName, optional),
        className: cn(
          tab.props.className,
          tabHasError && "text-red-400 border-red-400",
        ),
      });
    });
  const hasError = (tabKey: string) => {
    if (!errorData) return false;
    return errorData.has(generateUniqueName(name, tabKey));
  };
  const activeTabName = generateUniqueName(name, tabState.active);
  const selectTabValue = tabData[activeTabName] || "";

  const direction =
    activeTabName.endsWith("farsi") || activeTabName.endsWith("pashto")
      ? "rtl"
      : "ltr";
  const errorMessage = useMemo(() => {
    if (!errorData) return null;

    return Array.from(errorData.entries())
      .filter(([key]) => key.startsWith(`${name}_`))
      .map(([key, value], index) => (
        <AnimatedItem
          key={key}
          springProps={{
            from: { opacity: 0, transform: "translateY(-8px)" },
            to: { opacity: 1, transform: "translateY(0px)" },
            delay: index * 100,
            config: { mass: 1, tension: 210, friction: 20 },
          }}
          intersectionArgs={{ once: true, rootMargin: "-5% 0%" }}
        >
          <h1 className="text-red-400 text-start capitalize rtl:text-sm rtl:font-medium ltr:text-[11px]">
            {value}
          </h1>
        </AnimatedItem>
      ));
  }, [errorData, name]);

  return (
    <div className={cn("flex flex-col select-none", rootDivClassName)}>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-end gap-4">
        {label && (
          <h1 className="font-semibold relative top-1 rtl:text-lg ltr:text-[13px] text-start">
            {label}
          </h1>
        )}

        <div
          className={cn("flex flex-wrap gap-2 items-center", tabsDivClassName)}
        >
          {renderTabs(mandatoryTabs)}
          {optionalTabs.length > 0 && (
            <>
              <span className="bg-primary/30 sm:w-px w-full h-px sm:my-0 sm:mx-2 sm:h-4" />
              {renderTabs(optionalTabs, true)}
            </>
          )}
        </div>
      </div>

      <Textarea
        dir={direction}
        {...rest}
        ref={ref}
        name={activeTabName}
        value={selectTabValue}
        placeholder={placeholder}
        onChange={handleInputChange}
        className={cn(
          `mt-2 ${
            errorMessage &&
            errorMessage.length > 0 &&
            "border-red-400 border-b!"
          }`,
          className,
        )}
      />

      {errorMessage}
    </div>
  );
});

export { MultiTabTextarea, type MultiTabTextareaProps };
