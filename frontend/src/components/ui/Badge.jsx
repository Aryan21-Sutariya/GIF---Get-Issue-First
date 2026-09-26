import React from 'react';

const Badge = ({ children, className = '', ...props }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-800 transition-colors dark:border-slate-700 dark:text-slate-300 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
