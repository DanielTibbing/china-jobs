import { Building2, ExternalLink, Globe, MapPin, Search } from 'lucide-react'
import type { CompanyInfo } from '../../types'
import { REGION_FLAGS } from '../../constants/regions'

interface CompanyCardProps {
  company: CompanyInfo;
  activeCount: number;
  onViewRoles: (name: string) => void;
}

export function CompanyCard({ company, activeCount, onViewRoles }: CompanyCardProps) {
  return (
    <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm hover:border-purple-100 transition-all duration-200 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div className="bg-white border border-gray-100 p-2 rounded-2xl w-16 h-16 flex items-center justify-center overflow-hidden shadow-sm text-gray-400">
          {company.logoDomain ? (
            <img 
              src={`https://logo.clearbit.com/${company.logoDomain}`} 
              alt={`${company.name} logo`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(company.name) + '&background=random';
              }}
            />
          ) : (
            <Building2 className="h-8 w-8" />
          )}
        </div>
        <a href={company.careerUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 transition-colors p-2 hover:bg-purple-50 rounded-xl">
          <ExternalLink className="h-5 w-5" />
        </a>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-2xl font-black text-gray-900">{company.name}</h2>
        {activeCount > 0 && (
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
            {activeCount} active roles
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
        {company.description}
      </p>
      
      <div className="space-y-4 pt-4 border-t border-gray-50 mt-auto">
        <div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
             <Globe className="h-3 w-3" />
             Active Regions
          </h3>
          <div className="flex flex-wrap gap-2">
            {company.regions.length > 0 ? company.regions.map(r => (
              <span key={r} className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold border border-gray-100">
                <span>{REGION_FLAGS[r] || '📍'}</span>{r}
              </span>
            )) : <span className="text-xs text-gray-400 italic">No specific regions tracked</span>}
          </div>
        </div>
        
        <div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
             <MapPin className="h-3 w-3" />
             Office Locations
          </h3>
          <p className="text-xs text-gray-600 font-medium leading-relaxed">
            {company.offices.join(', ')}
          </p>
        </div>
      </div>
      
      <button 
        onClick={() => onViewRoles(company.name)}
        disabled={activeCount === 0}
        className={`mt-8 w-full py-3 rounded-2xl text-sm font-black transition-colors flex items-center justify-center gap-2 ${
          activeCount > 0 
          ? 'bg-purple-50 hover:bg-purple-100 text-purple-700' 
          : 'bg-gray-50 text-gray-300 cursor-not-allowed'
        }`}
      >
        <Search className="h-4 w-4" />
        {activeCount > 0 ? `View Open Roles` : 'No open roles matching filters'}
      </button>
    </div>
  )
}
