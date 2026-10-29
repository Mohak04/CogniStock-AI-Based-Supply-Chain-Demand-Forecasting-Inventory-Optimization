import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400">
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-slate-200 transition-colors">
        <Home className="w-3.5 h-3.5 text-slate-500" />
        <span>CogniStock</span>
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            {isLast || !item.href ? (
              <span className="text-slate-200 font-medium">{item.label}</span>
            ) : (
              <Link to={item.href} className="hover:text-slate-200 transition-colors">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
