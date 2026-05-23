import { useState, useEffect, useMemo } from 'react'
import { Search, MapPin, Building2, Briefcase, ExternalLink, RefreshCw, Filter, History, Clock, Globe } from 'lucide-react'

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  link: string;
  postedAt: string;
  region: string;
}

interface CompanyInfo {
  name: string;
  description: string;
  regions: string[];
  offices: string[];
  careerUrl: string;
}

const COMPANY_DETAILS: Record<string, CompanyInfo> = {
  'Airwallex': {
    name: 'Airwallex',
    description: 'A global financial platform for modern businesses, offering cross-border payments and financial infrastructure.',
    regions: ['China', 'Hong Kong', 'Singapore'],
    offices: ['Shanghai', 'Shenzhen', 'Hong Kong', 'Singapore', 'Melbourne', 'London'],
    careerUrl: 'https://careers.airwallex.com/'
  },
  'Grab': {
    name: 'Grab',
    description: 'Southeast Asia\'s leading super-app, providing delivery, mobility, and digital financial services.',
    regions: ['Singapore', 'China'],
    offices: ['Singapore', 'Beijing', 'Seattle', 'Bangalore'],
    careerUrl: 'https://grab.careers/'
  },
  'Checkout.com': {
    name: 'Checkout.com',
    description: 'A global payments solution provider that helps businesses and their communities thrive in the digital economy.',
    regions: ['Hong Kong', 'Singapore'],
    offices: ['Hong Kong', 'Singapore', 'London', 'Dubai'],
    careerUrl: 'https://www.checkout.com/careers'
  },
  'Canva': {
    name: 'Canva',
    description: 'An online design and visual communication platform on a mission to empower everyone in the world to design anything.',
    regions: ['China'],
    offices: ['Beijing', 'Sydney', 'Manila', 'London'],
    careerUrl: 'https://www.canva.com/careers/'
  },
  'Roblox': {
    name: 'Roblox',
    description: 'An online game platform and storefront system that allows users to program games and play games created by other users.',
    regions: ['China'],
    offices: ['Shenzhen', 'San Mateo'],
    careerUrl: 'https://corp.roblox.com/careers/'
  },
  'Unity': {
    name: 'Unity',
    description: 'The world\'s leading platform for creating and operating interactive, real-time 3D content.',
    regions: ['China', 'Singapore', 'Sweden'],
    offices: ['Shanghai', 'Beijing', 'Singapore', 'Stockholm', 'San Francisco'],
    careerUrl: 'https://careers.unity.com/'
  },
  'ByteDance': {
    name: 'ByteDance',
    description: 'The technology company operating a range of content platforms, including TikTok and Douyin.',
    regions: ['China', 'Singapore'],
    offices: ['Beijing', 'Shanghai', 'Shenzhen', 'Singapore', 'Los Angeles'],
    careerUrl: 'https://jobs.bytedance.com/'
  },
  'TikTok': {
    name: 'TikTok',
    description: 'The leading destination for short-form mobile video, on a mission to inspire creativity and bring joy.',
    regions: ['China', 'Singapore'],
    offices: ['Singapore', 'Beijing', 'Los Angeles', 'London'],
    careerUrl: 'https://careers.tiktok.com/'
  },
  'Agoda': {
    name: 'Agoda',
    description: 'One of the world\'s fastest-growing online travel booking platforms.',
    regions: ['Singapore', 'China'],
    offices: ['Singapore', 'Bangkok', 'Shanghai', 'Budapest'],
    careerUrl: 'https://careers.agoda.com/'
  },
  'Skyscanner': {
    name: 'Skyscanner',
    description: 'A leading global travel search site, providing instant online comparisons for flight prices.',
    regions: ['China', 'Singapore'],
    offices: ['Shenzhen', 'Singapore', 'Edinburgh', 'London'],
    careerUrl: 'https://www.skyscanner.net/jobs/'
  },
  'Scopely': {
    name: 'Scopely',
    description: 'A leading interactive entertainment and mobile games company.',
    regions: ['China'],
    offices: ['Shanghai', 'Culver City', 'Barcelona', 'Dublin'],
    careerUrl: 'https://scopely.com/en/careers'
  },
  'Marshall': {
    name: 'Marshall',
    description: 'Marshall Group (formerly Zound Industries) is the audio, tech, and design powerhouse uniting musicians and music lovers.',
    regions: ['Sweden', 'China'],
    offices: ['Stockholm', 'Shenzhen', 'London', 'Milton Keynes'],
    careerUrl: 'https://careers.marshall.com/'
  },
  'Duolingo': {
    name: 'Duolingo',
    description: 'The world\'s most popular way to learn a language online.',
    regions: ['China'],
    offices: ['Beijing', 'Pittsburgh', 'New York', 'Seattle'],
    careerUrl: 'https://careers.duolingo.com/'
  },
  'Liftoff': {
    name: 'Liftoff',
    description: 'A complete mobile app marketing platform that helps advertisers, publishers, and developers grow.',
    regions: ['Singapore'],
    offices: ['Singapore', 'Redwood City', 'London'],
    careerUrl: 'https://liftoff.io/careers/'
  },
  'Riot Games': {
    name: 'Riot Games',
    description: 'A player-focused video game developer, publisher, and esports tournament organizer.',
    regions: ['China', 'Singapore', 'Hong Kong'],
    offices: ['Shanghai', 'Singapore', 'Hong Kong', 'Los Angeles'],
    careerUrl: 'https://www.riotgames.com/en/work-with-us'
  },
  'Nex': {
    name: 'Nex',
    description: 'A motion technology company that turns screen time into active time.',
    regions: ['Hong Kong'],
    offices: ['Hong Kong', 'San Francisco'],
    careerUrl: 'https://www.nex.inc/careers'
  },
  'Casetify': {
    name: 'Casetify',
    description: 'A global lifestyle brand and the fastest-growing tech accessories platform.',
    regions: ['Hong Kong'],
    offices: ['Hong Kong', 'Los Angeles', 'Tokyo'],
    careerUrl: 'https://www.casetify.com/careers'
  },
  'Adyen': {
    name: 'Adyen',
    description: 'A financial technology platform that provides end-to-end payments capabilities and data-driven insights.',
    regions: ['Singapore', 'China', 'Hong Kong', 'Sweden'],
    offices: ['Singapore', 'Shanghai', 'Hong Kong', 'Stockholm', 'Amsterdam'],
    careerUrl: 'https://www.adyen.com/careers'
  },
  'EF': {
    name: 'EF',
    description: 'A global leader in international education, focusing on language, academics, and cultural experience.',
    regions: ['China', 'Hong Kong', 'Singapore', 'Sweden'],
    offices: ['Shanghai', 'Hong Kong', 'Singapore', 'Stockholm', 'Lucerne', 'London'],
    careerUrl: 'https://www.ef.com/careers'
  },
  'Scania': {
    name: 'Scania',
    description: 'A world-leading provider of transport solutions, including trucks and buses for heavy transport applications.',
    regions: ['Sweden', 'China'],
    offices: ['Södertälje', 'Beijing', 'Shanghai'],
    careerUrl: 'https://www.scania.com/group/en/home/career.html'
  },
  'Lego Group': {
    name: 'Lego Group',
    description: 'One of the world\'s leading manufacturers of play materials, famous for the LEGO brick.',
    regions: ['China', 'Singapore', 'Sweden'],
    offices: ['Shanghai', 'Singapore', 'Billund', 'Enköping'],
    careerUrl: 'https://www.lego.com/en-us/aboutus/careers'
  },
  'Spotify': {
    name: 'Spotify',
    description: 'The world\'s most popular audio streaming subscription service.',
    regions: ['Sweden', 'Singapore'],
    offices: ['Stockholm', 'Singapore', 'New York', 'London'],
    careerUrl: 'https://www.lifeatspotify.com/'
  },
  'Epic Games': {
    name: 'Epic Games',
    description: 'An interactive entertainment company and provider of 3D engine technology, creator of Fortnite and Unreal Engine.',
    regions: ['China', 'Singapore'],
    offices: ['Shanghai', 'Singapore', 'Cary'],
    careerUrl: 'https://www.epicgames.com/site/en-US/careers'
  },
  'NetEase Games': {
    name: 'NetEase Games',
    description: 'A leading global developer and publisher of video game IP.',
    regions: ['China'],
    offices: ['Hangzhou', 'Guangzhou', 'Tokyo', 'Montreal'],
    careerUrl: 'https://www.neteasegames.com/careers/'
  },
  'Supercell': {
    name: 'Supercell',
    description: 'A mobile game developer based in Helsinki, Finland, with offices in San Francisco, Seoul and Shanghai.',
    regions: ['China'],
    offices: ['Helsinki', 'Shanghai', 'San Francisco', 'Seoul'],
    careerUrl: 'https://supercell.com/en/careers/'
  },
  'Dramabox': {
    name: 'Dramabox',
    description: 'A leading short-form drama platform providing localized content globally.',
    regions: ['China'],
    offices: ['Beijing', 'Shanghai'],
    careerUrl: 'https://www.storymatrix.com/'
  },
  'Wise': {
    name: 'Wise',
    description: 'A global technology company building the best way to move money around the world.',
    regions: ['Singapore', 'Hong Kong'],
    offices: ['Singapore', 'Hong Kong', 'London', 'Tallinn'],
    careerUrl: 'https://wise.jobs/'
  },
  'Ascenda': {
    name: 'Ascenda',
    description: 'A global leader in innovative loyalty solutions and rewards technology.',
    regions: ['Singapore'],
    offices: ['Singapore'],
    careerUrl: 'https://ascendaloyalty.com/careers/'
  },
  'Shopline': {
    name: 'Shopline',
    description: 'One of Asia\'s largest e-commerce platform providers.',
    regions: ['Hong Kong', 'Singapore', 'China'],
    offices: ['Hong Kong', 'Singapore', 'Shenzhen', 'Taipei'],
    careerUrl: 'https://shopline.com/about/careers'
  },
  'Youtrip': {
    name: 'Youtrip',
    description: 'A leading multi-currency travel wallet in Southeast Asia.',
    regions: ['Singapore'],
    offices: ['Singapore', 'Bangkok'],
    careerUrl: 'https://www.youtrip.co/careers/'
  },
  'Ubisoft': {
    name: 'Ubisoft',
    description: 'A leading creator, publisher and distributor of interactive entertainment and services.',
    regions: ['China', 'Singapore'],
    offices: ['Shanghai', 'Singapore', 'Paris', 'Montreal'],
    careerUrl: 'https://www.ubisoft.com/en-us/company/careers'
  },
  'Payoneer': {
    name: 'Payoneer',
    description: 'The world\'s go-to partner for digital commerce, enabling any business to go global.',
    regions: ['Hong Kong', 'Singapore', 'China'],
    offices: ['Hong Kong', 'Singapore', 'Shanghai', 'New York'],
    careerUrl: 'https://careers.payoneer.com/'
  },
  'Traveloka': {
    name: 'Traveloka',
    description: 'Southeast Asia\'s leading travel and lifestyle platform, providing a wide range of services including flight and hotel bookings.',
    regions: ['China', 'Singapore'],
    offices: ['Shanghai', 'Shenzhen', 'Singapore', 'Jakarta', 'Bangkok'],
    careerUrl: 'https://careers.traveloka.com/jobs'
  },
  'Moonton': {
    name: 'Moonton',
    description: 'A global video game developer and publisher, creator of Mobile Legends: Bang Bang.',
    regions: ['China', 'Singapore'],
    offices: ['Shanghai', 'Singapore'],
    careerUrl: 'https://www.moonton.com/careers'
  },
  'On Running': {
    name: 'On Running',
    description: 'A Swiss athletic shoe and performance sportswear company.',
    regions: ['China', 'Singapore'],
    offices: ['Shanghai', 'Singapore', 'Zurich', 'Berlin', 'London'],
    careerUrl: 'https://culture.on.com/jobs/'
  },
  'Razer': {
    name: 'Razer',
    description: 'The world\'s leading lifestyle brand for gamers, providing hardware, software, and services.',
    regions: ['Singapore', 'China', 'Hong Kong'],
    offices: ['Singapore', 'Irvine', 'Shanghai', 'Hamburg'],
    careerUrl: 'https://www.razer.com/careers'
  },
  'Klook': {
    name: 'Klook',
    description: 'A leading travel and leisure e-commerce platform.',
    regions: ['Hong Kong', 'Singapore', 'China'],
    offices: ['Hong Kong', 'Singapore', 'Shenzhen', 'Bangkok'],
    careerUrl: 'https://www.klook.com/en-US/careers/'
  },
  'ABB': {
    name: 'ABB',
    description: 'A leading global technology company that energizes the transformation of society and industry to achieve a more productive, sustainable future.',
    regions: ['Sweden', 'China', 'Singapore'],
    offices: ['Västerås', 'Zürich', 'Shanghai', 'Singapore'],
    careerUrl: 'https://careers.abb/global/en'
  },
  'Axis Communications': {
    name: 'Axis Communications',
    description: 'Axis Communications (subsidiary of Canon) is the market leader in network video.',
    regions: ['Sweden', 'China', 'Singapore', 'Hong Kong'],
    offices: ['Lund', 'Shanghai', 'Singapore', 'Hong Kong'],
    careerUrl: 'https://www.axis.com/about-axis/careers'
  },
  'Electrolux': {
    name: 'Electrolux',
    description: 'A global leader in household appliances, providing innovative products for consumers and professional users.',
    regions: ['Sweden', 'China', 'Singapore'],
    offices: ['Stockholm', 'Shanghai', 'Singapore'],
    careerUrl: 'https://career.electroluxgroup.com/'
  },
  'Booking.com': {
    name: 'Booking.com',
    description: 'One of the world\'s leading digital travel companies, making it easier for everyone to experience the world.',
    regions: ['China', 'Singapore'],
    offices: ['Shanghai', 'Singapore', 'Amsterdam'],
    careerUrl: 'https://jobs.booking.com/'
  },
  'Atlas Copco': {
    name: 'Atlas Copco',
    description: 'A world-leading provider of sustainable productivity solutions, including compressors, vacuum solutions and industrial tools.',
    regions: ['Sweden', 'China', 'Singapore'],
    offices: ['Stockholm', 'Nacka', 'Shanghai', 'Singapore'],
    careerUrl: 'https://www.atlascopcogroup.com/en/careers/jobs'
  },
  'Volvo Group': {
    name: 'Volvo Group',
    description: 'A world-leading provider of transport solutions, including trucks, buses, engines, construction equipment and financial services.',
    regions: ['Sweden', 'China', 'Singapore'],
    offices: ['Gothenburg', 'Stockholm', 'Shanghai', 'Singapore'],
    careerUrl: 'https://volvogroup.com/en/careers.html'
  },
  'Assa Abloy': {
    name: 'Assa Abloy',
    description: 'The global leader in access solutions, providing locks, doors, gates and entrance automation.',
    regions: ['Sweden', 'China', 'Singapore', 'Hong Kong'],
    offices: ['Stockholm', 'Shanghai', 'Singapore', 'Hong Kong'],
    careerUrl: 'https://www.assaabloy.com/group/en/career'
  }
};

