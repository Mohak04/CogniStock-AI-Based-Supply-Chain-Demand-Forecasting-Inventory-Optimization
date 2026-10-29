import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const ColumnMapper = ({ sourceColumns = [], initialMappings = null, onMappingChange }) => {
  const schemaTargetFields = [
    { key: "Date", label: "Date (sale_date)", required: true },
    { key: "SKU", label: "SKU / Product ID", required: true },
    { key: "Quantity", label: "Quantity Sold", required: true },
    { key: "ProductName", label: "Product Name", required: false },
    { key: "Category", label: "Category", required: false },
    { key: "UnitPrice", label: "Unit Price", required: false },
    { key: "LeadTime", label: "Lead Time (Days)", required: false },
    { key: "CurrentStock", label: "Current Stock", required: false },
    { key: "UnitCost", label: "Unit Cost", required: false },
    { key: "OnOrder", label: "On Order Quantity", required: false }
  ];

  // Default automatic mapping guesses or saved initialMappings
  const [mappings, setMappings] = useState(() => {
    if (initialMappings && Object.keys(initialMappings).length > 0) {
      return { ...initialMappings };
    }
    return {
      Date: sourceColumns.find(c => c.toLowerCase().includes('date')) || sourceColumns[0] || 'sale_date',
      SKU: sourceColumns.find(c => c.toLowerCase().includes('sku') || c.toLowerCase().includes('code')) || sourceColumns[1] || 'product_code',
      Quantity: sourceColumns.find(c => c.toLowerCase().includes('qty') || c.toLowerCase().includes('unit')) || sourceColumns[2] || 'units_sold',
      ProductName: sourceColumns.find(c => c.toLowerCase().includes('name')) || sourceColumns.find(c => c.toLowerCase().includes('desc')) || 'item_name',
      Category: sourceColumns.find(c => c.toLowerCase().includes('cat')) || sourceColumns.find(c => c.toLowerCase().includes('group')) || 'category_desc',
      UnitPrice: sourceColumns.find(c => c.toLowerCase().includes('price')) || 'unit_price_usd',
      LeadTime: sourceColumns.find(c => c.toLowerCase().includes('lead')) || 'supplier_lead_days',
      CurrentStock: sourceColumns.find(c => c.toLowerCase().includes('stock') || c.toLowerCase().includes('avail') || c.toLowerCase().includes('hand')) || 'on_hand_qty',
      UnitCost: sourceColumns.find(c => c.toLowerCase().includes('cost')) || 'cost_price_usd',
      OnOrder: sourceColumns.find(c => c.toLowerCase().includes('order') || c.toLowerCase().includes('incoming')) || 'None / Ignore'
    };
  });

  const handleSelect = (schemaKey, sourceValue) => {
    const next = { ...mappings, [schemaKey]: sourceValue };
    setMappings(next);
    if (onMappingChange) onMappingChange(next);
  };

  const availableOptions = ['None / Ignore', ...sourceColumns];

  return (
    <div className="card-panel p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100">Schema Column Mapping</h3>
          <p className="text-xs text-slate-400">Map columns from your raw file to CogniStock target schema fields.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            ✓ 3 Required Fields Mapped
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {schemaTargetFields.map((field) => {
          const currentMapping = mappings[field.key];
          const isMapped = currentMapping && currentMapping !== 'None / Ignore';

          return (
            <div
              key={field.key}
              className={`p-3 rounded-lg border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                field.required
                  ? 'bg-slate-950/70 border-slate-800'
                  : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-[200px]">
                {field.required ? (
                  <span className="p-1 rounded bg-blue-950 text-blue-400 border border-blue-500/30 text-[10px] font-bold font-mono uppercase">
                    Required
                  </span>
                ) : (
                  <span className="p-1 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono uppercase">
                    Optional
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-200">{field.label}</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
                <select
                  value={currentMapping || 'None / Ignore'}
                  onChange={(e) => handleSelect(field.key, e.target.value)}
                  className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                >
                  {availableOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {isMapped ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : field.required ? (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                ) : (
                  <span className="w-4 h-4 shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
