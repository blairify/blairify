"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  allowMultiple?: boolean;
  defaultOpenId?: string;
}

interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  id: string;
  isOpen?: boolean;
  onToggle?: (id: string) => void;
  className?: string;
  indexText?: string;
}

const AccordionContext = React.createContext<{
  openItems: string[];
  toggleItem: (id: string) => void;
}>({
  openItems: [],
  toggleItem: () => {},
});

export const Accordion: React.FC<AccordionProps> = ({
  children,
  className,
  allowMultiple = false,
  defaultOpenId,
}) => {
  const [openItems, setOpenItems] = React.useState<string[]>(
    defaultOpenId ? [defaultOpenId] : [],
  );

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      return allowMultiple ? [...prev, id] : [id];
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn("space-y-3", className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  id,
  className,
  indexText,
}) => {
  const { openItems, toggleItem } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(id);

  return (
    <div
      className={cn(
        "group border rounded-lg transition-all duration-300 overflow-hidden",
        isOpen
          ? "border-primary/40 bg-primary/[0.04] shadow-lg shadow-primary/5"
          : "border-gray-200 hover:border-primary/30 bg-card hover:bg-primary/[0.04]",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => toggleItem(id)}
        className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4 flex-1">
          {indexText && (
            <span
              className={cn(
                "text-xs font-bold transition-all duration-300 min-w-[1.5rem] tracking-wider font-mono px-1.5 py-0.5 rounded-sm",
                isOpen
                  ? "dark:bg-primary/50 text-primary-foreground bg-primary/90"
                  : "text-muted-foreground bg-primary/[0.04] group-hover:text-primary group-hover:bg-primary/20",
              )}
            >
              {indexText}
            </span>
          )}
          <div
            className={cn(
              "flex-1 transition-colors duration-300",
              isOpen
                ? "text-foreground font-semibold"
                : "text-foreground/80 group-hover:text-foreground",
            )}
          >
            {title}
          </div>
        </div>
        <div
          className={cn(
            "ml-4 p-2 rounded-xl transition-all duration-300",
            isOpen
              ? "text-primary rotate-180"
              : "text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary rotate-0",
          )}
        >
          <ChevronDown className="size-3" />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="px-5 pb-6 pt-0">
              <div className={cn(indexText ? "pl-11" : "pl-0")}>
                <motion.div
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.3 }}
                  className="pt-2 border-t border-primary/10"
                >
                  {children}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
