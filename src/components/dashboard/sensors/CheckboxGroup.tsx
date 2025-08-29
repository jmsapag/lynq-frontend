import React from "react";
import { Checkbox } from "@heroui/react";

interface CheckboxGroupProps {
  id: string;
  label: string | React.ReactNode;
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  stopPropagation?: boolean;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  id,
  label,
  checked,
  indeterminate = false,
  onChange,
  className = "",
  stopPropagation = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  return (
    <div className={`flex items-center ${className}`} onClick={handleClick}>
      <Checkbox
        id={id}
        isSelected={checked}
        isIndeterminate={indeterminate}
        onChange={(e) => {
          onChange(e.target.checked);
          if (stopPropagation) {
            e.stopPropagation();
          }
        }}
        radius="md"
        size="lg"
        color="primary"
        aria-label={typeof label === 'string' ? label : id}
      >
        {label}
      </Checkbox>
    </div>
  );
};
