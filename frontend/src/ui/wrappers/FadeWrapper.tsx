import { forwardRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FadeWrapperProps {
  show: boolean; // условие для отображения
  className?: string;
  children: ReactNode;
  duration?: number; // длительность анимации в секундах
}

// Используем forwardRef, чтобы можно было передавать ref
const FadeWrapper = forwardRef<HTMLDivElement, FadeWrapperProps>(
  ({ show, className, children, duration = 0.25 }, ref) => {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            key="fade-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration, ease: "easeOut" }}
            className={className}
            style={{ display: "inline-block" }}
            ref={ref} // теперь ref поддерживается
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

export default FadeWrapper;
