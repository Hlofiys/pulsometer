import { FC, SVGProps } from "react";

const TopArrow: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      {...props}
      width={props.width || 30}
      height={props.height || 30}
      viewBox="0 0 30 30"
    >
      <path
        d="M8.75 21.25L21.25 8.75"
        stroke={props.stroke || "#FBFAF8"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.75 8.75H21.25V21.25"
        stroke={props.stroke || "#FBFAF8"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TopArrow;
