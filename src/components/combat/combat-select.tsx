import React from "react";

export interface CombatSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  side: "left" | "right";
  className?: string;
}

const CombatSelect: React.FC<CombatSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  side,
  className = "",
}) => {
  return (
    <div className={`combat-select ${side} ${className} w-full`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 py-2 text-base border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CombatSelect;
