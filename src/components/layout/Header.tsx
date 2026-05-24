import { Link, useLocation } from 'react-router-dom'
import { Search, Briefcase, History, Building2, Sun, Moon, Star, CheckSquare, Settings } from 'lucide-react'

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setSelectedCompany: (company: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  starredCount: number;
  appliedCount: number;
}


export function Header({ searchTerm, setSearchTerm, setSelectedCompany, isDarkMode, setIsDarkMode, starredCount, appliedCount }: HeaderProps) {
  const { pathname } = useLocation();
  
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" onClick={() => setSelectedCompany('All')} className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                China-Nordic Jobs
              </h1>
            </Link>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all md:hidden border border-gray-200 dark:border-slate-700"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link
              to="/settings"
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all md:hidden border border-gray-200 dark:border-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
              title="Data Settings"
              aria-label="Data Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
          
          <div className="flex flex-1 max-w-md gap-2 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl leading-5 bg-gray-50 dark:bg-slate-800 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder={pathname === '/companies' ? "Search companies..." : "Search roles..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hidden md:flex p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all border border-gray-200 dark:border-slate-700"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link
              to="/settings"
              className="hidden md:flex p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all border border-gray-200 dark:border-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
              title="Data Settings"
              aria-label="Data Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-6 border-b border-gray-100 dark:border-slate-800">
          <Link
            to="/"
            onClick={() => setSelectedCompany('All')}
            className={`px-4 py-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              pathname === '/' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
              : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Active Jobs
          </Link>
          <Link
            to="/starred"
            onClick={() => setSelectedCompany('All')}
            className={`px-4 py-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 relative ${
              pathname === '/starred' 
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 dark:border-amber-400' 
              : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
            }`}
          >
            <Star className={`h-4 w-4 ${pathname === '/starred' ? 'fill-current text-amber-500' : ''}`} />
            <span>Starred</span>
            {starredCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 ml-1 text-[10px] font-black leading-none text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40 rounded-full border border-amber-200 dark:border-amber-900/30">
                {starredCount}
              </span>
            )}
          </Link>
          <Link
            to="/history"
            onClick={() => setSelectedCompany('All')}
            className={`px-4 py-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              pathname === '/history' 
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 dark:border-orange-400' 
              : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
            }`}
          >
            <History className="h-4 w-4" />
            History
          </Link>
          <Link
            to="/companies"
            className={`px-4 py-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              pathname === '/companies' 
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400' 
              : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Companies
          </Link>
          <Link
            to="/applications"
            className={`px-4 py-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 relative ${
              pathname === '/applications' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
              : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>Tracked Apps</span>
            {appliedCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 ml-1 text-[10px] font-black leading-none text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-950/40 rounded-full border border-blue-200 dark:border-blue-900/30 animate-fade-in">
                {appliedCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
