import { FC, memo, SVGProps } from "react";

const Basket: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      {...props}
      width={props.width || 20}
      height={props.height || 20}
      viewBox="0 0 17 17"
      fill="none"
    >
      <path
        opacity="0.3"
        d="M6.22266 6.5H11.556V13.1667H6.22266V6.5Z"
        fill={props.stroke || "white"}
      />
      <path
        d="M11.2227 3.16667L10.556 2.5H7.22266L6.55599 3.16667H4.22266V4.5H13.556V3.16667H11.2227ZM4.88932 13.1667C4.88932 13.9 5.48932 14.5 6.22266 14.5H11.556C12.2893 14.5 12.8893 13.9 12.8893 13.1667V5.16667H4.88932V13.1667ZM6.22266 6.5H11.556V13.1667H6.22266V6.5Z"
        fill={props.stroke || "white"}
      />
    </svg>
  );
};

export default memo(Basket);
