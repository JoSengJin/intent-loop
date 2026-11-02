interface FieldProps {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export default function Field({ label, hint, value, onChange, placeholder, multiline = false }: FieldProps) {
  return (
    <div className="field">
      <label>{label}</label>
      <p className="hint">{hint}</p>
      {multiline ? (
        <textarea className="textarea" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className="text-input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}
