import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'primary' | 'outline' | 'blue' | 'cyan';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => {
  const styles = {
    neutral: 'bg-gray-100 text-gray-600',
    success: 'bg-green-50 text-green-700', // Referrals style
    warning: 'bg-orange-50 text-orange-700',
    primary: 'bg-gray-900 text-white',
    outline: 'bg-white border border-gray-200 text-gray-700',
    blue: 'bg-blue-50 text-blue-700',
    cyan: 'bg-cyan-50 text-cyan-700', // Social Networks style
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium ${styles[variant]} inline-flex items-center whitespace-nowrap`}>
      {children}
    </span>
  );
};