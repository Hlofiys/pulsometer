import { FC, SVGProps } from "react";

const Magnifier: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      {...props}
      width={props.width || "24"}
      height={props.height || "24"}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
        stroke={props.stroke || "#0F0E0F"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.9999 21.0004L16.6499 16.6504"
        stroke={props.stroke || "#0F0E0F"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Magnifier;
