import { FC, SVGProps } from "react";

const Edit: FC<SVGProps<SVGSVGElement>> = (props) => {
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
        d="M3.44482 12.5533V13.1666H4.05816L10.0982 7.12664L9.48483 6.51331L3.44482 12.5533Z"
        fill={props.stroke || "#23E70A"}
      />
      <path
        d="M13.918 5.19333C14.178 4.93333 14.178 4.51333 13.918 4.25333L12.358 2.69333C12.2247 2.56 12.058 2.5 11.8847 2.5C11.7113 2.5 11.5447 2.56667 11.418 2.69333L10.198 3.91333L12.698 6.41333L13.918 5.19333ZM2.11133 12V14.5H4.61133L11.9847 7.12667L9.48466 4.62667L2.11133 12ZM4.05799 13.1667H3.44466V12.5533L9.48466 6.51333L10.098 7.12667L4.05799 13.1667Z"
        fill={props.stroke || "#23E70A"}
      />
    </svg>
  );
};

export default Edit;
