import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, FileText, CheckCircle, XCircle,
  Star, Users, UserCheck, Eye, Search, MessageSquare,
  Calendar, ExternalLink, AlertCircle, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { recruiterApi } from '@api/recruiterApi';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import Spinner from '@components/common/Spinner';
import toast from 'react-hot-toast';

/* ─── constants ───────────────────────────────────────────────────────────── */

const STATUS_OPTIONS = [
  { value: 'submitted',    label: 'Submitted',    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
  { value: 'reviewed',     label: 'Reviewed',     color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400' },
  { value: 'shortlisted',  label: 'Shortlisted',  color: 'text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400' },
  { value: 'interviewing', label: 'Interviewing', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400' },
  { value: 'offered',      label: 'Offered',      color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' },
  { value: 'rejected',     label: 'Rejected',     color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' },
];

const STATUS_ICON = {
  submitted:    FileText,
  reviewed:     Eye,
  shortlisted:  Star,
  interviewing: UserCheck,
  offered:      CheckCircle,
  rejected:     XCircle,
  withdrawn:    AlertCircle,
};

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

function getInitials(first, last) {
  return ((first || '').charAt(0) + (last || '').charAt(0)).toUpperCase() || '?';
}

/* ─── sub-components ──────────────────────────────────────────────────────── */

function StatusBadge({ status }) {
  const opt = STATUS_OPTIONS.find(o => o.value === status);
  const Icon = STATUS_ICON[status] || FileText;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${opt ? opt.color : 'text-gray-600 bg-gray-100 dark:bg-gray-800'}`}>
      <Icon className="w-3 h-3" />
      {opt ? opt.label : status}
    </span>
  );
}

function StarRating({ rating, appId, onRate }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onRate(appId, n)}
          className="transition-transform hover:scale-110"
          title={`Rate ${n} star${n > 1 ? 's' : ''}`}
        >
          <Star className={`w-4 h-4 ${n <= (rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
        </button>
      ))}
    </div>
  );
}

function AppCard({ app, onStatusUpdate, onOpenNote, onRate, onOpenSchedule }) {
  const [expanded, setExpanded] = useState(false);
  const seeker = app.jobSeekerId;
  const firstName = seeker?.firstName || '';
  const lastName = seeker?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Applicant';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
        {/* avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white font-bold text-base shrink-0 overflow-hidden">
          {seeker?.profilePicture
            ? <img src={seeker.profilePicture} alt="" className="w-full h-full object-cover" />
            : getInitials(firstName, lastName)
          }
        </div>

        {/* info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-light-text dark:text-dark-text text-sm">{fullName}</h3>
            <StatusBadge status={app.status} />
          </div>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            {seeker?.email || '—'} · Applied {fmtDate(app.appliedAt)}
          </p>
          <div className="mt-1.5">
            <StarRating rating={app.rating} appId={app._id} onRate={onRate} />
          </div>
        </div>

        {/* actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            value={app.status}
            onChange={e => onStatusUpdate(app._id, e.target.value)}
            className="text-xs border border-light-border dark:border-dark-border rounded-lg px-2.5 py-1.5 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:outline-none cursor-pointer"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button
            onClick={() => onOpenNote(app)}
            title="Add note"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors text-gray-500 dark:text-gray-400"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenSchedule(app)}
            title="Schedule interview"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors text-gray-500 dark:text-gray-400"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {seeker?._id && (
            <Link
              to={`/recruiter/candidates/${seeker._id}`}
              title="View profile"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors text-gray-500 dark:text-gray-400"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}

          <button
            onClick={() => setExpanded(p => !p)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors text-gray-500 dark:text-gray-400"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* expandable details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-light-border dark:border-dark-border"
          >
            <div className="p-5 space-y-4 bg-gray-50 dark:bg-dark-bg-tertiary/30">
              {app.coverLetter ? (
                <div>
                  <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mb-2">Cover Letter</p>
                  <p className="text-sm text-light-text dark:text-dark-text leading-relaxed whitespace-pre-wrap line-clamp-6">{app.coverLetter}</p>
                </div>
              ) : (
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary italic">No cover letter provided.</p>
              )}

              {app.resumeUsed?.fileUrl && (
                <a
                  href={app.resumeUsed.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Resume — {app.resumeUsed.fileName}
                </a>
              )}

              {app.recruiterNotes?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mb-2">Notes</p>
                  <ul className="space-y-2">
                    {app.recruiterNotes.map((n, idx) => (
                      <li key={idx} className="text-xs text-light-text-secondary dark:text-dark-text-secondary bg-white dark:bg-dark-bg-secondary rounded-lg px-3 py-2 border border-light-border dark:border-dark-border">
                        <p>{n.note}</p>
                        <p className="text-gray-400 mt-1">{fmtDate(n.addedAt)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {app.interviewDetails?.scheduledAt && (
                <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg">
                  <Calendar className="w-3.5 h-3.5" />
                  Interview scheduled: {fmtDate(app.interviewDetails.scheduledAt)}
                  {app.interviewDetails.meetingLink && (
                    <a href={app.interviewDetails.meetingLink} target="_blank" rel="noopener noreferrer" className="underline ml-2">Join</a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── main ────────────────────────────────────────────────────────────────── */

export default function RecruiterApplications() {
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState('');

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [appsLoading, setAppsLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [noteModal, setNoteModal] = useState({ open: false, app: null });
  const [scheduleModal, setScheduleModal] = useState({ open: false, app: null });
  const [noteText, setNoteText] = useState('');
  const [scheduleData, setScheduleData] = useState({ scheduledAt: '', meetingLink: '', notes: '' });
  const [saving, setSaving] = useState(false);

  /* load jobs */
  useEffect(() => {
    recruiterApi.getMyJobs({ limit: 100 })
      .then(res => {
        const list = res.data || [];
        setJobs(list);
        if (list.length > 0) setSelectedJobId(list[0]._id);
      })
      .catch(() => toast.error('Failed to load your internships'))
      .finally(() => setJobsLoading(false));
  }, []);

  /* load applications */
  const fetchApplications = useCallback(() => {
    if (!selectedJobId) return;
    setAppsLoading(true);
    recruiterApi.getApplicationsForJob(selectedJobId)
      .then(res => {
        if (res.success) {
          setApplications(res.data || []);
          setStats(res.stats || null);
        }
      })
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setAppsLoading(false));
  }, [selectedJobId]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  /* derived */
  const filtered = applications.filter(app => {
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    const seeker = app.jobSeekerId;
    const name = seeker ? `${seeker.firstName || ''} ${seeker.lastName || ''}`.toLowerCase() : '';
    const matchSearch = !searchQuery || name.includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const countFor = s => s === 'all' ? applications.length : applications.filter(a => a.status === s).length;

  /* actions */
  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await recruiterApi.updateApplicationStatus(appId, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleRate = async (appId, rating) => {
    try {
      await recruiterApi.rateCandidate(appId, { rating });
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, rating } : a));
    } catch {
      toast.error('Failed to save rating');
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) { toast.error('Note cannot be empty'); return; }
    setSaving(true);
    try {
      await recruiterApi.addRecruiterNotes(noteModal.app._id, { note: noteText });
      toast.success('Note added');
      setNoteModal({ open: false, app: null });
      setNoteText('');
      fetchApplications();
    } catch {
      toast.error('Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleData.scheduledAt) { toast.error('Please select a date & time'); return; }
    setSaving(true);
    try {
      await recruiterApi.scheduleInterview(scheduleModal.app._id, scheduleData);
      toast.success('Interview scheduled!');
      setScheduleModal({ open: false, app: null });
      setScheduleData({ scheduledAt: '', meetingLink: '', notes: '' });
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setSaving(false);
    }
  };

  /* ── render ── */
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">

      {/* header */}
      <div>
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Applications</h1>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
          Review and manage candidate applications across your internship listings.
        </p>
      </div>

      {/* job selector + stats */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-light-border dark:border-dark-border shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-light-text dark:text-dark-text shrink-0">
            <Briefcase className="w-4 h-4 text-primary-500" />
            Internship
          </div>

          {jobsLoading ? (
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
                onChange={e => { setSelectedJobId(e.target.value); setStatusFilter('all'); }}
                className="w-full appearance-none border border-light-border dark:border-dark-border rounded-xl px-4 py-2.5 pr-10 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none cursor-pointer"
              >
                {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* stat pills */}
          {stats && (
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              {[
                { label: 'Total',        val: stats.total || applications.length, css: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
                { label: 'Shortlisted',  val: stats.shortlisted || 0,             css: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
                { label: 'Interviewing', val: stats.interviewing || 0,            css: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
                { label: 'Offered',      val: stats.offered || 0,                 css: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
              ].map(s => (
                <span key={s.label} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.css}`}>
                  {s.label}: {s.val}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* search + status tabs */}
      {selectedJobId && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search applicants…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-light-border dark:border-dark-border rounded-xl bg-white dark:bg-dark-bg-secondary text-sm text-light-text dark:text-dark-text placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-xl p-1 overflow-x-auto">
            {['all', ...STATUS_OPTIONS.map(o => o.value)].map(s => {
              const cnt = countFor(s);
              const isActive = statusFilter === s;
              const label = s === 'all' ? 'All' : STATUS_OPTIONS.find(o => o.value === s)?.label;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${isActive ? 'bg-primary-600 text-white shadow' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'}`}
                >
                  {label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    {cnt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* list / empty states */}
      {!selectedJobId && !jobsLoading ? (
        <div className="text-center py-20 bg-white dark:bg-dark-bg-secondary rounded-2xl border border-dashed border-light-border dark:border-dark-border">
          <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-semibold text-light-text dark:text-dark-text">Select an internship above</p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">Choose a listing to view its applications.</p>
        </div>
      ) : appsLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-bg-secondary rounded-2xl border border-dashed border-light-border dark:border-dark-border">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-semibold text-light-text dark:text-dark-text">
            {applications.length === 0 ? 'No applications yet' : 'No results match your filters'}
          </p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
            {applications.length === 0 ? 'Share your internship to start receiving applications.' : 'Try adjusting your search or status filter.'}
          </p>
          {statusFilter !== 'all' && (
            <button onClick={() => setStatusFilter('all')} className="mt-4 text-sm text-primary-600 dark:text-primary-400 hover:underline">Clear filters</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            Showing {filtered.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
          </p>
          <AnimatePresence>
            {filtered.map(app => (
              <AppCard
                key={app._id}
                app={app}
                onStatusUpdate={handleStatusUpdate}
                onOpenNote={a => { setNoteModal({ open: true, app: a }); setNoteText(''); }}
                onRate={handleRate}
                onOpenSchedule={a => { setScheduleModal({ open: true, app: a }); setScheduleData({ scheduledAt: '', meetingLink: '', notes: '' }); }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* note modal */}
      <Modal isOpen={noteModal.open} onClose={() => setNoteModal({ open: false, app: null })} title="Add Recruiter Note">
        <div className="space-y-4">
          {noteModal.app && (
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Note for <strong className="text-light-text dark:text-dark-text">{noteModal.app.jobSeekerId?.firstName} {noteModal.app.jobSeekerId?.lastName}</strong>
            </p>
          )}
          <textarea
            rows={4}
            placeholder="Add your private note here…"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            className="w-full border border-light-border dark:border-dark-border rounded-xl px-4 py-3 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setNoteModal({ open: false, app: null })} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={handleAddNote} disabled={saving}>{saving ? 'Saving…' : 'Add Note'}</Button>
          </div>
        </div>
      </Modal>

      {/* schedule modal */}
      <Modal isOpen={scheduleModal.open} onClose={() => setScheduleModal({ open: false, app: null })} title="Schedule Interview">
        <div className="space-y-4">
          {scheduleModal.app && (
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Scheduling for <strong className="text-light-text dark:text-dark-text">{scheduleModal.app.jobSeekerId?.firstName} {scheduleModal.app.jobSeekerId?.lastName}</strong>
            </p>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Date &amp; Time <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                value={scheduleData.scheduledAt}
                onChange={e => setScheduleData(p => ({ ...p, scheduledAt: e.target.value }))}
                className="w-full border border-light-border dark:border-dark-border rounded-xl px-4 py-2.5 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Meeting Link (optional)</label>
              <input
                type="url"
                placeholder="https://meet.google.com/…"
                value={scheduleData.meetingLink}
                onChange={e => setScheduleData(p => ({ ...p, meetingLink: e.target.value }))}
                className="w-full border border-light-border dark:border-dark-border rounded-xl px-4 py-2.5 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Notes (optional)</label>
              <textarea
                rows={3}
                placeholder="Interview topics, prerequisites…"
                value={scheduleData.notes}
                onChange={e => setScheduleData(p => ({ ...p, notes: e.target.value }))}
                className="w-full border border-light-border dark:border-dark-border rounded-xl px-4 py-3 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setScheduleModal({ open: false, app: null })} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={handleSchedule} disabled={saving}>{saving ? 'Scheduling…' : 'Schedule Interview'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
