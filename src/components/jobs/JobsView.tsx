import { useNavigate } from 'react-router-dom'
import { Filter, Briefcase, RefreshCw } from 'lucide-react'
import type { Job } from '../../types'
import { REGION_FLAGS } from '../../constants/regions'
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

  const handleCompanyClick = (company: string) => {
    setSelectedCompany(company);
    navigate('/');
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
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

        <div className="relative w-full md:w-64">
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
        ) : (
          jobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              isNew={currentView === 'active' && !seenJobIds.has(job.id)} 
              currentView={currentView}
              onCompanyClick={handleCompanyClick}
            />
          ))
        )}
      </div>
    </>
  )
}
