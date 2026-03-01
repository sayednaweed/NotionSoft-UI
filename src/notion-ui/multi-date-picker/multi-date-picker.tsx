import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import type { Calendar, Locale } from "react-date-object";
import type DateObject from "react-date-object";
import { Calendar as Calendars } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { cn } from "@/utils/cn";
import { AnimatedItem } from "@/components/notion-ui/animated-item";

type MultiDatePickerSize = "sm" | "md" | "lg";

interface MultiDatePickerText {
  label?: string;
  requiredHint?: string;
  placeholder?: string;
  to?: string;
}
interface MultiDatePickerProps {
  dateOnComplete: (selectedDates: DateObject[]) => void;
  value: DateObject[];
  className?: string;
  measurement?: MultiDatePickerSize;
  classNames?: {
    rootDivClassName?: string;
  };
  error?: string;
  readOnly?: boolean;
  text?: MultiDatePickerText;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  getLocalizations?: () => {
    calendar?: Calendar;
    locale?: Locale;
    months?: string[];
  };
}

function MultiDatePicker(props: MultiDatePickerProps) {
  const {
    dateOnComplete,
    value,
    className,
    measurement = "sm",
    classNames,
    error,
    readOnly,
    startContent,
    endContent,
    getLocalizations,
    text,
  } = props;
  const { requiredHint, label, placeholder, to } = text || {};
  const { rootDivClassName } = classNames || {};
  const [visible, setVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState<DateObject[]>(value);
  const calendarRef = useRef<any>(null);
  const hasError = !!error;

  useEffect(() => {
    // Add event listener for clicks outside
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleClickOutside = (event: MouseEvent) => {
    if (
      calendarRef.current &&
      !calendarRef.current.contains(event.target as Node)
    ) {
      setVisible(false);
    }
  };

  const handleDateChange = (selectedDates: DateObject[]) => {
    dateOnComplete(selectedDates);
    setSelectedDates(selectedDates);
  };
  const onVisibilityChange = () => {
    if (!readOnly) setVisible(!visible);
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
    [measurement, label],
  );
  const readOnlyStyle = readOnly && "opacity-40";
  const localizations = getLocalizations
    ? getLocalizations()
    : {
        calendar: gregorian,
        locale: gregorian_en,
        months: [],
      };
  return (
    <div
      className={cn(
        rootDivClassName,
        "relative flex w-full flex-col justify-end",
        readOnlyStyle,
      )}
    >
      {visible && (
        <Calendars
          value={selectedDates}
          ref={calendarRef}
          className="absolute font-segoe top-10"
          onChange={handleDateChange}
          range
          plugins={[<DatePanel position="top" className="h-28" />]}
          months={localizations.months}
          calendar={localizations.calendar}
          locale={localizations.locale}
        />
      )}
      {/* Start Content */}
      {startContent && (
        <span
          className={cn(
            "absolute flex items-center ltr:left-3 rtl:right-3",
            heightStyle.startContent,
          )}
        >
          {startContent}
        </span>
      )}

      {/* End Content */}
      {endContent && (
        <span
          className={cn(
            "absolute flex items-center ltr:right-[5px] rtl:left-[5px]",
            heightStyle.endContent,
          )}
        >
          {endContent}
        </span>
      )}

      {/* Required Hint */}
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

      {/* Label */}
      {label && (
        <label
          htmlFor={label}
          className={cn(
            "font-semibold ltr:text-[13px] rtl:text-[18px] inline-block pb-1",
          )}
        >
          {label}
        </label>
      )}
      <div
        style={{
          height: heightStyle.height,
        }}
        className={cn(
          "relative flex items-center text-start px-3 border select-none rounded-sm rtl:text-[17px] ltr:text-[13px]",
          className,
        )}
        onClick={onVisibilityChange}
      >
        {selectedDates && selectedDates.length > 0 ? (
          <div className="flex items-center gap-x-2 text-ellipsis rtl:text-[17px] ltr:text-[13px] text-primary/80 text-nowrap">
            <CalendarDays className="size-4 inline-block text-tertiary rtl:ml-2 rtl:mr-2" />
            {selectedDates.map((date: DateObject, index: number) => (
              <div key={index} className="flex gap-x-2">
                {index % 2 == 1 && (
                  <h1 className="text-tertiary font-semibold">{to}</h1>
                )}
                <h1>
                  {date
                    .convert(localizations.calendar, localizations.locale)
                    .format()}
                </h1>
              </div>
            ))}
          </div>
        ) : (
          <h1 className="flex items-center gap-x-2 text-ellipsis rtl:text-[17px] ltr:text-[13px] text-primary/80 text-nowrap">
            <CalendarDays className="size-4 inline-block text-tertiary" />
            {placeholder}
          </h1>
        )}
      </div>
      {/* Error Message */}
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
            {error}
          </h1>
        </AnimatedItem>
      )}
    </div>
  );
}
export { type MultiDatePickerSize, type MultiDatePickerProps, MultiDatePicker };
