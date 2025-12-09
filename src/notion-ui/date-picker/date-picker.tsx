import { useEffect, useMemo, useRef, useState } from "react";
import DateObject from "react-date-object";
import type { Calendar, Locale } from "react-date-object";
import { Calendar as Calendars } from "react-multi-date-picker";
export type DatePickerSize = "sm" | "md" | "lg";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { CalendarDays } from "lucide-react";
import { createPortal } from "react-dom";

import AnimatedItem from "../animated-item";
import { cn } from "../../utils/cn";

export interface DatePickerProps {
  dateOnComplete: (date: DateObject) => boolean | void;
  value: DateObject | undefined | string;
  className?: string;
  classNames?: {
    rootDivClassName?: string;
  };
  getLocalizations?: () => {
    calendar?: Calendar;
    locale?: Locale;
    months?: string[];
  };
  placeholder: string;
  place?: string;
  format?: string;
  requiredHint?: string;
  hintColor?: string;
  label?: string;
  errorMessage?: string;
  readOnly?: boolean;
  measurement?: DatePickerSize;
}

export default function DatePicker(props: DatePickerProps) {
  const {
    dateOnComplete,
    value,
    className,
    classNames,
    placeholder,
    requiredHint,
    measurement,
    label,
    errorMessage,
    readOnly,
    format = "YYYY-MM-DD",
    getLocalizations,
  } = props;
  const { rootDivClassName } = classNames || {};

  const [visible, setVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState<DateObject | undefined>(
    typeof value === "string" ? new DateObject(new Date(value)) : value
  );

  const calendarWrapperRef = useRef<HTMLDivElement | null>(null);
  const calenderParentRef = useRef<HTMLDivElement | null>(null);
  const hasError = !!errorMessage;

  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Close calendar on outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarWrapperRef.current &&
        !calendarWrapperRef.current.contains(event.target as Node) &&
        calenderParentRef.current &&
        !calenderParentRef.current.contains(event.target as Node)
      ) {
        setVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update position when calendar becomes visible
  useEffect(() => {
    if (visible && calenderParentRef.current) {
      const rect = calenderParentRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [visible]);

  const formatHijriDate = (date?: DateObject) => {
    try {
      if (date) {
        return date
          .convert(localizations.calendar, localizations.locale)
          .format(format);
      }
    } catch (e: any) {
      console.log(e, "DatePicker");
    }
    return undefined;
  };

  const handleDateChange = (date: DateObject) => {
    setVisible(false);
    const failed = dateOnComplete(date);
    if (failed) return;
    setSelectedDates(date);
  };

  const onVisibilityChange = () => {
    if (!readOnly) setVisible((v) => !v);
  };

  const localizations = getLocalizations
    ? getLocalizations()
    : {
        calendar: gregorian,
        locale: gregorian_en,
        months: [],
      };
  const heightStyle = useMemo(
    () =>
      measurement == "lg"
        ? {
            height: "50px",
            paddingBottom: "pb-[3px]",
            endContent: label
              ? "ltr:top-[48px] rtl:top-[54px]-translate-y-1/2"
              : "top-[26px] -translate-y-1/2",
            startContent: label
              ? "ltr:top-[48px] rtl:top-[54px] -translate-y-1/2"
              : "top-[26px] -translate-y-1/2",
            required: label ? "ltr:top-[4px] rtl:top-[12px]" : "top-[-19px]",
          }
        : measurement == "md"
        ? {
            height: "44px",
            paddingBottom: "pb-[2px]",
            endContent: label
              ? "ltr:top-[45px] rtl:top-[51px] -translate-y-1/2"
              : "top-[22px] -translate-y-1/2",
            startContent: label
              ? "ltr:top-[45px] rtl:top-[51px] -translate-y-1/2"
              : "top-[22px] -translate-y-1/2",
            required: label ? "ltr:top-[4px] rtl:top-[12px]" : "top-[-19px]",
          }
        : {
            height: "40px",
            paddingBottom: "pb-[2px]",
            endContent: label
              ? "ltr:top-[44px] rtl:top-[50px] -translate-y-1/2"
              : "top-[20px] -translate-y-1/2",
            startContent: label
              ? "ltr:top-[44px] rtl:top-[50px] -translate-y-1/2"
              : "top-[20px] -translate-y-1/2",
            required: label ? "ltr:top-[4px] rtl:top-[12px]" : "top-[-19px]",
          },
    [measurement, label]
  );
  const readOnlyStyle = readOnly && "opacity-40";
  return (
    <div
      ref={calenderParentRef}
      className={cn("relative", rootDivClassName, readOnlyStyle)}
    >
      {/* Calendar portal */}
      {visible &&
        position &&
        createPortal(
          <div
            ref={calendarWrapperRef}
            style={{
              position: "absolute",
              top: position.top,
              left: position.left,
              zIndex: 9999,
              backgroundColor: "white",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              borderRadius: "6px",
            }}
          >
            <Calendars
              value={selectedDates}
              onChange={handleDateChange}
              months={localizations.months}
              calendar={localizations.calendar}
              locale={localizations.locale}
            />
          </div>,
          document.body
        )}
      {/* Required Hint */}
      {requiredHint && (
        <span
          className={cn(
            "absolute font-semibold text-red-600 rtl:text-[13px] ltr:text-[11px] ltr:right-2.5 rtl:left-2.5",
            heightStyle.required
          )}
        >
          {requiredHint}
        </span>
      )}

      {/* Label */}
      {label && (
        <label
          htmlFor={label}
          className={cn(
            "font-semibold rtl:text-xl-rtl ltr:text-lg-ltr inline-block pb-1"
          )}
        >
          {label}
        </label>
      )}
      {/* Input / trigger div */}
      <div
        style={{
          height: heightStyle.height,
        }}
        className={cn(
          "flex items-center text-start px-3 border select-none rounded-sm rtl:text-lg-rtl ltr:text-lg-ltr",
          className
        )}
        onClick={onVisibilityChange}
      >
        {selectedDates ? (
          <h1 className="flex items-center gap-x-2 text-ellipsis rtl:text-lg-rtl ltr:text-lg-ltr text-primary/80 whitespace-nowrap overflow-hidden">
            <CalendarDays className="size-4 inline-block text-tertiary rtl:ml-2 rtl:mr-2" />
            {formatHijriDate(selectedDates)}
          </h1>
        ) : (
          <h1 className="flex items-center gap-x-2 text-ellipsis rtl:text-lg-rtl ltr:text-lg-ltr font-semibold text-primary whitespace-nowrap overflow-hidden">
            <CalendarDays className="size-4 inline-block text-tertiary" />
            {placeholder}
          </h1>
        )}
      </div>

      {hasError && (
        <AnimatedItem
          springProps={{
            from: {
              opacity: 0,
              transform: "translateY(-8px)",
            },
            config: {
              mass: 1,
              tension: 210,
              friction: 20,
            },
            to: {
              opacity: 1,
              transform: "translateY(0px)",
            },
          }}
          intersectionArgs={{ once: true, rootMargin: "-5% 0%" }}
        >
          <h1 className="text-red-400 text-start capitalize rtl:text-sm rtl:font-medium ltr:text-sm-ltr">
            {errorMessage}
          </h1>
        </AnimatedItem>
      )}
    </div>
  );
}
