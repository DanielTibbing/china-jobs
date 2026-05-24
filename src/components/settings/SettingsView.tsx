import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Download, Upload, Database, AlertTriangle, Check, RefreshCw, ChevronLeft, Trash2, FileJson } from 'lucide-react'
import type { Job, JobApplication } from '../../types'

interface BackupPayload {
  version: number;
  exportedAt: string;
  data: {
    seen_job_ids?: string[];
    starred_job_ids?: string[];
    hidden_job_ids?: string[];
    applied_jobs_data?: Record<string, JobApplication>;
    custom_jobs_data?: Record<string, Job>;
    theme?: string;
  };
}

export function SettingsView() {
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  
  // Import file processing state
  const [importedPayload, setImportedPayload] = useState<BackupPayload | null>(null)
  const [importFileName, setImportFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Export local storage settings
  const handleExportData = () => {
    try {
      const payload: BackupPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          seen_job_ids: JSON.parse(localStorage.getItem('seen_job_ids') || '[]'),
          starred_job_ids: JSON.parse(localStorage.getItem('starred_job_ids') || '[]'),
          hidden_job_ids: JSON.parse(localStorage.getItem('hidden_job_ids') || '[]'),
          applied_jobs_data: JSON.parse(localStorage.getItem('applied_jobs_data') || '{}'),
          custom_jobs_data: JSON.parse(localStorage.getItem('custom_jobs_data') || '{}'),
          theme: localStorage.getItem('theme') || undefined
        }
      }

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload, null, 2))}`
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', jsonString)
      
      const dateStr = new Date().toISOString().split('T')[0]
      downloadAnchor.setAttribute('download', `china-jobs-backup-${dateStr}.json`)
      
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      
      setSuccessMessage('Data backup file successfully downloaded!')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      console.error(err)
      setErrorMessage('Failed to generate export backup file.')
      setTimeout(() => setErrorMessage(''), 4000)
    }
  }

  // Handle uploaded file parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('')
    setSuccessMessage('')
    const file = e.target.files?.[0]
    if (!file) return

    setImportFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as BackupPayload
        
        // Basic schema verification
        if (!parsed || typeof parsed !== 'object' || !parsed.data) {
          throw new Error('Invalid backup schema structure.')
        }
        
        setImportedPayload(parsed)
      } catch (err) {
        console.error(err)
        setErrorMessage('Failed to parse file. Please upload a valid JSON backup file.')
        setImportedPayload(null)
        setImportFileName('')
      }
    }
    reader.readAsText(file)
  }

  // Smart Merge imported data with local storage data
  const handleMergeImport = () => {
    if (!importedPayload) return

    try {
      const imp = importedPayload.data

      // 1. Merge Set arrays (seen, starred, hidden)
      const mergeSetArray = (key: string, importedArr?: string[]) => {
        const localArr: string[] = JSON.parse(localStorage.getItem(key) || '[]')
        const merged = Array.from(new Set([...localArr, ...(importedArr || [])]))
        localStorage.setItem(key, JSON.stringify(merged))
      }
      mergeSetArray('seen_job_ids', imp.seen_job_ids)
      mergeSetArray('starred_job_ids', imp.starred_job_ids)
      mergeSetArray('hidden_job_ids', imp.hidden_job_ids)

      // 2. Merge Custom manual jobs (map merge)
      const localCustom: Record<string, Job> = JSON.parse(localStorage.getItem('custom_jobs_data') || '{}')
      const mergedCustom = { ...localCustom, ...(imp.custom_jobs_data || {}) }
      localStorage.setItem('custom_jobs_data', JSON.stringify(mergedCustom))

      // 3. Smart Merge tracked applications based on updatedAt timestamps
      const localApplied: Record<string, JobApplication> = JSON.parse(localStorage.getItem('applied_jobs_data') || '{}')
      const mergedApplied = { ...localApplied }
      const importedApplied = imp.applied_jobs_data || {}

      Object.keys(importedApplied).forEach(jobId => {
        const localApp = localApplied[jobId]
        const importedApp = importedApplied[jobId]
        
        if (!localApp) {
          // If it only exists in backup, track it
          mergedApplied[jobId] = importedApp
        } else {
          // Both exist, keep the one with the more recent updatedAt timestamp
          const localTime = new Date(localApp.updatedAt || localApp.appliedAt || 0).getTime()
          const importedTime = new Date(importedApp.updatedAt || importedApp.appliedAt || 0).getTime()
          
          if (importedTime > localTime) {
            mergedApplied[jobId] = {
              ...localApp,
              ...importedApp,
              updatedAt: importedApp.updatedAt || new Date().toISOString()
            }
          }
        }
      })
      localStorage.setItem('applied_jobs_data', JSON.stringify(mergedApplied))

      // 4. Merge Theme preferences
      if (imp.theme) {
        localStorage.setItem('theme', imp.theme)
      }

      setSuccessMessage('Data successfully merged! Reloading session...')
      setImportedPayload(null)
      setImportFileName('')
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      console.error(err)
      setErrorMessage('Failed to merge backup data into current session.')
    }
  }

  // Overwrite local storage settings completely with imported data
  const handleOverwriteImport = () => {
    if (!importedPayload) return

    try {
      const imp = importedPayload.data

      // Overwrite all local keys directly
      localStorage.setItem('seen_job_ids', JSON.stringify(imp.seen_job_ids || []))
      localStorage.setItem('starred_job_ids', JSON.stringify(imp.starred_job_ids || []))
      localStorage.setItem('hidden_job_ids', JSON.stringify(imp.hidden_job_ids || []))
      localStorage.setItem('custom_jobs_data', JSON.stringify(imp.custom_jobs_data || {}))
      localStorage.setItem('applied_jobs_data', JSON.stringify(imp.applied_jobs_data || {}))
      
      if (imp.theme) {
        localStorage.setItem('theme', imp.theme)
      }

      setSuccessMessage('Data successfully overwritten! Reloading session...')
      setImportedPayload(null)
      setImportFileName('')
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      console.error(err)
      setErrorMessage('Failed to overwrite local session.')
    }
  }

  // Clear all localStorage preferences
  const handleResetData = () => {
    try {
      localStorage.removeItem('seen_job_ids')
      localStorage.removeItem('starred_job_ids')
      localStorage.removeItem('hidden_job_ids')
      localStorage.removeItem('applied_jobs_data')
      localStorage.removeItem('custom_jobs_data')
      localStorage.removeItem('theme')
      
      setSuccessMessage('All settings and tracking info successfully cleared! Reloading...')
      setShowConfirmReset(false)
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      console.error(err)
      setErrorMessage('Failed to clear local settings.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* Navigation breadcrumb */}
      <div>
        <Link to="/" className="inline-flex items-center text-xs font-bold text-gray-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 uppercase tracking-widest transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to listings
        </Link>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
          <Settings className="h-8 w-8 text-blue-600 dark:text-blue-500" />
          Settings & Data Management
        </h2>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1.5 max-w-lg leading-relaxed">
          Manage local session data. Export tracker backups, import/merge previous tracking history, and customize preferences.
        </p>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-2xl text-sm font-bold text-green-700 dark:text-green-400 flex items-center gap-2.5 animate-pulse">
          <Check className="h-5 w-5 shrink-0 stroke-[3px]" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2.5">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Main Settings Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Backup section card */}
        <div className="bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              Export Session Backup
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
              Download your entire local workspace session details—including tracked applications, notes, recruiter contacts, starred listings, and custom manual entries—into a single file. Keep backups safe or move them to another device.
            </p>
          </div>
          <button
            onClick={handleExportData}
            className="w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-xs font-black rounded-xl text-white bg-blue-600 hover:bg-blue-750 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all hover:scale-102 active:scale-98 shadow-sm"
          >
            <Download className="mr-2 h-4 w-4 stroke-[3px]" /> Download Backup (.json)
          </button>
        </div>

        {/* Reset Danger Zone */}
        <div className="bg-white dark:bg-slate-900 border-2 border-red-50 dark:border-red-950/20 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-black text-lg text-red-650 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Danger Zone: Reset Data
            </h3>
            <p className="text-xs text-red-550 dark:text-red-400/80 leading-relaxed font-medium">
              Wipe out all settings, stars, hidden listings, history logs, and tracker records immediately. This operation completely resets the application to default states. **This action cannot be undone.**
            </p>
          </div>
          
          {showConfirmReset ? (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-red-550 uppercase text-center animate-pulse">Are you absolutely sure?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleResetData}
                  className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-750 transition-all active:scale-95"
                >
                  Yes, Erase All
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-slate-700 text-xs font-bold rounded-xl text-gray-700 dark:text-slate-305 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full inline-flex items-center justify-center px-5 py-3 border border-red-200 dark:border-red-900/30 text-xs font-black rounded-xl text-red-600 dark:text-red-400 bg-red-50/40 dark:bg-red-950/10 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all hover:scale-102 active:scale-98"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Reset All Data
            </button>
          )}
        </div>

      </div>

      {/* Import & Merging Section Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-6">
        
        <div className="space-y-2">
          <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            Restore & Smart Merge
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-405 leading-relaxed font-medium">
            Restore previously exported data backups. You can either safely **Merge** (union items and keep the most recently updated application details) or completely **Overwrite** your current workspace state.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-blue-450 dark:hover:border-blue-800 rounded-2xl p-8 text-center cursor-pointer transition-all bg-gray-50 dark:bg-slate-850/40"
             onClick={() => fileInputRef.current?.click()}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <Database className="mx-auto h-10 w-10 text-gray-400 dark:text-slate-600 mb-3" />
          {importFileName ? (
            <div className="space-y-1">
              <p className="text-sm font-black text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5">
                <FileJson className="h-4 w-4" /> {importFileName}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Click to upload a different backup file</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-black text-gray-700 dark:text-slate-300">Click to select backup file</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase">Accepts .json backup files generated on this app</p>
            </div>
          )}
        </div>

        {/* File preview and actions */}
        {importedPayload && (
          <div className="p-5 bg-blue-50/20 dark:bg-slate-850/30 border border-blue-100/10 dark:border-slate-800 rounded-2xl space-y-5 animate-scale-up">
            
            {/* Backup info preview */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                Backup Data Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-150/40 dark:border-slate-800">
                  <span className="text-[9px] font-bold block text-gray-400 uppercase leading-none">Starred</span>
                  <span className="text-lg font-black text-gray-800 dark:text-slate-200 mt-1 block">
                    {importedPayload.data.starred_job_ids?.length || 0}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-150/40 dark:border-slate-800">
                  <span className="text-[9px] font-bold block text-gray-400 uppercase leading-none">Tracked Apps</span>
                  <span className="text-lg font-black text-gray-800 dark:text-slate-200 mt-1 block">
                    {Object.keys(importedPayload.data.applied_jobs_data || {}).length}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-150/40 dark:border-slate-800">
                  <span className="text-[9px] font-bold block text-gray-400 uppercase leading-none">Custom Jobs</span>
                  <span className="text-lg font-black text-gray-800 dark:text-slate-200 mt-1 block">
                    {Object.keys(importedPayload.data.custom_jobs_data || {}).length}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-150/40 dark:border-slate-800">
                  <span className="text-[9px] font-bold block text-gray-400 uppercase leading-none">Theme</span>
                  <span className="text-lg font-black text-gray-800 dark:text-slate-200 mt-1 block uppercase">
                    {importedPayload.data.theme || 'Default'}
                  </span>
                </div>
              </div>
            </div>

            {/* Merge or Overwrite Trigger Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              
              {/* Option 1: Smart Merge */}
              <button
                onClick={handleMergeImport}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-xs font-black rounded-xl text-white bg-blue-600 hover:bg-blue-755 transition-all hover:scale-102 active:scale-95 shadow-sm"
              >
                <RefreshCw className="mr-2 h-4 w-4 stroke-[3px]" /> Smart Merge with current data
              </button>

              {/* Option 2: Overwrite All */}
              <button
                onClick={handleOverwriteImport}
                className="inline-flex items-center justify-center px-5 py-3 border border-red-200 dark:border-red-900/30 text-xs font-black rounded-xl text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 hover:bg-red-650 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all hover:scale-102 active:scale-95"
              >
                <AlertTriangle className="mr-2 h-4 w-4" /> Replace current data completely
              </button>

            </div>

          </div>
        )}

      </div>

    </div>
  )
}
