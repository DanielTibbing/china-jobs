import { Briefcase } from 'lucide-react'

interface FooterProps {
  activeCount: number;
  removedCount: number;
}

export function Footer({ activeCount, removedCount }: FooterProps) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
               <div className="bg-gray-900 p-1.5 rounded-lg"><Briefcase className="h-4 w-4 text-white" /></div>
               <h3 className="text-sm font-black text-gray-900 tracking-wider uppercase">China-Nordic Jobs</h3>
            </div>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed mx-auto md:mx-0">
              A community-driven job board tracking technical leadership and engineering roles across the world's most dynamic tech hubs.
            </p>
          </div>
          <div className="md:text-right flex flex-col items-center md:items-end">
            <h3 className="text-sm font-black text-gray-900 tracking-wider uppercase mb-4">Dashboard</h3>
            <div className="flex flex-wrap justify-center md:justify-end gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-100">{activeCount} ACTIVE</span>
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-orange-50 text-orange-700 border border-orange-100">{removedCount} REMOVED</span>
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-gray-50 text-gray-600 border border-gray-100">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
