interface IButtonSpinnerProps {
  children: any;
  loading: boolean;
}

function ButtonSpinner(props: IButtonSpinnerProps) {
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
export { ButtonSpinner, IButtonSpinnerProps };
