import { MapPin, ExternalLink, Clock, Building2 } from 'lucide-react'
import type { Job } from '../../types'
import { COMPANY_DETAILS } from '../../constants/companies'
import { REGION_FLAGS } from '../../constants/regions'

interface JobCardProps {
  job: Job;
  isNew: boolean;
  currentView: 'active' | 'history';
  onCompanyClick: (company: string) => void;
}

export function JobCard({ job, isNew, currentView, onCompanyClick }: JobCardProps) {
  return (
    <div key={job.id} className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 transition-all duration-200 group relative overflow-hidden ${currentView === 'history' ? 'border-gray-100 dark:border-slate-800 opacity-80 grayscale-[0.5]' : 'border-gray-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900 shadow-sm hover:shadow-md'}`}>
      {isNew && <div className="absolute top-0 left-0"><div className="bg-blue-600 text-white text-[10px] font-black uppercase px-6 py-1 -rotate-45 -translate-x-6 translate-y-1 shadow-sm">New</div></div>}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
        <div className="flex-1 flex gap-5">
          <div className={`hidden sm:flex items-center justify-center w-14 h-14 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden bg-white shrink-0 ${currentView === 'history' ? 'opacity-50' : ''}`}>
            {COMPANY_DETAILS[job.company]?.customLogo ? (
              <img 
                src={COMPANY_DETAILS[job.company].customLogo} 
                alt={`${job.company} logo`}
                className="max-w-full max-h-full object-contain p-1"
              />
            ) : COMPANY_DETAILS[job.company]?.logoDomain ? (
              <img 
                src={`https://logo.clearbit.com/${COMPANY_DETAILS[job.company].logoDomain}`} 
                alt={`${job.company} logo`}
                className="max-w-full max-h-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(job.company) + '&background=random';
                }}
              />
            ) : (
              <Building2 className="h-6 w-6 text-gray-300 dark:text-slate-600" />
            )}
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-black leading-tight ${currentView === 'history' ? 'text-gray-700 dark:text-slate-400' : 'text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'}`}>{job.title}</h2>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500 dark:text-slate-400 mt-4">
              <div className="flex items-center font-bold text-gray-700 dark:text-slate-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400" onClick={() => onCompanyClick(job.company)}>
                <Building2 className="h-4 w-4 mr-2 text-gray-400 dark:text-slate-500 sm:hidden" />
                {job.company}
              </div>
              <div className="flex items-center font-medium"><MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-slate-500" />{job.location}</div>
              <div className="flex items-center text-gray-500 dark:text-slate-400 font-bold bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-[11px] uppercase tracking-wider">
                <span className="mr-1.5 text-sm">{REGION_FLAGS[job.region] || '📍'}</span>{job.region}
              </div>
              <div className="flex items-center text-[11px] font-bold text-gray-400 dark:text-slate-500"><Clock className="h-3.5 w-3.5 mr-1.5" />{new Date(job.postedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center">
          {currentView === 'active' ? (
            <a href={job.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-black rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200">
              Apply <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          ) : <div className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase italic px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg">Expired</div>}
        </div>
      </div>
    </div>
  );
}
