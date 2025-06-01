import * as React from 'react';

const Form = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ className = '', ...props }, ref) => (
  <form ref={ref} className={`space-y-6 ${className}`} {...props} />
));
Form.displayName = 'Form';

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`space-y-2 ${className}`} {...props} />
));
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className = '', ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  />
));
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`${className}`} {...props} />
));
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = '', ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-muted-foreground ${className}`}
    {...props}
  />
));
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = '', ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm font-medium text-destructive ${className}`}
    {...props}
  />
));
FormMessage.displayName = 'FormMessage';

// FormField component for controlled form fields
interface FormFieldProps {
  name: string;
  control?: any; // This would typically be from react-hook-form, but we'll make it generic
  render: ({ field }: { field: any }) => React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ name, control, render }) => {
  // Simple field implementation - in a real app this would integrate with react-hook-form
  const [value, setValue] = React.useState('');

  const field = {
    name,
    value,
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setValue(e.target.value);
    },
    onBlur: () => {},
  };

  return <>{render({ field })}</>;
};

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
