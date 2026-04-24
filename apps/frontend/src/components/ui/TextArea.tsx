type Props = {
  label?: string;
  id?: string;
  isDisabled?: boolean;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  required?: boolean;
  rows?: number;
};

const TextArea = ({
  label = "",
  id,
  isDisabled = false,
  placeholder = "",
  value,
  onChange,
  error,
  required,
  rows = 3
}: Props) => {
  const generatedId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      <label
        className={`flex flex-col gap-1.5 group/textarea ${isDisabled ? "pointer-events-none opacity-50" : ""}`}
        htmlFor={generatedId}
      >
        {label && (
          <span className="text-dark dark:text-light font-medium text-sm group-focus-within/textarea:text-neutral-dark-gray">
            {label}
            {required && <span className="text-red-200 ml-1">*</span>}
          </span>
        )}
        <div
          className={`flex flex-row gap-2 items-start py-2 px-3 rounded-lg border border-gray-400 dark:border-gray-200 transition-colors ${
            error ? "border-red-200 group-focus-within/textarea:!ring-red-200" : "group-focus-within/textarea:!ring-green-200"
          } group-focus-within/textarea:!ring-[2px] dark:group-focus-within/textarea:!ring-offset-gray-200 group-focus-within/textarea:!ring-offset-2 bg-white dark:bg-gray-700`}
        >
          <textarea
            id={generatedId}
            className="border-none px-0.5 flex-1 w-full text-dark focus:outline-none focus:placeholder-neutral-dark-gray dark:text-light text-sm bg-transparent resize-none"
            disabled={isDisabled}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
          ></textarea>
        </div>
        {error && (
          <p className="text-xs text-red-200 mt-1">{error}</p>
        )}
      </label>
    </div>
  );
};

export default TextArea;
