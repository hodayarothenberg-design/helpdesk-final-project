import * as Select from "@radix-ui/react-select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  error?: string;
  onChange: (value: string) => void;
}

export function SelectField({
  id,
  label,
  value,
  placeholder,
  options,
  error,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <Select.Root value={value || undefined} onValueChange={onChange}>
        <Select.Trigger
          id={id}
          className={`flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm outline-none ring-brand-500 focus:ring-2 ${
            error ? "border-red-400" : "border-slate-300"
          }`}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon className="text-slate-500">▾</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="z-50 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
            position="popper"
            sideOffset={6}
          >
            <Select.Viewport className="p-1">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer rounded-md px-3 py-2 text-sm text-slate-700 outline-none data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-700"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
