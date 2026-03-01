import { Input, InputProps } from "@/components/notion-ui/input";
import { checkStrength, passwordStrengthScore } from "@/utils/helper";
import { Check, X } from "lucide-react";
import React, { useMemo, useState } from "react";
type PasswordInputText = {
  strong_password: string;
  enter_password: string;
  weak_password: string;
  medium_password: string;
  must_contain: string;
  at_lea_8_char: string;
  at_lea_1_num: string;
  at_lea_1_lowcas_lett: string;
  at_lea_1_upcas_lett: string;
};
interface PasswordInputProps extends InputProps {
  text: PasswordInputText;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const { classNames, value, text, onChange, ...rest } = props;
    const { rootDivClassName } = classNames || {};

    // Internal state only if parent does NOT control value
    const [password, setPassword] = useState(value ?? "");

    // Use parent-controlled value if provided, otherwise internal state
    const currentPassword = value !== undefined ? value : password;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setPassword(e.target.value);
      }
      onChange?.(e);
    };

    const strength = useMemo(
      () =>
        checkStrength(
          typeof currentPassword == "string" ? currentPassword : "",
          text,
        ),
      [currentPassword, text],
    );

    const strengthScore = useMemo(
      () => passwordStrengthScore(strength),
      [strength],
    );

    const getStrengthColor = (score: number) => {
      if (score === 0) return "bg-border";
      if (score <= 1) return "bg-red-500";
      if (score <= 2) return "bg-orange-500";
      if (score === 3) return "bg-amber-500";
      return "bg-emerald-500";
    };

    const getStrengthText = (score: number) => {
      if (score === 0) return text.enter_password;
      if (score <= 2) return text.weak_password;
      if (score === 3) return text.medium_password;
      return text.strong_password;
    };

    return (
      <div className={`w-full ${rootDivClassName ?? ""}`}>
        <Input
          value={currentPassword}
          ref={ref}
          onChange={handleChange}
          aria-invalid={strengthScore < 4}
          aria-describedby="password-strength"
          {...rest}
        />

        {/* Password strength indicator */}
        <div
          className="mb-4 mt-3 h-1 w-full overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuenow={strengthScore}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-label="Password strength"
        >
          <div
            className={`h-full ${getStrengthColor(
              strengthScore,
            )} transition-all duration-500 ease-out`}
            style={{ width: `${(strengthScore / 4) * 100}%` }}
          />
        </div>

        {/* Password strength text */}
        <p
          id="password-strength"
          className="mb-2 text-start rtl:text-lg ltr:text-sm font-medium text-foreground"
        >
          {`${getStrengthText(strengthScore)}. ${text.must_contain}`}
        </p>

        {/* Requirements */}
        <ul className="space-y-1.5" aria-label="Password requirements">
          {strength.map((req, index) => (
            <li key={index} className="flex items-center gap-2">
              {req.met ? (
                <Check size={16} className="text-emerald-500" />
              ) : (
                <X size={16} className="text-muted-foreground/80" />
              )}
              <span
                className={`ltr:text-xs rtl:text-[17px] ${
                  req.met
                    ? "text-emerald-600 ltr:text-sm"
                    : "text-muted-foreground"
                }`}
              >
                {req.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  },
);

export { PasswordInput, PasswordInputProps, PasswordInputText };
