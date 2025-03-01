import React from "react";
import { Pressable, Text, ActivityIndicator, View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-blue-600",
        destructive: "bg-red-500",
        outline: "border border-gray-700 bg-transparent",
        secondary: "bg-gray-800",
        ghost: "bg-transparent",
        link: "bg-transparent underline-offset-4",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
      disabled: {
        true: "opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      disabled: false,
    },
  }
);

const buttonTextVariants = cva("text-center font-medium", {
  variants: {
    variant: {
      default: "text-white",
      destructive: "text-white",
      outline: "text-gray-200",
      secondary: "text-white",
      ghost: "text-gray-200",
      link: "text-blue-500 underline",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      icon: "text-sm",
    },
    disabled: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    disabled: false,
  },
});

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  textClass?: string;
}

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({
    className,
    variant,
    size,
    disabled,
    leftIcon,
    rightIcon,
    loading = false,
    textClass,
    children,
    ...props
  }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(
          buttonVariants({
            variant,
            size,
            disabled: disabled || loading,
            className,
          })
        )}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <View className="flex-row items-center justify-center">
            {leftIcon && <View className="mr-2">{leftIcon}</View>}
            
            {typeof children === "string" ? (
              <Text
                className={cn(
                  buttonTextVariants({ variant, size, disabled }),
                  textClass
                )}
              >
                {children}
              </Text>
            ) : (
              children
            )}
            
            {rightIcon && <View className="ml-2">{rightIcon}</View>}
          </View>
        )}
      </Pressable>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };