import { useNavigate } from 'react-router-dom'
import type { Job } from '../../types'
import { COMPANY_DETAILS, TRACKED_COMPANIES } from '../../constants/companies'
import { CompanyCard } from './CompanyCard'

interface CompaniesViewProps {
  searchTerm: string;
  activeJobs: Job[];
  setSelectedCompany: (company: string) => void;
}

export function CompaniesView({ searchTerm, activeJobs, setSelectedCompany }: CompaniesViewProps) {
  const navigate = useNavigate();

  const handleViewRoles = (name: string) => {
    setSelectedCompany(name);
    navigate('/');
    window.scrollTo(0, 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {TRACKED_COMPANIES
        .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((name) => {
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
  )
}
