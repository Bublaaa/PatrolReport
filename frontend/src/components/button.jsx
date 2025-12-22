import clsx from "clsx";
import { motion } from "framer-motion";

//  Button Variants
const buttonVariants = {
  primary:
    "bg-accent text-white font-semibold hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/40 cursor-pointer",
  secondary:
    "bg-white font-medium text-dark hover:text-accent focus:outline-none focus:ring-4 focus:ring-gray-100 border border-gray-200 cursor-pointer",
  danger:
    "bg-red-300 font-medium text-white hover:text-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 border border-red-200 cursor-pointer",
  disabled: "bg-gray-300 font-medium  text-gray-400 cursor-not-allowed",
};

//  Button Sizes
const buttonSizes = {
  icon: "p-2",
  small: "md:px-3 px-1.5 md:py-2 py-1 text-sm max-w-sm",
  medium: "md:px-4 px-2 md:py-2 py-1 text-base max-w-md",
  large: "md:px-6 px-3 md:py-3 py-1.5 text-lg max-w-lg",
  full: "md:px-4 px-2 md:py-2 py-1 text-base max-w-full w-full",
};

//  Reusable Button Component
const Button = ({
  buttonType = "primary",
  buttonSize = "medium",
  icon: Icon,
  onClick,
  children,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <motion.button
      type="button"
      className={clsx(
        "flex items-center text-left  justify-center gap-2 rounded-lg transition  duration-200",
        buttonVariants[buttonType], //  Use variant styles
        buttonSizes[buttonSize], //  Use size styles
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="size-5" />}
      {children}
    </motion.button>
  );
};

export default Button;
