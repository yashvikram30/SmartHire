import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, Briefcase, Users, Eye, TrendingUp,
  ChevronDown, ExternalLink, AlertCircle, CheckCircle,
  FileText, Star, UserCheck, XCircle, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { recruiterApi } from '@api/recruiterApi';
import Spinner from '@components/common/Spinner';
import toast from 'react-hot-toast';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const STATUS_COLORS = {
  submitted:    { bar: 'bg-blue-500',   pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  reviewed:     { bar: 'bg-purple-500', pill: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  shortlisted:  { bar: 'bg-yellow-400', pill: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  interviewing: { bar: 'bg-orange-500', pill: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  offered:      { bar: 'bg-green-500',  pill: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  rejected:     { bar: 'bg-red-500',    pill: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  withdrawn:    { bar: 'bg-gray-400',   pill: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

const STATUS_LABELS = {
  submitted: 'Submitted', reviewed: 'Reviewed', shortlisted: 'Shortlisted',
  interviewing: 'Interviewing', offered: 'Offered', rejected: 'Rejected', withdrawn: 'Withdrawn',
};

function pct(val, total) {
  if (!total || !val) return 0;
  return Math.round((val / total) * 100);
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

/* ─── sub-components ──────────────────────────────────────────────────────── */

function StatCard({ label, value, Icon, iconBg, subLabel, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay || 0 }}
      className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 border border-light-border dark:border-dark-border shadow-sm"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-bold text-light-text dark:text-dark-text mb-1">
        {value != null ? value : <span className="text-gray-300">—</span>}
      </p>
      <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
      {subLabel && <p className="text-xs text-gray-400 mt-1">{subLabel}</p>}
    </motion.div>
  );
}

/* horizontal bar chart row */
function BarRow({ label, value, total, barColor, pillColor }) {
  const width = pct(value, total);
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 w-28 text-center ${pillColor}`}>{label}</span>
      <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
      <span className="text-xs font-bold text-light-text dark:text-dark-text w-8 text-right">{value}</span>
      <span className="text-xs text-gray-400 w-8 text-right">{width}%</span>
    </div>
  );
}

/* job performance card */
function JobPerfCard({ job, metrics, metricsLoading }) {
  const appStats = metrics?.applications || {};
  const traffic  = metrics?.traffic?.summary || {};
  const total    = appStats.total || 0;

  const funnel = [
    { key: 'submitted',    val: appStats.submitted    || appStats.byStatus?.submitted    || 0 },
    { key: 'reviewed',     val: appStats.reviewed     || appStats.byStatus?.reviewed     || 0 },
    { key: 'shortlisted',  val: appStats.shortlisted  || appStats.byStatus?.shortlisted  || 0 },
    { key: 'interviewing', val: appStats.interviewing || appStats.byStatus?.interviewing || 0 },
    { key: 'offered',      val: appStats.offered      || appStats.byStatus?.offered      || 0 },
    { key: 'rejected',     val: appStats.rejected     || appStats.byStatus?.rejected     || 0 },
  ].filter(f => f.val > 0);

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden">
      <div className="flex items-start justify-between px-6 py-5 border-b border-light-border dark:border-dark-border">
        <div>
          <h3 className="font-semibold text-light-text dark:text-dark-text">{job.title}</h3>
          <div className="flex gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{job.views || 0} views</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicationCount || 0} apps</span>
            <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />Posted {fmtDate(job.postedAt)}</span>
          </div>
        </div>
        <Link to={`/recruiter/jobs/${job._id}`} className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 shrink-0 ml-4">
          Manage <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {metricsLoading ? (
        <div className="flex justify-center py-8"><Spinner size="sm" /></div>
      ) : (
        <div className="p-6 space-y-6">
          {/* summary numbers */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Applications', val: total },
              { label: 'Views',        val: job.views || 0 },
              { label: 'Conversion',   val: job.views ? `${pct(total, job.views)}%` : '—' },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-xl">
                <p className="text-xl font-bold text-light-text dark:text-dark-text">{s.val}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* funnel bars */}
          {funnel.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mb-3">Application Funnel</p>
              <div className="space-y-2.5">
                {funnel.map(({ key, val }) => (
                  <BarRow
                    key={key}
                    label={STATUS_LABELS[key] || key}
                    value={val}
                    total={total}
                    barColor={STATUS_COLORS[key]?.bar || 'bg-gray-400'}
                    pillColor={STATUS_COLORS[key]?.pill || 'bg-gray-100 text-gray-600'}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary italic text-center py-2">No application data yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── main component ──────────────────────────────────────────────────────── */

export default function RecruiterAnalytics() {
  const [dashData, setDashData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  /* job selector for per-job metrics */
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobMetrics, setJobMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  /* view mode: overview | per-job */
  const [viewMode, setViewMode] = useState('overview');

  /* load overview analytics */
  useEffect(() => {
    recruiterApi.getDashboardAnalytics()
      .then(res => {
        if (res.success) {
          setDashData(res.data);
          const jobList = res.data?.jobs || [];
          setJobs(jobList);
          if (jobList.length > 0) setSelectedJobId(jobList[0]._id);
        }
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setDashLoading(false));
  }, []);

  /* load per-job metrics when selection changes */
  useEffect(() => {
    if (!selectedJobId || viewMode !== 'per-job') return;
    setMetricsLoading(true);
    recruiterApi.getJobPerformanceMetrics(selectedJobId)
      .then(res => { if (res.success) setJobMetrics(res.data); })
      .catch(() => toast.error('Failed to load job metrics'))
      .finally(() => setMetricsLoading(false));
  }, [selectedJobId, viewMode]);

  const summary  = dashData?.summary || {};
  const allJobs  = dashData?.jobs || [];

  /* build overview funnel across all jobs */
  const overviewFunnelTotal = summary.totalApplications || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">

      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-500" />
            Analytics
          </h1>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
            Track your internship performance and hiring pipeline.
          </p>
        </div>

        {/* mode toggle */}
        <div className="flex items-center bg-white dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-xl p-1 self-start">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'per-job',  label: 'Per Internship' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === tab.id ? 'bg-primary-600 text-white shadow' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── overview mode ─────────────────────────────────────────────────── */}
      {viewMode === 'overview' && (
        <>
          {/* top stats */}
          {dashLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[0,1,2,3].map(i => (
                <div key={i} className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 border border-light-border dark:border-dark-border animate-pulse">
                  <div className="w-11 h-11 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4" />
                  <div className="h-8 w-16 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-3 w-28 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard label="Total Internships"   value={summary.totalJobs ?? 0}         Icon={Briefcase}   iconBg="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"  subLabel={`${summary.activeJobs || 0} active`}  delay={0}    />
              <StatCard label="Active Listings"     value={summary.activeJobs ?? 0}        Icon={TrendingUp}  iconBg="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"      subLabel="Accepting applications"               delay={0.05} />
              <StatCard label="Total Applications"  value={summary.totalApplications ?? 0} Icon={Users}       iconBg="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"  subLabel="Across all listings"                  delay={0.1}  />
              <StatCard label="Total Views"         value={summary.totalViews ?? 0}        Icon={Eye}         iconBg="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"  subLabel="Candidate impressions"                delay={0.15} />
            </div>
          )}

          {/* all jobs table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-light-border dark:border-dark-border">
              <h2 className="font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary-500" />
                Internship Performance
              </h2>
            </div>

            {dashLoading ? (
              <div className="flex justify-center py-10"><Spinner size="md" /></div>
            ) : allJobs.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-light-text-secondary dark:text-dark-text-secondary">No internships posted yet.</p>
                <Link to="/recruiter/post-job" className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block">Post your first internship →</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-dark-bg-tertiary/30 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      <th className="px-6 py-3 text-left">Internship</th>
                      <th className="px-6 py-3 text-right">Views</th>
                      <th className="px-6 py-3 text-right">Applications</th>
                      <th className="px-6 py-3 text-right">Conversion</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-right">Posted</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-border dark:divide-dark-border">
                    {allJobs.map((job, i) => {
                      const conv = job.views ? pct(job.applicationCount || 0, job.views) : 0;
                      return (
                        <motion.tr
                          key={job._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.05 * i }}
                          className="hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-light-text dark:text-dark-text">{job.title}</p>
                          </td>
                          <td className="px-6 py-4 text-right text-light-text-secondary dark:text-dark-text-secondary font-medium">{job.views || 0}</td>
                          <td className="px-6 py-4 text-right text-light-text-secondary dark:text-dark-text-secondary font-medium">{job.applicationCount || 0}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-semibold ${conv >= 10 ? 'text-green-600 dark:text-green-400' : conv >= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}`}>
                              {conv}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${job.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-xs text-gray-400">{fmtDate(job.postedAt)}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => { setViewMode('per-job'); setSelectedJobId(job._id); }}
                              className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 ml-auto"
                            >
                              Details <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* conversion tip */}
          {!dashLoading && summary.totalViews > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-5"
            >
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Overall Conversion Rate</p>
                <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-0.5">
                  {pct(summary.totalApplications, summary.totalViews)}% of visitors applied across all your internships.
                  {pct(summary.totalApplications, summary.totalViews) < 5 && ' Consider improving your job descriptions to attract more applicants.'}
                </p>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ── per-job mode ───────────────────────────────────────────────────── */}
      {viewMode === 'per-job' && (
        <>
          {/* job selector */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-light-border dark:border-dark-border shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-light-text dark:text-dark-text shrink-0">
                <Briefcase className="w-4 h-4 text-primary-500" />
                Select Internship
              </div>
              {dashLoading ? (
                <div className="h-10 flex-1 max-w-sm bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ) : jobs.length === 0 ? (
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  No internships yet.{' '}
                  <Link to="/recruiter/post-job" className="text-primary-600 dark:text-primary-400 hover:underline">Post one →</Link>
                </p>
              ) : (
                <div className="relative flex-1 max-w-sm">
                  <select
                    value={selectedJobId}
                    onChange={e => setSelectedJobId(e.target.value)}
                    className="w-full appearance-none border border-light-border dark:border-dark-border rounded-xl px-4 py-2.5 pr-10 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none cursor-pointer"
                  >
                    {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* selected job card */}
          {selectedJobId && (
            <motion.div
              key={selectedJobId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <JobPerfCard
                job={jobs.find(j => j._id === selectedJobId) || {}}
                metrics={jobMetrics}
                metricsLoading={metricsLoading}
              />
            </motion.div>
          )}

          {/* all other jobs as smaller cards */}
          {allJobs.length > 1 && (
            <div>
              <h2 className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mb-4">All Internships</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allJobs.map(job => (
                  <button
                    key={job._id}
                    onClick={() => setSelectedJobId(job._id)}
                    className={`text-left p-4 rounded-2xl border transition-all ${selectedJobId === job._id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-light-border dark:border-dark-border bg-white dark:bg-dark-bg-secondary hover:border-primary-300 dark:hover:border-primary-700'}`}
                  >
                    <p className={`font-medium text-sm truncate mb-2 ${selectedJobId === job._id ? 'text-primary-700 dark:text-primary-300' : 'text-light-text dark:text-dark-text'}`}>{job.title}</p>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{job.views || 0}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicationCount || 0}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
