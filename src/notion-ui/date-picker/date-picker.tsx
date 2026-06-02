import { useEffect, useMemo, useRef, useState } from "react";
import DateObject from "react-date-object";
import type { Calendar, Locale } from "react-date-object";
import { Calendar as Calendars } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { CalendarDays } from "lucide-react";
import { createPortal } from "react-dom";

import { cn } from "@/utils/cn";
import { AnimatedItem } from "@/components/notion-ui/animated-item";

type DatePickerSize = "sm" | "md" | "lg";

interface DatePickerProps {
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

const DEFAULT_DATE_PICKER_WIDTH = 280;
const VIEWPORT_PADDING = 8;

function DatePicker(props: DatePickerProps) {
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

  const calenderParentRef = useRef<HTMLDivElement | null>(null);
  const calendarWrapperRef = useRef<HTMLDivElement | null>(null);

  const [visible, setVisible] = useState(false);

  const [selectedDates, setSelectedDates] = useState<DateObject | undefined>(
    typeof value === "string" ? new DateObject(new Date(value)) : value,
  );

  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const hasError = !!errorMessage;

  const localizations = getLocalizations
    ? getLocalizations()
    : {
        calendar: gregorian,
        locale: gregorian_en,
        months: [],
      };

  const updateCalendarPosition = () => {
    if (!calenderParentRef.current) return;

    const rect = calenderParentRef.current.getBoundingClientRect();

    const maxAllowedWidth = window.innerWidth - VIEWPORT_PADDING * 2;

    const dialogWidth = Math.min(
      Math.max(rect.width, DEFAULT_DATE_PICKER_WIDTH),
      maxAllowedWidth,
    );

    let left = rect.left + rect.width / 2 - dialogWidth / 2;

    if (left < VIEWPORT_PADDING) {
      left = VIEWPORT_PADDING;
    }

    if (left + dialogWidth > window.innerWidth - VIEWPORT_PADDING) {
      left = window.innerWidth - dialogWidth - VIEWPORT_PADDING;
    }

    setPosition({
      top: rect.bottom + 4,
      left,
      width: dialogWidth,
    });
  };

  useEffect(() => {
    if (!visible) return;

    updateCalendarPosition();

    window.addEventListener("resize", updateCalendarPosition);
    window.addEventListener("scroll", updateCalendarPosition, true);

    return () => {
      window.removeEventListener("resize", updateCalendarPosition);
      window.removeEventListener("scroll", updateCalendarPosition, true);
    };
  }, [visible]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedInsideCalendar =
        calendarWrapperRef.current?.contains(target);

      const clickedInsideParent = calenderParentRef.current?.contains(target);

      if (!clickedInsideCalendar && !clickedInsideParent) {
        setVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSelectedDates(
      typeof value === "string" ? new DateObject(new Date(value)) : value,
    );
  }, [value]);

  const formatHijriDate = (date?: DateObject) => {
    try {
      if (date) {
        return date
          .convert(localizations.calendar, localizations.locale)
          .format(format);
      }
    } catch (e) {
      console.log(e, "DatePicker");
    }

    return undefined;
  };

  const handleDateChange = (date: DateObject) => {
    const failed = dateOnComplete(date);

    if (failed) return;

    setSelectedDates(date);
    setVisible(false);
  };

  const onVisibilityChange = () => {
    if (!readOnly) {
      setVisible((current) => !current);
    }
  };

  const heightStyle = useMemo(
    () =>
      measurement === "lg"
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
        : measurement === "md"
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
    [measurement, label],
  );

  const readOnlyStyle = readOnly && "opacity-40 cursor-not-allowed";

  return (
    <div
      ref={calenderParentRef}
      className={cn("relative", rootDivClassName, readOnlyStyle)}
    >
      <style>
        {`
          .date-picker-popup .rmdp-wrapper {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box;
            box-shadow: none !important;
          }

          .date-picker-popup .rmdp-calendar {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box;
            padding: 12px;
          }

          .date-picker-popup .rmdp-header {
            width: 100% !important;
            box-sizing: border-box;
          }

          .date-picker-popup .rmdp-header-values {
            width: 100% !important;
            justify-content: center;
            text-align: center;
            box-sizing: border-box;
          }

          .date-picker-popup .rmdp-day-picker {
            width: 100% !important;
            box-sizing: border-box;
          }

          .date-picker-popup .rmdp-day-picker > div {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box;
          }

          .date-picker-popup .rmdp-week,
          .date-picker-popup .rmdp-week-days {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: repeat(7, minmax(0, 1fr));
            justify-items: center;
            align-items: center;
            box-sizing: border-box;
          }

          .date-picker-popup .rmdp-week-day {
            width: 100% !important;
            min-width: 0 !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
          }

          .date-picker-popup .rmdp-day {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            min-height: 32px !important;
            max-width: 32px !important;
            max-height: 32px !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
          }

          .date-picker-popup .rmdp-day span {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
            min-height: 28px !important;
            max-width: 28px !important;
            max-height: 28px !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            border-radius: 50% !important;
            box-sizing: border-box;
          }

          .date-picker-popup .rmdp-selected span,
          .date-picker-popup .rmdp-today span {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
            min-height: 28px !important;
            max-width: 28px !important;
            max-height: 28px !important;
            border-radius: 50% !important;
          }

          .date-picker-popup .rmdp-arrow-container {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
            min-height: 28px !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            border-radius: 50% !important;
            box-sizing: border-box;
            margin: 0;
          }

          .date-picker-popup .rmdp-arrow-container:hover {
            border-radius: 50% !important;
          }

          .date-picker-popup .rmdp-arrow {
            margin: 0 !important;
          }
        `}
      </style>

      {visible &&
        position &&
        createPortal(
          <div
            ref={calendarWrapperRef}
            className="date-picker-popup"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              minWidth: Math.min(
                DEFAULT_DATE_PICKER_WIDTH,
                window.innerWidth - VIEWPORT_PADDING * 2,
              ),
              maxWidth: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
              zIndex: 9999,
              backgroundColor: "white",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              borderRadius: "6px",
              boxSizing: "border-box",
              overflow: "hidden",
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
          document.body,
        )}

      {requiredHint && (
        <span
          className={cn(
            "absolute font-semibold text-red-600 rtl:text-[13px] ltr:text-[11px] ltr:right-2.5 rtl:left-2.5",
            heightStyle.required,
          )}
        >
          {requiredHint}
        </span>
      )}

      {label && (
        <label
          htmlFor={label}
          className="font-semibold ltr:text-[13px] rtl:text-[18px] inline-block pb-1"
        >
          {label}
        </label>
      )}

      <div
        style={{
          height: heightStyle.height,
        }}
        className={cn(
          "flex items-center text-start px-3 border select-none rounded-sm rtl:text-[17px] ltr:text-[13px]",
          !readOnly && "cursor-pointer",
          className,
        )}
        onClick={onVisibilityChange}
      >
        {selectedDates ? (
          <h1 className="flex items-center gap-x-2 text-ellipsis rtl:text-[17px] ltr:text-[13px] text-primary/80 whitespace-nowrap overflow-hidden">
            <CalendarDays className="size-4 inline-block text-tertiary rtl:ml-2 rtl:mr-2" />
            {formatHijriDate(selectedDates)}
          </h1>
        ) : (
          <h1 className="flex items-center gap-x-2 text-ellipsis rtl:text-[17px] ltr:text-[13px] font-semibold text-primary whitespace-nowrap overflow-hidden">
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
          <h1 className="text-red-400 text-start capitalize rtl:text-sm rtl:font-medium ltr:text-[11px]">
            {errorMessage}
          </h1>
        </AnimatedItem>
      )}
    </div>
  );
}

export { type DatePickerProps, type DatePickerSize, DatePicker };
