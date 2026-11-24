interface QuantityProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}
export function Quantity(props: QuantityProps) {
  const {value, onChange, label = 'Quantity'} = props;
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== 'ArrowLeft' &&
      e.key !== 'ArrowRight' &&
      Number.isNaN(Number(e.key))
    ) {
      e.preventDefault();
    }
  };
  return (
    <div className="space-y-1.5">
      <legend className="font-medium leading-tight">{label}</legend>
      <div className="inline-flex items-stretch border border-gray-300">
        <button
          type="button"
          name="decrease-quantity"
          aria-label="Decrease quantity"
          className="h-10 w-10 transition"
          disabled={value <= 1}
          onClick={() => onChange(value - 1)}
        >
          <span>&#8722;</span>
        </button>
        <input
          className="w-12 px-1 py-2.5 text-center"
          value={value}
          onKeyDown={handleKeyDown}
          onChange={(e) => onChange(Number(e.currentTarget.value))}
        />
        <button
          type="button"
          className="h-10 w-10 transition"
          name="increase-quantity"
          aria-label="Increase quantity"
          onClick={() => onChange(value + 1)}
        >
          <span>&#43;</span>
        </button>
      </div>
    </div>
  );
}
