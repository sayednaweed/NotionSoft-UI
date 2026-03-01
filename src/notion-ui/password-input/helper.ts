import { PasswordInputText } from "@/components/notion-ui/password-input";

export const checkStrength = (pass: string, text: PasswordInputText) => {
  const requirements = [
    { regex: /.{8,}/, text: text.at_lea_8_char },
    { regex: /[0-9]/, text: text.at_lea_1_num },
    { regex: /[a-z]/, text: text.at_lea_1_lowcas_lett },
    { regex: /[A-Z]/, text: text.at_lea_1_upcas_lett },
  ];

  return requirements.map((req) => ({
    met: req.regex.test(pass),
    text: req.text,
  }));
};
export const passwordStrengthScore = (
  strength: {
    met: boolean;
    text: any;
  }[],
): number => strength.filter((req) => req.met).length;
