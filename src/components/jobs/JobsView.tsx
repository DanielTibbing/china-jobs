import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Briefcase, RefreshCw, LayoutGrid, List, Building2, ExternalLink, Clock, MapPin, Star, Eye, EyeOff, CheckSquare } from 'lucide-react'
import type { Job, JobApplication } from '../../types'
import { REGION_FLAGS } from '../../constants/regions'
import { COMPANY_DETAILS } from '../../constants/companies'
import { JobCard } from './JobCard'
import { ApplicationModal } from '../applications/ApplicationModal'

interface JobsViewProps {
  loading: boolean;
  error: string | null;
  jobs: Job[];
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedCompany: string;
  setSelectedCompany: (company: string) => void;
  onlyNew?: boolean;
  setOnlyNew?: (onlyNew: boolean) => void;
  companiesFromJobs: string[];
  seenJobIds: Set<string>;
  currentView: 'active' | 'history' | 'starred';
  starredJobIds: Set<string>;
  hiddenJobIds: Set<string>;
  hiddenJobs?: Job[];
  activeJobIds: Set<string>;
  onToggleStarred: (id: string) => void;
  onHide: (id: string) => void;
  onUnhide: (id: string) => void;
  appliedJobs: Record<string, JobApplication>;
  onSaveApplication: (jobId: string, app: Partial<JobApplication> & { status: JobApplication['status'] }) => void;
  onRemoveApplication: (jobId: string) => void;
}

