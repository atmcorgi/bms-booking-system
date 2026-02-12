import React from 'react';
import Select, { type Props as SelectProps } from 'react-select';

// Define a common interface for options
export interface SelectOption {
  value: string | number;
  label: string;
}

// Extend the react-select props
interface CustomSelectProps extends SelectProps<SelectOption, false> {
  // You can add any custom props here if needed
}

const CustomSelect: React.FC<CustomSelectProps> = ({ styles, theme, ...props }) => {
  return (
    <Select<SelectOption, false>
      {...props}
      styles={{
        control: (base, state) => ({
          ...base,
          minHeight: '42px',
          background: '#fff',
          borderRadius: '6px',
          borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
          boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
          '&:hover': {
            borderColor: state.isFocused ? '#6366f1' : '#a5b4fc',
          },
          ...(styles?.control ? (styles.control as any)(base, state) : {}),
        }),
        option: (base, state) => ({
          ...base,
          background: state.isSelected ? '#6366f1' : state.isFocused ? '#e0e7ff' : '#fff',
          color: state.isSelected ? '#fff' : '#1f2937',
          padding: '10px 14px',
          cursor: 'pointer',
          ...(styles?.option ? (styles.option as any)(base, state) : {}),
        }),
        singleValue: (base, state) => ({
          ...base,
          color: '#1f2937',
          ...(styles?.singleValue ? (styles.singleValue as any)(base, state) : {}),
        }),
        placeholder: (base, state) => ({
          ...base,
          color: '#9ca3af',
          ...(styles?.placeholder ? (styles.placeholder as any)(base, state) : {}),
        }),
        menu: (base, state) => ({
          ...base,
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          ...(styles?.menu ? (styles.menu as any)(base, state) : {}),
        }),
      }}
      theme={(baseTheme) => {
        const customTheme = typeof theme === 'function' ? theme(baseTheme) : theme;
        return {
          ...baseTheme,
          borderRadius: 6,
          colors: {
            ...baseTheme.colors,
            primary: '#6366f1',
            primary75: '#a5b4fc',
            primary50: '#c7d2fe',
            primary25: '#e0e7ff',
          },
          ...customTheme,
        };
      }}
    />
  );
};

export default CustomSelect;
