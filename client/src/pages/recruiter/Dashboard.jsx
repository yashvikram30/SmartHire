import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Users, Eye, TrendingUp, Plus, Search,
  Clock, CheckCircle, XCircle, AlertCircle,
  Star, ArrowUpRight, FileText, BarChart3, UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { recruiterApi } from '@api/recruiterApi';
import useAuthStore from '@store/authStore';
import Spinner from '@components/common/Spinner';
import toast from 'react-hot-toast';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const STATUS_MAP = {
  submitted:    { label: 'Submitted',    bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',    Icon: FileText },
  reviewed:     { label: 'Reviewed',     bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', Icon: Eye },
  shortlisted:  { label: 'Shortlisted',  bg: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', Icon: Star },
  interviewing: { label: 'Interviewing', bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', Icon: UserCheck },
  offered:      { label: 'Offered',      bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',   Icon: CheckCircle },
  rejected:     { label: 'Rejected',     bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',         Icon: XCircle },
  withdrawn:    { label: 'Withdrawn',    bg: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',         Icon: AlertCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || { label: status, bg: 'bg-gray-100 text-gray-600', Icon: FileText };
  const Icon = cfg.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function timeAgo(date) {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

function nameInitials(first, last) {
  const f = (first || '').charAt(0).toUpperCase();
  const l = (last || '').charAt(0).toUpperCase();
  return f + l || '?';
}

/* ─── stat card ───────────────────────────────────────────────────────────── */

function StatCard({ label, value, Icon, iconBg, subLabel, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay || 0 }}
      className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 border border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-bold text-light-text dark:text-dark-text mb-1">
        {value != null ? value : <span className="text-gray-300 dark:text-gray-600">—</span>}
      </p>
      <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
      {subLabel && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subLabel}</p>}
    </motion.div>
  );
}

/* ─── skeleton ────────────────────────────────────────────────────────────── */

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`} />;
}

/* ─── main ────────────────────────────────────────────────────────────────── */

export default function RecruiterDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recruiterApi.getDashboardAnalytics()
      .then(res => { if (res.success) setData(res.data); })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const summary = data?.summary || {};
  const recentApps = data?.recentApplications || [];
  const topJobs = data?.jobs || [];
  const firstName = user?.firstName || 'Recruiter';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">

      {/* welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 p-8 text-white shadow-lg"
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-60 h-60 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">Welcome back 👋</p>
            <h1 className="text-3xl font-bold tracking-tight">{firstName}</h1>
            <p className="text-white/80 mt-2 text-sm max-w-sm">
              Here's an overview of your hiring activity. Post an internship or review recent applications below.
            </p>
          </div>
          <Link
            to="/recruiter/post-job"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-primary-700 font-semibold rounded-xl shadow hover:shadow-md hover:bg-white/90 transition-all duration-200 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Post an Internship
          </Link>
        </div>
      </motion.div>

      {/* stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 border border-light-border dark:border-dark-border">
              <Skeleton className="w-11 h-11 rounded-xl mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Total Internships"   value={summary.totalJobs ?? 0}        Icon={Briefcase}   iconBg="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"  subLabel={`${summary.activeJobs ?? 0} active`}  delay={0}    />
          <StatCard label="Active Listings"     value={summary.activeJobs ?? 0}       Icon={TrendingUp}  iconBg="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"      subLabel="Accepting applications"                delay={0.05} />
          <StatCard label="Total Applications"  value={summary.totalApplications ?? 0} Icon={Users}       iconBg="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"  subLabel="Across all listings"                   delay={0.1}  />
          <StatCard label="Total Views"         value={summary.totalViews ?? 0}        Icon={Eye}         iconBg="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"  subLabel="Candidate impressions"                 delay={0.15} />
        </div>
      )}

      {/* lower grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* recent applications */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-dark-bg-secondary rounded-2xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
            <h2 className="font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-500" />
              Recent Applications
            </h2>
            <Link to="/recruiter/applications" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16"><Spinner size="md" /></div>
          ) : recentApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-gray-400" />
              </div>
              <p className="font-medium text-light-text dark:text-dark-text">No applications yet</p>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                Applications will appear here once candidates start applying.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-light-border dark:divide-dark-border">
              {recentApps.map((app, i) => {
                const seeker = app.jobSeekerId;
                const fullName = seeker
                  ? `${seeker.firstName || ''} ${seeker.lastName || ''}`.trim() || 'Unknown'
                  : 'Unknown Applicant';
                const jobTitle = app.jobId?.title || 'Untitled Internship';
                return (
                  <motion.li
                    key={app._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      {seeker?.profilePicture
                        ? <img src={seeker.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                        : nameInitials(seeker?.firstName, seeker?.lastName)
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-light-text dark:text-dark-text text-sm truncate">{fullName}</p>
                      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate">
                        Applied to <span className="text-primary-600 dark:text-primary-400">{jobTitle}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={app.status} />
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(app.appliedAt)}
                      </span>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </motion.div>

        {/* right column */}
        <div className="space-y-6">

          {/* quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-light-border dark:border-dark-border shadow-sm p-6"
          >
            <h2 className="font-semibold text-light-text dark:text-dark-text mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: '/recruiter/post-job',    Icon: Plus,      label: 'Post New Internship',    cls: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' },
                { to: '/recruiter/jobs',         Icon: Briefcase, label: 'My Internship Listings',  cls: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
                { to: '/recruiter/applications', Icon: FileText,  label: 'Review Applications',    cls: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
                { to: '/recruiter/candidates',   Icon: Search,    label: 'Search Candidates',       cls: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
                { to: '/recruiter/analytics',    Icon: BarChart3, label: 'View Analytics',          cls: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary/50 transition-colors group"
                >
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.cls}`}>
                    <item.Icon className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-medium text-light-text dark:text-dark-text group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {item.label}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* top internships */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-light-border dark:border-dark-border">
              <h2 className="font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                Top Internships
              </h2>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[0, 1, 2].map(i => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : topJobs.length === 0 ? (
              <div className="py-10 text-center px-6">
                <Briefcase className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No internships posted yet.</p>
                <Link to="/recruiter/post-job" className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 inline-block">
                  Post your first internship →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-light-border dark:divide-dark-border">
                {topJobs.slice(0, 5).map((job, i) => (
                  <li key={job._id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary/50 transition-colors">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/recruiter/jobs/${job._id}`}
                        className="text-sm font-medium text-light-text dark:text-dark-text hover:text-primary-600 dark:hover:text-primary-400 truncate block transition-colors"
                      >
                        {job.title}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{job.views || 0}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicationCount || 0}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      job.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {job.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
