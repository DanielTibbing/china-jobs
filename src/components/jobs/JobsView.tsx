import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Briefcase, RefreshCw, LayoutGrid, List, Building2, ExternalLink, Clock, MapPin } from 'lucide-react'
import type { Job } from '../../types'
import { REGION_FLAGS } from '../../constants/regions'
import { COMPANY_DETAILS } from '../../constants/companies'
import { JobCard } from './JobCard'

interface JobsViewProps {
  loading: boolean;
  error: string | null;
  jobs: Job[];
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedCompany: string;
  setSelectedCompany: (company: string) => void;
  companiesFromJobs: string[];
  seenJobIds: Set<string>;
  currentView: 'active' | 'history';
}

export function JobsView({ 
  loading, error, jobs, selectedRegion, setSelectedRegion, 
  selectedCompany, setSelectedCompany, companiesFromJobs, seenJobIds, currentView 
}: JobsViewProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const handleCompanyClick = (company: string) => {
    setSelectedCompany(company);
    navigate('/');
    window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {Object.keys(REGION_FLAGS).map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition duration-150 ease-in-out flex items-center gap-2 ${
                selectedRegion === region
                  ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
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
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-white shadow-sm appearance-none border font-bold text-gray-700"
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

          <div className="bg-white border border-gray-200 rounded-xl p-1 flex shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20"><RefreshCw className="mx-auto h-12 w-12 text-blue-500 animate-spin mb-4" /></div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-2xl border-2 border-red-100">
            <p className="text-red-600 font-bold">{error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold">No jobs found</h3>
          </div>
        ) : viewMode === 'grid' ? (
          jobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              isNew={currentView === 'active' && !seenJobIds.has(job.id)} 
              currentView={currentView}
              onCompanyClick={handleCompanyClick}
            />
          ))
        ) : (
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role & Company</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Region</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Posted</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {jobs.map((job) => {
                    const isNew = currentView === 'active' && !seenJobIds.has(job.id);
                    const companyInfo = COMPANY_DETAILS[job.company];
                    
                    return (
                      <tr key={job.id} className={`hover:bg-blue-50/30 transition-colors group ${currentView === 'history' ? 'opacity-70 grayscale-[0.3]' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg border border-gray-100 flex items-center justify-center bg-white shrink-0 shadow-sm overflow-hidden relative">
                              {isNew && <div className="absolute top-0 left-0 w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>}
                              {companyInfo?.logoDomain ? (
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
                                <Building2 className="h-5 w-5 text-gray-300" />
                              )}
                            </div>
                            <div>
                              <div className="font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{job.title}</div>
                              <div className="text-[11px] font-bold text-gray-500 cursor-pointer hover:text-blue-600 uppercase tracking-tight mt-0.5" onClick={() => handleCompanyClick(job.company)}>{job.company}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm" title={job.region}>{REGION_FLAGS[job.region] || '📍'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                            <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{job.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            {new Date(job.postedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {currentView === 'active' ? (
                            <a 
                              href={job.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-100 hover:border-transparent"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 uppercase italic">Expired</span>
                          )}
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
  )
}
