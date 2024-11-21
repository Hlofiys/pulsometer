import { CSSProperties, FC, SVGProps, useMemo } from "react";

const ArrowRight: FC<SVGProps<SVGSVGElement>> = (props) => {
  const isDisabled = useMemo(
    () => !!props["aria-disabled"],
    [props["aria-disabled"]]
  );

  const disabledStyles: CSSProperties|undefined = useMemo(
    () =>
      (isDisabled && {
        cursor: "not-allowed",
        stroke: "gray",
      }) ||
      undefined,
    [isDisabled]
  );
  return (
    <svg
      {...props}
      width={props.width || 24}
      height={props.height || 24}
      viewBox="0 0 24 24"
      fill={"none"}
      style={disabledStyles}
    >
      <path
        d="M9 18L15 12L9 6"
        stroke={props.stroke || "white"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowRight;
