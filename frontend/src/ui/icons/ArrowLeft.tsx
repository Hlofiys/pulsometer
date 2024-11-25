import { CSSProperties, FC, SVGProps, useMemo } from "react";

const ArrowLeft: FC<SVGProps<SVGSVGElement>> = (props) => {
  const isDisabled = useMemo(
    () => !!props["aria-disabled"],
    [props["aria-disabled"]]
  );

  const disabledStyles: CSSProperties | undefined = useMemo(
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
        d="M15 6L9 12L15 18"
        stroke={props.stroke || "white"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowLeft;
