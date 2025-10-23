import { createContext, FC, useContext, useRef } from "react";
import { IWithChildren } from "../../reduxToolkit/Interfaces";
import { Chart as ChartJS } from "chart.js";

export interface IHoverKeypoint {
  hoveredAreasRef: React.MutableRefObject<number[]>;
  chartRef: React.MutableRefObject<ChartJS | null>;
  handleMouseEnter: (id: number) => void;
  handleMouseLeave: (id: number) => void;
}

const HoverKeypointContext = createContext<IHoverKeypoint | undefined>(
  undefined
);

export const HoverKeypointProvider: FC<IWithChildren> = ({ children }) => {
  const hoveredAreasRef = useRef<number[]>([]);
  const chartRef = useRef<ChartJS | null>(null);

  const handleMouseEnter = (id: number) => {
    if (!hoveredAreasRef.current.includes(id)) {
      hoveredAreasRef.current.push(id);
      chartRef.current?.draw();
    }
  };

  const handleMouseLeave = (id: number) => {
    hoveredAreasRef.current = hoveredAreasRef.current.filter((i) => i !== id);
    chartRef.current?.draw();
  };

  const value: IHoverKeypoint = {
    hoveredAreasRef,
    chartRef,
    handleMouseEnter,
    handleMouseLeave,
  };

  return (
    <HoverKeypointContext.Provider value={value}>
      {children}
    </HoverKeypointContext.Provider>
  );
};

export const useHoverKeypont = (): IHoverKeypoint => {
  const context = useContext(HoverKeypointContext);
  if (!context) {
    throw new Error(
      "useHoverKeypont must be used within a HoverKeypointProvider"
    );
  }
  return context;
};
