import { useState, useEffect } from 'react'
import { X, Calendar, User, Mail, FileText, Trash2, Briefcase, ChevronRight, Check } from 'lucide-react'
import type { Job, JobApplication } from '../../types'
import { COMPANY_DETAILS } from '../../constants/companies'

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  existingApplication?: JobApplication;
  onSave: (jobId: string, app: Partial<JobApplication> & { status: JobApplication['status'] }) => void;
  onDelete?: (jobId: string) => void;
}

const STATUS_OPTIONS: {
  value: JobApplication['status'];
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  iconColor: string;
}[] = [
  { 
    value: 'applied', 
    label: 'Applied', 
    colorClass: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/30',
    bgClass: 'bg-blue-600',
    borderClass: 'border-blue-500',
    iconColor: 'text-blue-500'
  },
  { 
    value: 'interviewing', 
    label: 'Interviewing', 
    colorClass: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/30',
    bgClass: 'bg-purple-600',
    borderClass: 'border-purple-500',
    iconColor: 'text-purple-500'
  },
  { 
    value: 'offer', 
    label: 'Offer Received', 
    colorClass: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/30',
    bgClass: 'bg-green-600',
    borderClass: 'border-green-500',
    iconColor: 'text-green-500'
  },
  { 
    value: 'rejected', 
    label: 'Rejected', 
    colorClass: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/30',
    bgClass: 'bg-red-600',
    borderClass: 'border-red-500',
    iconColor: 'text-red-500'
  },
  { 
    value: 'withdrawn', 
    label: 'Withdrawn', 
    colorClass: 'text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700',
    bgClass: 'bg-gray-550',
    borderClass: 'border-gray-400',
    iconColor: 'text-gray-400'
  }
]

export function ApplicationModal({ 
  isOpen, onClose, job, existingApplication, onSave, onDelete 
}: ApplicationModalProps) {
  const [status, setStatus] = useState<JobApplication['status']>('applied')
  const [appliedAt, setAppliedAt] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [processStep, setProcessStep] = useState('')
  const [notes, setNotes] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  // Sync state with existing application when modal opens/changes
  useEffect(() => {
    if (isOpen) {
      setStatus(existingApplication?.status || 'applied')
      setAppliedAt(existingApplication?.appliedAt || new Date().toISOString().split('T')[0])
      setContactName(existingApplication?.contactName || '')
      setContactEmail(existingApplication?.contactEmail || '')
      setProcessStep(existingApplication?.processStep || '')
      setNotes(existingApplication?.notes || '')
      setShowConfirmDelete(false)
    }
  }, [isOpen, existingApplication])

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(job.id, {
      status,
      appliedAt,
      contactName: contactName.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      processStep: processStep.trim() || undefined,
      notes: notes.trim() || undefined
    })
    onClose()
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(job.id)
      onClose()
    }
  }

  const companyInfo = COMPANY_DETAILS[job.company]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content container */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden transition-all z-10 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-850 flex items-start justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl border border-gray-100 dark:border-slate-700 bg-white flex items-center justify-center overflow-hidden shrink-0">
              {companyInfo?.customLogo ? (
                <img src={companyInfo.customLogo} alt={job.company} className="max-w-full max-h-full object-contain p-1" />
              ) : companyInfo?.logoDomain ? (
                <img 
                  src={`https://logo.clearbit.com/${companyInfo.logoDomain}`} 
                  alt={job.company} 
                  className="max-w-full max-h-full object-contain p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(job.company) + '&background=random';
                  }}
                />
              ) : (
                <Briefcase className="h-5 w-5 text-gray-405 dark:text-slate-600" />
              )}
            </div>
            <div>
              <h3 className="font-black text-gray-900 dark:text-white leading-snug">{job.title}</h3>
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-tight">{job.company}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-350 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Selection Cards */}
          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Application Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = status === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? `${opt.colorClass} ring-2 ring-blue-500/20 font-black shadow-sm scale-102` 
                        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <span className="text-sm">{opt.label}</span>
                    {isSelected && (
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white ${opt.bgClass}`}>
                        <Check className="h-2.5 w-2.5 stroke-[3px]" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Grid inputs for Process step and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Process Stage */}
            <div>
              <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Current Process Stage
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-650">
                  <ChevronRight className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Technical Test, Final Round"
                  value={processStep}
                  onChange={(e) => setProcessStep(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white placeholder-gray-450 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Date Applied */}
            <div>
              <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Date Applied
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-650">
                  <Calendar className="h-4 w-4" />
                </div>
                <input
                  type="date"
                  value={appliedAt}
                  onChange={(e) => setAppliedAt(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Contact details */}
          <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-150/40 dark:border-slate-800/60 space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              Contact / Recruiter Info
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Contact Name */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-550">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-250 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Contact Email / Social Link */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-550">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Email or LinkedIn URL"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-255 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Preparation Notes / Logs
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none text-gray-400 dark:text-slate-650">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <textarea
                placeholder="Store research, interview questions, preparation checkpoints, and progress updates..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white placeholder-gray-450 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
              />
            </div>
          </div>

        </form>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-850 flex items-center justify-between gap-4">
          
          {/* Delete Action (Show only if existingApplication is tracked) */}
          {existingApplication ? (
            <div>
              {showConfirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-750 shadow-sm transition-all"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-slate-700 text-xs font-bold rounded-xl text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                  title="Stop tracking this application"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              )}
            </div>
          ) : (
            <div /> // Placeholder to keep layout justified
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-750 text-xs font-bold rounded-xl text-gray-705 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-gray-105 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSave}
              className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-xs font-black rounded-xl text-white bg-blue-600 hover:bg-blue-750 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm transition-all hover:scale-102 active:scale-95"
            >
              Save Details
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
