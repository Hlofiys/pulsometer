import {
  createContext,
  CSSProperties,
  FC,
  MouseEvent,
  useCallback,
  useContext,
  useState,
} from "react";
import { AnimatePresence } from "framer-motion";
import { IWithChildren } from "../../reduxToolkit/Interfaces";
import Alert from "../../ui/alert/Alert";

interface IAlertStyles {
  overlay?: CSSProperties;
  title?: CSSProperties;
  content?: CSSProperties;
  footer?: CSSProperties;
  alertBox?: CSSProperties;
}
export interface IAlertParams extends IWithChildren {
  styles?: IAlertStyles;
  isWaitAsync?: boolean;
  title?: string;
  buttons?: IAlertBtn[];
  onClose?: () => void;
  closable?: boolean;
  closableOverlay?: boolean;
  centered?: boolean;
  startX?: number;
  startY?: number;
}

export interface IAlertBtn {
  id?: string;
  text: string;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  type?: "default" | "cancel" | "destructive";
  style?: CSSProperties;
  isLoading?: boolean;
}

export type AlertContextType = {
  hideAlert: () => void;
  showAlert: (newParams: IAlertParams, event?: MouseEvent) => void;
  setAlertButtonLoading: (id: string, loading: boolean) => void;
  isAlertVisible: boolean;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: FC<IWithChildren> = ({ children }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [params, setParams] = useState<IAlertParams | null>(null);

  const showAlert = useCallback(
    (newParams: IAlertParams, event?: React.MouseEvent) => {
      if (visible) return;

      let startX = window.innerWidth / 2;
      let startY = window.innerHeight / 2;

      if (event) {
        // Получаем координаты клика относительно окна
        startX = event.clientX;
        startY = event.clientY;
      }

      setParams({ ...newParams, startX, startY });
      setVisible(true);
    },
    [visible]
  );

  const hideAlert = useCallback(() => {
    if (params?.onClose) params.onClose();
    setVisible(false);
    setParams(null);
  }, [params?.onClose]);

  const setAlertButtonLoading = useCallback((id: string, loading: boolean) => {
    setParams((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        buttons: prev.buttons?.map((btn) =>
          btn.id === id ? { ...btn, isLoading: loading } : btn
        ),
      };
    });
  }, []);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        isAlertVisible: visible,
        hideAlert,
        setAlertButtonLoading,
      }}
    >
      {children}

      <AnimatePresence
        onExitComplete={() => {
          if (!visible) setParams(null);
        }}
      >
        {visible && <Alert {...params} onClose={hideAlert} />}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
