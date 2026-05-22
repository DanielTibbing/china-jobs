import axios from 'axios';
import fs from 'fs';
import path from 'path';

const KEYWORDS = [
  'Engineering Manager', 
  'Software Development Manager', 
  'Team lead', 
  'Tech Lead', 
  'Technical Lead',
  'Lead',
  'Frontend', 
  'Front-end',
  'Frontend Developer', 
  'Fullstack',
  'Full-stack',
  'Fullstack developer', 
  'React',
  'Software Engineer',
  'Developer'
];

const REGIONS = ['China', 'Hong Kong', 'Singapore', 'Sweden'];

const COMPANIES = [
  { name: 'Airwallex', platform: 'greenhouse', token: 'airwallex' },
  { name: 'Grab', platform: 'smartrecruiters', token: 'grab' },
  { name: 'Stripe', platform: 'lever', token: 'stripe' },
  { name: 'Wise', platform: 'greenhouse', token: 'wise' },
  { name: 'Checkout.com', platform: 'greenhouse', token: 'checkout' },
  { name: 'Canva', platform: 'greenhouse', token: 'canva' },
  { name: 'Roblox', platform: 'greenhouse', token: 'roblox' },
  { name: 'Unity', platform: 'greenhouse', token: 'unity3d' },
  { name: 'Spotify', platform: 'greenhouse', token: 'spotify' },
  { name: 'ByteDance', platform: 'bytedance', token: 'bytedance' },
  { name: 'TikTok', platform: 'bytedance', token: 'tiktok' },
  { name: 'Lalamove', platform: 'lever', token: 'lalamove' },
  { name: 'Klook', platform: 'greenhouse', token: 'klook' },
  { name: 'Agoda', platform: 'greenhouse', token: 'agoda' },
  { name: 'Skyscanner', platform: 'smartrecruiters', token: 'skyscanner' },
  { name: 'Lego Group', platform: 'greenhouse', token: 'thelegogroup' },
];

const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

async function fetchGreenhouseJobs(company) {
  try {
    const response = await axiosInstance.get(`https://boards-api.greenhouse.io/v1/boards/${company.token}/jobs`);
    if (!response.data.jobs) return [];
    return response.data.jobs.map(job => ({
      id: `gh-${job.id}`,
      title: job.title,
      company: company.name,
      location: job.location.name,
      link: job.absolute_url,
      postedAt: job.updated_at,
      region: detectRegion(job.location.name)
    }));
  } catch (error) {
    console.error(`Error fetching Greenhouse jobs for ${company.name}:`, error.message);
    return [];
  }
}

async function fetchLeverJobs(company) {
  try {
    const response = await axiosInstance.get(`https://api.lever.co/v0/postings/${company.token}`);
    if (!Array.isArray(response.data)) return [];
    return response.data.map(job => ({
      id: `lv-${job.id}`,
      title: job.text,
      company: company.name,
      location: job.categories.location,
      link: job.hostedUrl,
      postedAt: new Date(job.createdAt).toISOString(),
      region: detectRegion(job.categories.location)
    }));
  } catch (error) {
    console.error(`Error fetching Lever jobs for ${company.name}:`, error.message);
    return [];
  }
}

async function fetchSmartRecruitersJobs(company) {
  try {
    const response = await axiosInstance.get(`https://api.smartrecruiters.com/v1/companies/${company.token}/postings`);
    if (!response.data.content) return [];
    return response.data.content.map(job => ({
      id: `sr-${job.id}`,
      title: job.name,
      company: company.name,
      location: `${job.location.city}, ${job.location.country}`,
      link: `https://jobs.smartrecruiters.com/${company.token}/${job.id}`,
      postedAt: job.releasedDate,
      region: detectRegion(`${job.location.city}, ${job.location.country}`)
    }));
  } catch (error) {
    console.error(`Error fetching SmartRecruiters jobs for ${company.name}:`, error.message);
    return [];
  }
}

async function fetchByteDanceJobs(company) {
  try {
    // portal_type 2 is for experienced hires
    const response = await axiosInstance.get(`https://jobs.bytedance.com/api/v1/search/job/posts?limit=100&portal_type=2`);
    if (!response.data.data || !response.data.data.list) return [];
    return response.data.data.list.map(job => ({
      id: `bd-${job.id}`,
      title: job.title,
      company: company.name,
      location: job.location_list ? job.location_list.map(l => l.name).join(', ') : 'Global',
      link: `https://jobs.bytedance.com/en/position/${job.id}/detail`,
      postedAt: new Date(job.create_time).toISOString(),
      region: detectRegion(job.location_list ? job.location_list.map(l => l.name).join(', ') : '')
    }));
  } catch (error) {
    console.error(`Error fetching ByteDance jobs for ${company.name}:`, error.message);
    return [];
  }
}



function detectRegion(location) {
  if (!location) return 'Other';
  const loc = location.toLowerCase();
  if (loc.includes('china') || loc.includes('beijing') || loc.includes('shanghai') || loc.includes('shenzhen') || loc.includes('guangzhou') || loc.includes('hangzhou') || loc.includes(', cn')) return 'China';
  if (loc.includes('hong kong') || loc.includes('hk')) return 'Hong Kong';
  if (loc.includes('singapore') || loc.includes(', sg')) return 'Singapore';
  if (loc.includes('sweden') || loc.includes('stockholm') || loc.includes('gothenburg') || loc.includes('malmö') || loc.includes('lund') || loc.includes(', se')) return 'Sweden';
  return 'Other';
}

function matchesKeywords(title) {
  const t = title.toLowerCase();
  return KEYWORDS.some(keyword => t.includes(keyword.toLowerCase()));
}

async function main() {
  let allJobs = [];

  for (const company of COMPANIES) {
    console.log(`Fetching jobs for ${company.name}...`);
    let jobs = [];
    if (company.platform === 'greenhouse') {
      jobs = await fetchGreenhouseJobs(company);
    } else if (company.platform === 'lever') {
      jobs = await fetchLeverJobs(company);
    } else if (company.platform === 'smartrecruiters') {
      jobs = await fetchSmartRecruitersJobs(company);
    } else if (company.platform === 'bytedance') {
      jobs = await fetchByteDanceJobs(company);
    }
    
    const filteredJobs = jobs.filter(job => 
      matchesKeywords(job.title) && REGIONS.includes(job.region)
    );
    
    console.log(`Found ${jobs.length} total, ${filteredJobs.length} matched.`);
    allJobs = allJobs.concat(filteredJobs);
  }

  // Sort by date (newest first)
  allJobs.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));

  const outputPath = path.join(process.cwd(), 'public', 'jobs.json');
  fs.writeFileSync(outputPath, JSON.stringify(allJobs, null, 2));
  console.log(`Successfully wrote ${allJobs.length} jobs to ${outputPath}`);
}

main();
