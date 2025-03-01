import React from "react";
import { View, TextInput, Text } from "react-native";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full bg-gray-800 border-gray-700 px-4 py-2 rounded-md text-white",
  {
    variants: {
      variant: {
        default: "border",
        outline: "border border-gray-600",
        filled: "bg-gray-700 border-transparent",
      },
      state: {
        default: "",
        error: "border-red-500",
        success: "border-green-500",
      },
      disabled: {
        true: "opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      state: "default",
      disabled: false,
    },
  }
);

export interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  variant?: "default" | "outline" | "filled";
  state?: "default" | "error" | "success";
  icon?: React.ReactNode;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  (
    {
      className,
      containerClassName,
      labelClassName,
      label,
      error,
      variant,
      state = error ? "error" : "default",
      disabled,
      icon,
      ...props
    },
    ref
  ) => {
    return (
      <View className={cn("mb-4", containerClassName)}>
        {label && (
          <Text className={cn("text-white mb-1 text-sm", labelClassName)}>
            {label}
          </Text>
        )}
        
        <View className="relative">
          <TextInput
            ref={ref}
            className={cn(
              inputVariants({
                variant,
                state,
                disabled,
              }),
              icon && "pl-10",
              className
            )}
            placeholderTextColor="#666"
            editable={!disabled}
            {...props}
          />
          
          {icon && (
            <View className="absolute left-3 h-full justify-center">
              {icon}
            </View>
          )}
        </View>
        
        {error && (
          <Text className="text-red-500 text-xs mt-1">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";

export { Input };