export function JobsView({ 
  loading, error, jobs, selectedRegion, setSelectedRegion, 
  selectedCompany, setSelectedCompany, companiesFromJobs, seenJobIds, currentView,
  starredJobIds, hiddenJobIds, hiddenJobs, activeJobIds, onToggleStarred, onHide, onUnhide,
  appliedJobs, onSaveApplication, onRemoveApplication,
  onlyNew = false, setOnlyNew = () => {}
}: JobsViewProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const handleCompanyClick = (company: string) => {
    setSelectedCompany(company);
    navigate('/');
    window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-[184px] md:top-[136px] z-10 bg-gray-50/95 dark:bg-slate-950/95 backdrop-blur-sm py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-all">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {Object.keys(REGION_FLAGS).map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition duration-150 ease-in-out flex items-center gap-2 ${
                  selectedRegion === region
                    ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-slate-950 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <span className="text-base leading-none">{REGION_FLAGS[region]}</span>
                {region}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400 dark:text-slate-500" />
              </div>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 text-sm border-gray-300 dark:border-slate-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-white dark:bg-slate-900 shadow-sm appearance-none border font-bold text-gray-700 dark:text-slate-300 transition-colors"
              >
                <option value="All">All Companies</option>
                {companiesFromJobs.filter(c => c !== 'All').map(company => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            {currentView === 'active' && (
              <button
                onClick={() => setOnlyNew(!onlyNew)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition duration-150 ease-in-out flex items-center gap-2 shadow-sm shrink-0 hover:scale-[1.02] active:scale-[0.98] ${
                  onlyNew
                    ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <Clock className={`h-4 w-4 ${onlyNew ? 'animate-pulse' : ''}`} />
                New Only
              </button>
            )}

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-1 flex shadow-sm shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'}`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'}`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pb-8">
        {loading ? (
          <div className="text-center py-20"><RefreshCw className="mx-auto h-12 w-12 text-blue-500 animate-spin mb-4" /></div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 dark:bg-red-950/20 rounded-2xl border-2 border-red-100 dark:border-red-900/30">
            <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-bold dark:text-slate-400">No jobs found</h3>
          </div>
        ) : viewMode === 'grid' ? (
          jobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              isNew={currentView === 'active' && !seenJobIds.has(job.id)} 
              onCompanyClick={handleCompanyClick}
              isStarred={starredJobIds.has(job.id)}
              isHidden={hiddenJobIds.has(job.id)}
              onToggleStarred={onToggleStarred}
              onHide={onHide}
              onUnhide={onUnhide}
              isExpired={currentView === 'history' || (currentView === 'starred' && !activeJobIds.has(job.id))}
              trackedApplication={appliedJobs[job.id]}
              onTrackClick={setEditingJob}
            />
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Role & Company</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-center">Region</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Posted</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {jobs.map((job) => {
                    const isNew = currentView === 'active' && !seenJobIds.has(job.id);
                    const companyInfo = COMPANY_DETAILS[job.company];
                    const isStarred = starredJobIds.has(job.id);
                    const isHidden = hiddenJobIds.has(job.id);
                    const isExpired = currentView === 'history' || (currentView === 'starred' && !activeJobIds.has(job.id));
                    
                    return (
                      <tr key={job.id} className={`hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group ${isExpired ? 'opacity-75 grayscale-[0.2]' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center bg-white shrink-0 shadow-sm overflow-hidden relative">
                              {isNew && <div className="absolute top-0 left-0 w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>}
                              {companyInfo?.customLogo ? (
                                <img 
                                  src={companyInfo.customLogo} 
                                  alt={`${job.company} logo`}
                                  className="max-w-full max-h-full object-contain p-1"
                                />
                              ) : companyInfo?.logoDomain ? (
                                <img 
                                  src={`https://logo.clearbit.com/${companyInfo.logoDomain}`} 
                                  alt={`${job.company} logo`}
                                  className="max-w-full max-h-full object-contain p-1"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).onerror = null;
                                    (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(job.company) + '&background=random';
                                  }}
                                />
                              ) : (
                                <Building2 className="h-5 w-5 text-gray-300 dark:text-slate-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-black text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">{job.title}</div>
                              <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-tight mt-0.5" onClick={() => handleCompanyClick(job.company)}>{job.company}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm" title={job.region}>{REGION_FLAGS[job.region] || '📍'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-slate-400">
                            <MapPin className="h-3 w-3 text-gray-400 dark:text-slate-500 shrink-0" />
                            <span className="truncate max-w-[150px]">{job.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-slate-500 whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            {new Date(job.postedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 shrink-0">
                            {/* Star Toggle Button */}
                            <button
                              onClick={() => onToggleStarred(job.id)}
                              className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 ${
                                isStarred
                                  ? 'bg-amber-50 border-amber-250 text-amber-500 hover:bg-amber-100 hover:border-amber-350 dark:bg-amber-950/20 dark:border-amber-900/30 dark:hover:bg-amber-900/40 dark:text-amber-400'
                                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-655 hover:bg-gray-100 hover:border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 dark:hover:bg-slate-750 dark:hover:text-slate-350'
                              }`}
                              title={isStarred ? "Remove from Starred" : "Add to Starred"}
                              aria-label={isStarred ? "Remove from Starred" : "Add to Starred"}
                            >
                              <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
                            </button>

                            {/* Track Application Button */}
                            <button
                              onClick={() => setEditingJob(job)}
                              className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 ${
                                appliedJobs[job.id]
                                  ? appliedJobs[job.id].status === 'applied' ? 'bg-blue-50 border-blue-200 text-blue-650 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400'
                                    : appliedJobs[job.id].status === 'interviewing' ? 'bg-purple-50 border-purple-200 text-purple-650 dark:bg-purple-950/20 dark:border-purple-900/30 dark:text-purple-400'
                                    : appliedJobs[job.id].status === 'offer' ? 'bg-green-50 border-green-200 text-green-650 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400'
                                    : appliedJobs[job.id].status === 'rejected' ? 'bg-red-50 border-red-200 text-red-650 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400'
                                    : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-150 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 dark:hover:bg-slate-750 dark:hover:text-slate-300'
                              }`}
                              title={appliedJobs[job.id] ? `Tracked: ${appliedJobs[job.id].status.toUpperCase()} (Click to edit)` : "Track Application Progress"}
                              aria-label={appliedJobs[job.id] ? `Tracked: ${appliedJobs[job.id].status.toUpperCase()}` : "Track Application"}
                            >
                              <CheckSquare className="h-4 w-4" />
                            </button>

                            {/* Hide / Unhide Toggle Button */}
                            {isHidden ? (
                              <button
                                onClick={() => onUnhide(job.id)}
                                className="p-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 hover:border-blue-150 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 dark:hover:bg-blue-950/20 dark:hover:border-blue-900/30 dark:hover:text-blue-400 hover:scale-105 active:scale-95 transition-all duration-200"
                                title="Restore / Unhide Listing"
                                aria-label="Restore Listing"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => onHide(job.id)}
                                className="p-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-150 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 dark:hover:bg-red-950/20 dark:hover:border-red-900/30 dark:hover:text-red-400 hover:scale-105 active:scale-95 transition-all duration-200"
                                title="Permanently Hide Listing"
                                aria-label="Hide Listing"
                              >
                                <EyeOff className="h-4 w-4" />
                              </button>
                            )}

                            {!isExpired ? (
                              <a 
                                href={job.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white rounded-lg transition-all border border-blue-100 dark:border-blue-900/30 hover:border-transparent hover:scale-105"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            ) : (
                              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase italic whitespace-nowrap bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded border border-gray-200/20">Expired</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recover Hidden Listings system - visible in history view only */}
      {currentView === 'history' && hiddenJobs && hiddenJobs.length > 0 && (
        <div className="mt-16 pt-10 border-t border-gray-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-gray-500 dark:text-slate-400" />
              Hidden Listings
            </h2>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              These listings have been hidden from active and history feeds. Click the eye icon to restore them.
            </p>
          </div>
          <div className="space-y-4">
            {viewMode === 'grid' ? (
              hiddenJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  isNew={false} 
                  onCompanyClick={handleCompanyClick}
                  isStarred={starredJobIds.has(job.id)}
                  isHidden={true}
                  onToggleStarred={onToggleStarred}
                  onHide={onHide}
                  onUnhide={onUnhide}
                  isExpired={!activeJobIds.has(job.id)}
                  trackedApplication={appliedJobs[job.id]}
                  onTrackClick={setEditingJob}
                />
              ))
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden opacity-90">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Role & Company</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-center">Region</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Location</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Posted</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                      {hiddenJobs.map((job) => {
                        const isStarred = starredJobIds.has(job.id);
                        const isExpired = !activeJobIds.has(job.id);
                        const companyInfo = COMPANY_DETAILS[job.company];
                        
                        return (
                          <tr key={job.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group opacity-85">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center bg-white shrink-0 shadow-sm overflow-hidden relative">
                                  {companyInfo?.customLogo ? (
                                    <img 
                                      src={companyInfo.customLogo} 
                                      alt={`${job.company} logo`}
                                      className="max-w-full max-h-full object-contain p-1"
                                    />
                                  ) : companyInfo?.logoDomain ? (
                                    <img 
                                      src={`https://logo.clearbit.com/${companyInfo.logoDomain}`} 
                                      alt={`${job.company} logo`}
                                      className="max-w-full max-h-full object-contain p-1"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).onerror = null;
                                        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(job.company) + '&background=random';
                                      }}
                                    />
                                  ) : (
                                    <Building2 className="h-5 w-5 text-gray-300 dark:text-slate-600" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-black text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">{job.title}</div>
                                  <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-tight mt-0.5" onClick={() => handleCompanyClick(job.company)}>{job.company}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm" title={job.region}>{REGION_FLAGS[job.region] || '📍'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-slate-400">
                                <MapPin className="h-3 w-3 text-gray-400 dark:text-slate-500 shrink-0" />
                                <span className="truncate max-w-[150px]">{job.location}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-slate-500 whitespace-nowrap">
                                <Clock className="h-3 w-3" />
                                {new Date(job.postedAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 shrink-0">
                                <button
                                  onClick={() => onToggleStarred(job.id)}
                                  className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 ${
                                    isStarred
                                      ? 'bg-amber-50 border-amber-250 text-amber-500 hover:bg-amber-100 hover:border-amber-350 dark:bg-amber-950/20 dark:border-amber-900/30 dark:hover:bg-amber-900/40 dark:text-amber-400'
                                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-650 hover:bg-gray-100 hover:border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 dark:hover:bg-slate-750 dark:hover:text-slate-300'
                                  }`}
                                  title={isStarred ? "Remove from Starred" : "Add to Starred"}
                                  aria-label={isStarred ? "Remove from Starred" : "Add to Starred"}
                                >
                                  <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                  onClick={() => onUnhide(job.id)}
                                  className="p-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 hover:border-blue-150 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 dark:hover:bg-blue-950/20 dark:hover:border-blue-900/30 dark:hover:text-blue-400 hover:scale-105 active:scale-95 transition-all duration-200"
                                  title="Restore / Unhide Listing"
                                  aria-label="Restore Listing"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {!isExpired ? (
                                  <a 
                                    href={job.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white rounded-lg transition-all border border-blue-100 dark:border-blue-900/30 hover:border-transparent hover:scale-105"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                ) : (
                                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase italic whitespace-nowrap bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded border border-gray-200/20">Expired</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Global Application Detail modal */}
      {editingJob && (
        <ApplicationModal
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          job={editingJob}
          existingApplication={appliedJobs[editingJob.id]}
          onSave={onSaveApplication}
          onDelete={onRemoveApplication}
        />
      )}
    </div>
  )
}
