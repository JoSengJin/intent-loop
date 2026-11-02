export default function Field({ label, hint, value, onChange, placeholder, multiline = false }) {
  const Input = multiline ? 'textarea' : 'input';
  return (
    <div className="field">
      <label>{label}</label>
      <p className="hint">{hint}</p>
      <Input className={multiline ? 'textarea' : 'text-input'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
