import { Briefcase } from 'lucide-react'

interface FooterProps {
  activeCount: number;
  removedCount: number;
  starredCount: number;
}

export function Footer({ activeCount, removedCount, starredCount }: FooterProps) {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-20 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
               <div className="bg-gray-900 dark:bg-blue-600 p-1.5 rounded-lg"><Briefcase className="h-4 w-4 text-white" /></div>
               <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-wider uppercase">China-Nordic Jobs</h3>
            </div>
            <p className="text-gray-500 dark:text-slate-400 text-sm max-w-sm leading-relaxed mx-auto md:mx-0">
              A community-driven job board tracking technical leadership and engineering roles across the world's most dynamic tech hubs.
            </p>
          </div>
          <div className="md:text-right flex flex-col items-center md:items-end">
            <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-wider uppercase mb-4">Dashboard</h3>
            <div className="flex flex-wrap justify-center md:justify-end gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">{activeCount} ACTIVE</span>
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">{starredCount} STARRED</span>
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">{removedCount} REMOVED</span>
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-100 dark:border-slate-700">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
