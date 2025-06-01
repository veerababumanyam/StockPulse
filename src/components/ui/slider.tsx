import * as React from 'react';

export interface SliderProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'onChange'
  > {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className = '',
      value = [0],
      onValueChange,
      defaultValue = [0],
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(
      value[0] || defaultValue[0],
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(event.target.value);
      setInternalValue(newValue);
      if (onValueChange) {
        onValueChange([newValue]);
      }
    };

    const currentValue = value[0] !== undefined ? value[0] : internalValue;

    return (
      <div
        className={`relative flex w-full touch-none select-none items-center ${className}`}
      >
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className={`
            h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md
            [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            disabled:pointer-events-none disabled:opacity-50
          `}
          {...props}
        />
        <div className="absolute left-0 top-2 text-xs text-gray-500 dark:text-gray-400">
          {min}
        </div>
        <div className="absolute right-0 top-2 text-xs text-gray-500 dark:text-gray-400">
          {max}
        </div>
      </div>
    );
  },
);

Slider.displayName = 'Slider';

export { Slider };
