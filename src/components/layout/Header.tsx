import { Link, useLocation } from 'react-router-dom'
import { Search, Briefcase, History, Building2 } from 'lucide-react'

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setSelectedCompany: (company: string) => void;
}

export function Header({ searchTerm, setSearchTerm, setSelectedCompany }: HeaderProps) {
  const { pathname } = useLocation();
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Link to="/" onClick={() => setSelectedCompany('All')} className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              China-Nordic Jobs
            </h1>
          </Link>
          
          <div className="flex flex-1 max-w-md gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder={pathname === '/companies' ? "Search companies..." : "Search roles..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-6 border-b border-gray-100">
          <Link
            to="/"
            onClick={() => setSelectedCompany('All')}
            className={`px-4 py-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              pathname === '/' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Active Jobs
          </Link>
          <Link
            to="/history"
            onClick={() => setSelectedCompany('All')}
            className={`px-4 py-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              pathname === '/history' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <History className="h-4 w-4" />
            History
          </Link>
          <Link
            to="/companies"
            className={`px-4 py-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              pathname === '/companies' 
              ? 'border-purple-600 text-purple-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Companies
          </Link>
        </div>
      </div>
    </header>
  )
}
