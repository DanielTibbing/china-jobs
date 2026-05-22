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
  'Developer',
  'Product Manager',
  'Marketing'
];

const REGIONS = ['China', 'Hong Kong', 'Singapore', 'Sweden'];

const COMPANIES = [
  // Existing & Working
  { name: 'Airwallex', platform: 'ashby', token: 'airwallex' },
  { name: 'Grab', platform: 'smartrecruiters', token: 'grab' },
  { name: 'Checkout.com', platform: 'ashby', token: 'checkout.com' },
  { name: 'Canva', platform: 'smartrecruiters', token: 'canva' },
  { name: 'Roblox', platform: 'greenhouse', token: 'roblox' },
  { name: 'Unity', platform: 'greenhouse', token: 'unity3d' },
  { name: 'ByteDance', platform: 'bytedance', token: 'bytedance' },
  { name: 'TikTok', platform: 'bytedance', token: 'tiktok' },
  { name: 'Agoda', platform: 'greenhouse', token: 'agoda' },
  { name: 'Skyscanner', platform: 'greenhouse', token: 'skyscanner' },
  { name: 'Scopely', platform: 'greenhouse', token: 'scopely' },
  { name: 'Marshall', platform: 'teamtailor-feed', token: 'marshall', domain: 'careers.marshall.com' },
  { name: 'Duolingo', platform: 'greenhouse', token: 'duolingo' },
  { name: 'Liftoff', platform: 'greenhouse', token: 'liftoff' },
  { name: 'Riot Games', platform: 'greenhouse', token: 'riotgames' },
  { name: 'Nex', platform: 'greenhouse', token: 'nex' },
  { name: 'Casetify', platform: 'greenhouse', token: 'casetify' },
  { name: 'Epic Games', platform: 'greenhouse', token: 'epicgames' },
  { name: 'Adyen', platform: 'greenhouse', token: 'adyen' },
  { name: 'NetEase Games', platform: 'greenhouse', token: 'neteasegames' },
  
  // Greenhouse candidates
  { name: 'Supercell', platform: 'greenhouse', token: 'supercell' },
  { name: 'Dramabox', platform: 'greenhouse', token: 'storymatrix' },
  { name: 'Wise', platform: 'greenhouse', token: 'wise' },
  { name: 'Spotify', platform: 'greenhouse', token: 'spotify' },
  { name: 'Ascenda', platform: 'greenhouse', token: 'ascendaloyalty' },
  { name: 'Shopline', platform: 'greenhouse', token: 'shopline' },
  { name: 'Youtrip', platform: 'greenhouse', token: 'youtrip' },
  
  // SmartRecruiters
  { name: 'Ubisoft', platform: 'smartrecruiters', token: 'Ubisoft' },
  { name: 'Payoneer', platform: 'smartrecruiters', token: 'Payoneer' },
];

const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
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
    if (error.response && error.response.status !== 404) {
      console.error(`Error fetching Greenhouse jobs for ${company.name}:`, error.message);
    }
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
    if (error.response && error.response.status !== 404) {
      console.error(`Error fetching SmartRecruiters jobs for ${company.name}:`, error.message);
    }
    return [];
  }
}

async function fetchByteDanceJobs(company) {
  try {
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

async function fetchAshbyJobs(company) {
  try {
    const response = await axiosInstance.get(`https://api.ashbyhq.com/posting-api/job-board/${company.token}`);
    if (!response.data.jobs) return [];
    return response.data.jobs.map(job => ({
      id: `as-${job.id}`,
      title: job.title,
      company: company.name,
      location: job.location,
      link: job.jobUrl,
      postedAt: job.publishedAt,
      region: detectRegion(job.location)
    }));
  } catch (error) {
    if (error.response && error.response.status !== 404) {
      console.error(`Error fetching Ashby jobs for ${company.name}:`, error.message);
    }
    return [];
  }
}

async function fetchTeamtailorFeedJobs(company) {
  try {
    const url = company.domain ? `https://${company.domain}/jobs.json` : `https://${company.token}.teamtailor.com/jobs.json`;
    const response = await axiosInstance.get(url);
    if (!response.data.items) return [];
    return response.data.items.map(job => ({
      id: `tt-${job.id}`,
      title: job.title,
      company: company.name,
      location: 'Sweden', // Marshall is primarily SE, feed is sparse
      link: job.url,
      postedAt: job.date_published,
      region: 'Sweden'
    }));
  } catch (error) {
    if (error.response && error.response.status !== 404) {
      console.error(`Error fetching Teamtailor feed jobs for ${company.name}:`, error.message);
    }
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
    } else if (company.platform === 'smartrecruiters') {
      jobs = await fetchSmartRecruitersJobs(company);
    } else if (company.platform === 'bytedance') {
      jobs = await fetchByteDanceJobs(company);
    } else if (company.platform === 'ashby') {
      jobs = await fetchAshbyJobs(company);
    } else if (company.platform === 'teamtailor-feed') {
      jobs = await fetchTeamtailorFeedJobs(company);
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
