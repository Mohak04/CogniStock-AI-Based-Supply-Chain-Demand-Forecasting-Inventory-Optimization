import React from 'react';

/**
 * Visual metadata badge for data classification explainability.
 * Types: ACTUAL | CALCULATED | FORECAST | RECOMMENDATION
 */
export default function DataBadge({ type, label }) {
  let badgeStyle = '';
  let defaultText = '';

  switch (type) {
    case 'ACTUAL':
      badgeStyle = 'badge-actual';
      defaultText = 'ACTUAL DATA';
      break;
    case 'CALCULATED':
      badgeStyle = 'badge-calculated';
      defaultText = 'CALCULATED DATA';
      break;
    case 'FORECAST':
      badgeStyle = 'badge-forecast';
      defaultText = 'FORECAST DATA';
      break;
    case 'RECOMMENDATION':
      badgeStyle = 'badge-recommendation';
      defaultText = 'RECOMMENDATION';
      break;
    default:
      badgeStyle = 'bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-xs font-semibold';
      defaultText = type || 'UNKNOWN';
  }

  return (
    <span className={badgeStyle} title={`Data Classification: ${type}`}>
      {label || defaultText}
    </span>
  );
}
