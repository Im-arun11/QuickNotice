import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  required = false,
  className = '',
  icon: Icon,
  ...props
}) {
  return (
    <div className={`w-full text-left space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="h-4.5 w-4.5 text-slate-400 stroke-[1.8]" />
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full px-4 py-3 bg-slate-50 border ${
            error 
              ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
              : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
          } ${Icon ? 'pl-10' : ''} rounded-xl text-sm transition-all outline-none focus:ring-4 focus:bg-white`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-red-500 mt-1 animate-in fade-in duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
