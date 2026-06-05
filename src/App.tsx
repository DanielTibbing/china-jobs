import { useState, useMemo } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { Job } from './types'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { JobsView } from './components/jobs/JobsView'
import { CompaniesView } from './components/companies/CompaniesView'
import { ApplicationsView } from './components/applications/ApplicationsView'
import { SettingsView } from './components/settings/SettingsView'
import { useJobs } from './hooks/useJobs'
import { useTheme } from './hooks/useTheme'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [selectedCompany, setSelectedCompany] = useState('All')
  const [onlyNew, setOnlyNew] = useState(false)

  const { isDarkMode, setIsDarkMode } = useTheme()
  const {
    loading,
    error,
    activeJobs,
    removedJobs,
    seenJobIds,
    starredJobIds,
    hiddenJobIds,
    starredJobs,
    hiddenJobs,
    starredCount,
    activeJobIds,
    appliedJobs,
    allEverSeenJobsList,
    toggleStarred,
    hideJob,
    unhideJob,
    saveJobApplication,
    removeJobApplication,
    addCustomJob
  } = useJobs()

  const companiesFromJobs = useMemo(() => {
    const unique = new Set(activeJobs.map(job => job.company))
    return ['All', ...Array.from(unique).sort()]
  }, [activeJobs])

  const filterSource = (source: Job[], excludeHidden = true) => {
    return source.filter(job => {
      if (excludeHidden && hiddenJobIds.has(job.id)) return false
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRegion = selectedRegion === 'All' || job.region === selectedRegion
      const matchesCompany = selectedCompany === 'All' || job.company === selectedCompany
      const matchesNew = !onlyNew || !seenJobIds.has(job.id)
      return matchesSearch && matchesRegion && matchesCompany && matchesNew
    })
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans transition-colors duration-300">
        <Header 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          setSelectedCompany={setSelectedCompany}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          starredCount={starredCount}
          appliedCount={Object.keys(appliedJobs).length}
        />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={
              <JobsView 
                loading={loading}
                error={error}
                jobs={filterSource(activeJobs)}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                selectedCompany={selectedCompany}
                setSelectedCompany={setSelectedCompany}
                onlyNew={onlyNew}
                setOnlyNew={setOnlyNew}
                companiesFromJobs={companiesFromJobs}
                seenJobIds={seenJobIds}
                currentView="active"
                starredJobIds={starredJobIds}
                hiddenJobIds={hiddenJobIds}
                activeJobIds={activeJobIds}
                onToggleStarred={toggleStarred}
                onHide={hideJob}
                onUnhide={unhideJob}
                appliedJobs={appliedJobs}
                onSaveApplication={saveJobApplication}
                onRemoveApplication={removeJobApplication}
              />
            } />
            <Route path="/starred" element={
              <JobsView 
                loading={loading}
                error={error}
                jobs={filterSource(starredJobs)}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                selectedCompany={selectedCompany}
                setSelectedCompany={setSelectedCompany}
                onlyNew={onlyNew}
                setOnlyNew={setOnlyNew}
                companiesFromJobs={companiesFromJobs}
                seenJobIds={seenJobIds}
                currentView="starred"
                starredJobIds={starredJobIds}
                hiddenJobIds={hiddenJobIds}
                activeJobIds={activeJobIds}
                onToggleStarred={toggleStarred}
                onHide={hideJob}
                onUnhide={unhideJob}
                appliedJobs={appliedJobs}
                onSaveApplication={saveJobApplication}
                onRemoveApplication={removeJobApplication}
              />
            } />
            <Route path="/history" element={
              <JobsView 
                loading={loading}
                error={error}
                jobs={filterSource(removedJobs)}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                selectedCompany={selectedCompany}
                setSelectedCompany={setSelectedCompany}
                onlyNew={onlyNew}
                setOnlyNew={setOnlyNew}
                companiesFromJobs={companiesFromJobs}
                seenJobIds={seenJobIds}
                currentView="history"
                starredJobIds={starredJobIds}
                hiddenJobIds={hiddenJobIds}
                hiddenJobs={filterSource(hiddenJobs, false)}
                activeJobIds={activeJobIds}
                onToggleStarred={toggleStarred}
                onHide={hideJob}
                onUnhide={unhideJob}
                appliedJobs={appliedJobs}
                onSaveApplication={saveJobApplication}
                onRemoveApplication={removeJobApplication}
              />
            } />
            <Route path="/companies" element={
              <CompaniesView 
                searchTerm={searchTerm}
                activeJobs={activeJobs}
                setSelectedCompany={setSelectedCompany}
              />
            } />
            <Route path="/applications" element={
              <ApplicationsView 
                allJobs={allEverSeenJobsList}
                appliedJobs={appliedJobs}
                onSaveApplication={saveJobApplication}
                onRemoveApplication={removeJobApplication}
                onAddCustomJob={addCustomJob}
              />
            } />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer 
          activeCount={activeJobs.filter(j => !hiddenJobIds.has(j.id)).length} 
          removedCount={removedJobs.filter(j => !hiddenJobIds.has(j.id)).length} 
          starredCount={starredCount}
          appliedCount={Object.keys(appliedJobs).length}
        />
      </div>
    </HashRouter>
  )
}

export default App
