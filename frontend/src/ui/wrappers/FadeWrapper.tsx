import { forwardRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FadeWrapperProps {
  show: boolean;
  className?: string;
  children: ReactNode;
  duration?: number;
}

const FadeWrapper = forwardRef<HTMLDivElement, FadeWrapperProps>(
  ({ show, className, children, duration = 0.15 }, ref) => {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            key="fade-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration, ease: "easeOut" }}
            className={className}
            ref={ref}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

export default FadeWrapper;
