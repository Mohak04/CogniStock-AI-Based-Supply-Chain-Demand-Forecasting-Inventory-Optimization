import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { mockActivityTimeline } from '../../data/mockActivity';
import { activityService } from '../../services/activityService';
import { Activity, Clock, User, FileText, Cpu, Database, CheckSquare, ShieldCheck } from 'lucide-react';

export const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await activityService.getActivity();
        if (data && data.length > 0) {
          setActivities(data);
        } else {
          setActivities(mockActivityTimeline);
        }
      } catch (err) {
        setActivities(mockActivityTimeline);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Activity & Governance Audit Log"
        subtitle="Immutable event trail logging dataset uploads, model retraining events, recommendation approvals, and report generation."
        breadcrumbItems={[{ label: "System", href: "/activity" }, { label: "Activity / Audit Log" }]}
      />

      <div className="card-panel p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span>Company System Audit Log</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {activities.length} Recorded Events
          </span>
        </div>

        {/* Timeline Stream */}
        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {activities.map((act) => (
            <div key={act.id} className="relative pl-9 space-y-1">
              {/* Event node dot */}
              <div className="absolute left-0 top-1.5 w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 z-10">
                <Clock className="w-3.5 h-3.5" />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-xs">{act.action}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {act.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <span>{act.timestamp}</span>
                    <StatusBadge status={act.status} size="sm" />
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{act.details}</p>

                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" /> Triggered by: {act.user}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