// All companies tracked in the scraper
const TRACKED_COMPANIES = [
  'Airwallex', 'Grab', 'Checkout.com', 'Canva', 'Roblox', 'Unity', 'ByteDance', 'TikTok', 
  'Agoda', 'Skyscanner', 'Scopely', 'Marshall', 'Duolingo', 'Liftoff', 'Riot Games', 
  'Nex', 'Casetify', 'Epic Games', 'Adyen', 'NetEase Games', 'Supercell', 'Dramabox', 
  'Wise', 'Spotify', 'Ascenda', 'Shopline', 'Youtrip', 'Ubisoft', 'Payoneer', 'Moonton',
  'EF', 'Scania', 'Lego Group', 'On Running', 'Traveloka', 'Razer', 'Klook', 'ABB', 
  'Axis Communications', 'Electrolux', 'Booking.com', 'Atlas Copco', 'Assa Abloy', 'Volvo Group'
];

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [selectedCompany, setSelectedCompany] = useState('All')
  const [activeJobs, setActiveJobs] = useState<Job[]>([])
  const [removedJobs, setRemovedJobs] = useState<Job[]>([])
  const [seenJobIds, setSeenJobIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'active' | 'history' | 'companies'>('active')

  useEffect(() => {
    const savedSeen = localStorage.getItem('seen_job_ids')
    const savedAllJobs = localStorage.getItem('all_ever_seen_jobs')
    
    const initialSeen = savedSeen ? new Set<string>(JSON.parse(savedSeen) as string[]) : new Set<string>()
    const allEverSeen: Record<string, Job> = savedAllJobs ? JSON.parse(savedAllJobs) : {}
    
    setSeenJobIds(initialSeen)

    fetch('jobs.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch jobs')
        return res.json()
      })
      .then((data: Job[]) => {
        setActiveJobs(data)
        const currentIds = new Set(data.map(j => j.id))
        const removed = Object.values(allEverSeen).filter(j => !currentIds.has(j.id))
        setRemovedJobs(removed.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()))

        const updatedAllEverSeen = { ...allEverSeen }
        data.forEach(job => {
          updatedAllEverSeen[job.id] = job
        })
        localStorage.setItem('all_ever_seen_jobs', JSON.stringify(updatedAllEverSeen))

        setTimeout(() => {
          const newSeenIds = new Set([...Array.from(initialSeen), ...data.map(j => j.id)])
          localStorage.setItem('seen_job_ids', JSON.stringify(Array.from(newSeenIds)))
        }, 2000)

        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Could not load jobs. Please try again later.')
        setLoading(false)
      })
  }, [])

  const companiesFromJobs = useMemo(() => {
    const unique = new Set(activeJobs.map(job => job.company))
    return ['All', ...Array.from(unique).sort()]
  }, [activeJobs])

  const filteredJobs = useMemo(() => {
    const source = currentView === 'active' ? activeJobs : removedJobs
    if (currentView === 'companies') return []
    return source.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRegion = selectedRegion === 'All' || job.region === selectedRegion
      const matchesCompany = selectedCompany === 'All' || job.company === selectedCompany
      return matchesSearch && matchesRegion && matchesCompany
    })
  }, [activeJobs, removedJobs, currentView, searchTerm, selectedRegion, selectedCompany])

  const REGION_FLAGS: Record<string, string> = {
    'China': '🇨🇳',
    'Hong Kong': '🇭🇰',
    'Singapore': '🇸🇬',
    'Sweden': '🇸🇪',
    'All': '🌎'
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight cursor-pointer" onClick={() => setCurrentView('active')}>
                  China-Nordic Jobs
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-1 italic">Tracking global tech roles for the China-Nordic corridor</p>
            </div>
            
            <div className="flex flex-1 max-w-md gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder={currentView === 'companies' ? "Search companies..." : "Search roles..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-6 border-b border-gray-100">
            <button
              onClick={() => {setCurrentView('active'); setSelectedCompany('All')}}
              className={`px-4 py-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
                currentView === 'active' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Active Jobs
            </button>
            <button
              onClick={() => {setCurrentView('history'); setSelectedCompany('All')}}
              className={`px-4 py-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
                currentView === 'history' 
                ? 'border-orange-500 text-orange-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <History className="h-4 w-4" />
              History
            </button>
            <button
              onClick={() => setCurrentView('companies')}
              className={`px-4 py-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
                currentView === 'companies' 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Companies
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView !== 'companies' ? (
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
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold">No jobs found</h3>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isNew = currentView === 'active' && !seenJobIds.has(job.id);
                  return (
                    <div key={job.id} className={`bg-white p-6 rounded-2xl border-2 transition-all duration-200 group relative overflow-hidden ${currentView === 'history' ? 'border-gray-100 opacity-80 grayscale-[0.5]' : 'border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-md'}`}>
                      {isNew && <div className="absolute top-0 left-0"><div className="bg-blue-600 text-white text-[10px] font-black uppercase px-6 py-1 -rotate-45 -translate-x-6 translate-y-1 shadow-sm">New</div></div>}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <h2 className={`text-xl font-black leading-tight ${currentView === 'history' ? 'text-gray-700' : 'text-gray-900 group-hover:text-blue-600 transition-colors'}`}>{job.title}</h2>
                          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500 mt-4">
                            <div className="flex items-center font-bold text-gray-700 cursor-pointer hover:text-blue-600" onClick={() => {setSelectedCompany(job.company); setCurrentView('active'); window.scrollTo(0,0)}}>
                              <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                              {job.company}
                            </div>
                            <div className="flex items-center font-medium"><MapPin className="h-4 w-4 mr-2 text-gray-400" />{job.location}</div>
                            <div className="flex items-center text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-lg text-[11px] uppercase tracking-wider">
                              <span className="mr-1.5 text-sm">{REGION_FLAGS[job.region] || '📍'}</span>{job.region}
                            </div>
                            <div className="flex items-center text-[11px] font-bold text-gray-400"><Clock className="h-3.5 w-3.5 mr-1.5" />{new Date(job.postedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {currentView === 'active' ? (
                            <a href={job.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-black rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200">
                              Apply <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          ) : <div className="text-gray-400 text-xs font-bold uppercase italic px-4 py-2 bg-gray-50 rounded-lg">Expired</div>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TRACKED_COMPANIES
              .sort()
              .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((name) => {
              const company = COMPANY_DETAILS[name] || {
                name,
                description: 'Technology company with global operations.',
                regions: [],
                offices: ['Global'],
                careerUrl: '#'
              };
              const activeCount = activeJobs.filter(j => j.company === name).length;

              return (
                <div key={name} className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm hover:border-purple-100 transition-all duration-200">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-gray-900 text-white p-3 rounded-2xl">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <a href={company.careerUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 transition-colors">
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl font-black text-gray-900">{name}</h2>
                    {activeCount > 0 && (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {activeCount} active roles
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {company.description}
                  </p>
                  
                  <div className="space-y-4 pt-4 border-t border-gray-50">
                    <div>
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Globe className="h-3 w-3" />
                         Active Regions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {company.regions.length > 0 ? company.regions.map(r => (
                          <span key={r} className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold border border-gray-100">
                            <span>{REGION_FLAGS[r]}</span>{r}
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
                    onClick={() => {
                      if (activeCount > 0) {
                        setSelectedCompany(name);
                        setCurrentView('active');
                        window.scrollTo(0, 0);
                      }
                    }}
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
              );
            })}
          </div>
        )}
      </main>

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
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-100">{activeJobs.length} ACTIVE</span>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-orange-50 text-orange-700 border border-orange-100">{removedJobs.length} REMOVED</span>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-gray-50 text-gray-600 border border-gray-100">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
