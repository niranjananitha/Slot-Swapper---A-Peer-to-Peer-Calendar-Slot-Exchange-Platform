import React from 'react';

const TimePicker = ({ label, value, onChange, required = false }) => {
  return (
    <div className="form-group">
      <label className="text-primary">{label}</label>
      <input
        className="glass-input time-picker"
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          colorScheme: 'light',
          fontSize: '16px'
        }}
      />
    </div>
  );
};

export default TimePicker;