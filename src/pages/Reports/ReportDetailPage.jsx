import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { reportService } from '../../services/reportService';
import { FileText, Download, Printer, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ReportDetailPage = () => {
  const { id = 'rep-001' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    reportService.getReportById(id).then((data) => {
      setReport(data);
      setLoading(false);
    });
  }, [id]);

  if (loading || !report) return <LoadingState message="Compiling PDF report preview..." />;

  const handlePrint = () => {
    window.print();
  };

  const breadcrumbItems = [
    { label: "Analytics", href: "/reports" },
    { label: "Reports Center", href: "/reports" },
    { label: report.title }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={report.title}
        subtitle={`Report Category: ${report.type} · Generated: ${report.generatedAt}`}
        breadcrumbItems={breadcrumbItems}
        actions={
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={() => reportService.downloadReport(report.id, `${report.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`)}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" /> Export File
            </button>
          </div>
        }
      />

      {/* Report Document Preview Container (Styled like a formal paper report) */}
      <div className="card-panel p-8 max-w-4xl mx-auto space-y-8 bg-slate-900 border-slate-800 text-slate-200">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-slate-100">CogniStock Intelligence System</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-500/30">
                PROTOTYPE REPORT — DEMO DATA
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Document Ref ID: {report.id} · Scope: {report.skuScope}</p>
          </div>
          <div className="text-right text-xs font-mono text-slate-400">
            <div>Date: {report.generatedAt}</div>
            <div>Author: {report.generatedBy}</div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-mono border-b border-slate-800 pb-1">
            1. Executive Summary
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{report.executiveSummary}</p>
        </div>

        {/* Section 2: Dataset Information */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-mono border-b border-slate-800 pb-1">
            2. Dataset & Scope Specifications
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px]">Dataset Name</span>
              <span className="text-slate-200 font-bold">{report.datasetVersion}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Target Scope</span>
              <span className="text-slate-200 font-bold">{report.skuScope}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Quality Score</span>
              <span className="text-emerald-400 font-bold">94.2%</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Environment</span>
              <span className="text-blue-400 font-bold">Prototype Demo</span>
            </div>
          </div>
        </div>

        {/* Section 3: Product Analysis */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-mono border-b border-slate-800 pb-1">
            3. Product & Demand Trajectory Analysis
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Target SKU (SKU-104) demonstrates structural demand deceleration over the prior 32-month period. Demand velocity has dropped from 24 units/day baseline to 9.2 units/day.
          </p>
        </div>

        {/* Section 4: Inventory Analysis & Risk */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-mono border-b border-slate-800 pb-1">
            4. Inventory Posture & Holding Risk Assessment
          </h3>
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2">
            <div className="flex justify-between font-mono font-bold">
              <span className="text-amber-300">Holding Posture: Overstock Warning</span>
              <span className="text-amber-400">1,420 units on-hand vs 260 forecast demand</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Current holding level exceeds 30-day forecast demand by 315%. Capital tied up in excess inventory is estimated at $64,200.
            </p>
          </div>
        </div>

        {/* Section 5: Recommended Action */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-mono border-b border-slate-800 pb-1">
            5. Recommended Operational Action
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Recommended Action: Freeze draft purchase orders for SKU-104. Recommended reorder quantity is 0 units. Evaluate promotional discount or seasonal Markdown strategy to liquidate surplus holding.
          </p>
        </div>

        {/* Section 6: Methodology & Limitations */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-mono border-b border-slate-800 pb-1">
            6. Methodology & Limitations Disclaimer
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Forecasts generated using XGBoost Regressor (v2.1). Demand During Lead Time and Safety Stock parameters computed assuming 95% service level confidence. This prototype report uses synthetic sample dataset values for demonstration.
          </p>
        </div>

        {/* Section 7: Human Officer Sign-Off */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            <span>Reviewed By: ___________________</span>
            <span className="block text-[10px] text-slate-500 mt-1">Supply Chain Officer</span>
          </div>
          <div>
            <span>Approval Date: ___________________</span>
            <span className="block text-[10px] text-slate-500 mt-1">Human Decision Audit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
