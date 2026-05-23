import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, List, ExternalLink, Building2, MapPin } from 'lucide-react'
import type { Job } from '../../types'
import { COMPANY_DETAILS, TRACKED_COMPANIES } from '../../constants/companies'
import { REGION_FLAGS } from '../../constants/regions'
import { CompanyCard } from './CompanyCard'

interface CompaniesViewProps {
  searchTerm: string;
  activeJobs: Job[];
  setSelectedCompany: (company: string) => void;
}

export function CompaniesView({ searchTerm, activeJobs, setSelectedCompany }: CompaniesViewProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const handleViewRoles = (name: string) => {
    setSelectedCompany(name);
    navigate('/');
    window.scrollTo(0, 0);
  };

  const filteredCompanies = TRACKED_COMPANIES
    .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="sticky top-[184px] md:top-[136px] z-10 bg-gray-50/95 dark:bg-slate-950/95 backdrop-blur-sm py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-all flex justify-end">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-1 flex shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'}`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'}`}
            title="Table View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCompanies.map((name) => {
            const company = COMPANY_DETAILS[name] || {
              name,
              description: 'Technology company with global operations.',
              regions: [],
              offices: ['Global'],
              careerUrl: '#',
              logoDomain: ''
            };
            const activeCount = activeJobs.filter(j => j.company === name).length;

            return (
              <CompanyCard 
                key={name}
                company={company}
                activeCount={activeCount}
                onViewRoles={handleViewRoles}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Company</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Active Regions</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Main Offices</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-center">Roles</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {filteredCompanies.map((name) => {
                  const company = COMPANY_DETAILS[name] || {
                    name,
                    description: 'Technology company with global operations.',
                    regions: [],
                    offices: ['Global'],
                    careerUrl: '#',
                    logoDomain: ''
                  };
                  const activeCount = activeJobs.filter(j => j.company === name).length;

                  return (
                    <tr key={name} className="hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center bg-white shrink-0 shadow-sm overflow-hidden">
                            {company.logoDomain ? (
                              <img 
                                src={`https://logo.clearbit.com/${company.logoDomain}`} 
                                alt={`${name} logo`}
                                className="max-w-full max-h-full object-contain p-1"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).onerror = null;
                                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random';
                                }}
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-gray-300 dark:text-slate-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-black text-gray-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{name}</div>
                            <div className="text-[10px] text-gray-400 dark:text-slate-500 truncate max-w-[200px]">{company.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {company.regions.map(r => (
                            <span key={r} className="text-xs" title={r}>{REGION_FLAGS[r]}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-slate-400">
                          <MapPin className="h-3 w-3 text-gray-400 dark:text-slate-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{company.offices.join(', ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {activeCount > 0 ? (
                          <button 
                            onClick={() => handleViewRoles(name)}
                            className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                          >
                            {activeCount} active
                          </button>
                        ) : (
                          <span className="text-gray-300 dark:text-slate-700 text-[10px] font-bold uppercase">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a 
                          href={company.careerUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex p-2 text-gray-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-xl transition-all"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
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
  )
}
