import { cn } from "../../utils/cn";
// import { cn } from "@/utils/cn";

export interface IButtonSpinnerProps {
  children: any;
  loading: boolean;
}

export default function ButtonSpinner(props: IButtonSpinnerProps) {
  const { loading, children } = props;
  return (
    <>
      {children}
      {loading && (
        <div className="relative size-3">
          {/* <!-- Ring --> */}
          <div
            className="size-3 rounded-full animate-spin absolute
              border border-solid border-secondary border-t-transparent"
          />
        </div>
      )}
    </>
  );
}
