interface InputProps<K extends string, V extends string> {
  label: string;
  labelClassName?: string;
  name: K;
  value?: V;
  placeholder: string;
  inputStyle?: React.CSSProperties;
  readOnly?: boolean;
  onChange: (name: K, value: V) => void;
}

export const InlineInput = <K extends string>({
  label,
  labelClassName,
  name,
  value = "",
  placeholder,
  inputStyle = {},
  readOnly = false,
  onChange,
}: InputProps<K, string>) => {
  return (
    <label
      className={`flex items-center gap-2 text-sm font-medium text-slate-700 ${labelClassName}`}
    >
      <span className="w-32 shrink-0 whitespace-nowrap">{label}</span>
      <input
        type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-16 border-b border-slate-300 bg-transparent pb-0.5 text-center text-sm font-semibold leading-5 text-slate-900 outline-none ${
          readOnly ? "cursor-default bg-transparent text-gray-900" : ""
        }`}
        style={inputStyle}
      />
    </label>
  );
};
