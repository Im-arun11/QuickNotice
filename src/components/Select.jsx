import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  id,
  options = [], // [{ value, label }] or string[]
  value,
  onChange,
  error = '',
  required = false,
  className = '',
  icon: Icon,
  placeholder = 'Select an option',
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
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full px-4 py-3 bg-slate-50 border appearance-none ${
            error 
              ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
              : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
          } ${Icon ? 'pl-10' : ''} pr-10 rounded-xl text-sm transition-all outline-none focus:ring-4 focus:bg-white`}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt, idx) => {
            const isObj = typeof opt === 'object' && opt !== null;
            const optVal = isObj ? opt.value : opt;
            const optLabel = isObj ? opt.label : opt;
            return (
              <option key={idx} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="h-4.5 w-4.5" />
        </div>
      </div>
      {error && (
        <p className="text-xs font-medium text-red-500 mt-1 animate-in fade-in duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
