export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  link: string;
  postedAt: string;
  region: string;
}

export interface CompanyInfo {
  name: string;
  description: string;
  regions: string[];
  offices: string[];
  careerUrl: string;
  logoDomain: string;
  customLogo?: string;
}

export interface JobApplication {
  jobId: string;
  status: 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  appliedAt: string;
  contactName?: string;
  contactEmail?: string;
  processStep?: string;
  notes?: string;
  updatedAt: string;
}

