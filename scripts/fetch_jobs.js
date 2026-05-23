import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';

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
  { name: 'On Running', platform: 'greenhouse', token: 'onrunning' },
  { name: 'Payoneer', platform: 'greenhouse', token: 'payoneer' },
  { name: 'Traveloka', platform: 'traveloka', token: 'traveloka' },
  
  // Workday V2 (CXS Direct)
  { name: 'Razer', platform: 'workday-v2', token: 'Careers', tenant: 'razer', sub: 'wd3' },
  { name: 'Klook', platform: 'workday-v2', token: 'Klook', tenant: 'klook', sub: 'wd3' },
  { name: 'Axis Communications', platform: 'workday-v2', token: 'External_Career_Site', tenant: 'axis', sub: 'wd3' },
  
  // XML Feed (Direct)
  { name: 'Volvo Group', platform: 'volvo-feed', url: 'https://jobs.volvogroup.com/feed/361555' },

  // RMK / SuccessFactors HTML Scrape
  { name: 'Assa Abloy', platform: 'rmk', domain: 'assaabloy.jobs2web.com' },
  { name: 'Scania', platform: 'rmk', domain: 'jobs.scania.com' },

  // Algolia (Atlas Copco)
  { name: 'Atlas Copco', platform: 'algolia', appId: '9AX0H7NCCX', apiKey: '4415f5d1228e3b2da6ac78d10c41e93c', index: 'GROUP_EN_dateDesc' },

  // Phenom People Widgets
  { name: 'ABB', platform: 'phenom', domain: 'careers.abb', categories: ['Engineering', 'Information Systems'] },
  { name: 'Electrolux', platform: 'phenom', domain: 'career.electroluxgroup.com', categories: ['Tech', 'Engineering'] },

  // Ashby
  { name: 'Supercell', platform: 'ashby', token: 'supercell' },

  // Jibe / Booking
  { name: 'Booking.com', platform: 'booking', token: 'workingatbooking' },

  // Greenhouse candidates
  { name: 'Supercell_Old', platform: 'greenhouse', token: 'supercell' }, // To be safe
  { name: 'Moonton', platform: 'greenhouse', token: 'moonton' },
  { name: 'EF', platform: 'greenhouse', token: 'efeducationfirst' },
  { name: 'Dramabox', platform: 'greenhouse', token: 'storymatrix' },
  { name: 'Wise', platform: 'greenhouse', token: 'wise' },
  { name: 'Spotify', platform: 'greenhouse', token: 'spotify' },
  { name: 'Ascenda', platform: 'greenhouse', token: 'ascendaloyalty' },
  { name: 'Shopline', platform: 'greenhouse', token: 'shopline' },
  { name: 'Youtrip', platform: 'greenhouse', token: 'youtrip' },
  
  // Workday
  { name: 'Lego Group', platform: 'workday-v2', token: 'Lego_Careers', tenant: 'lego', sub: 'wd3' },

  // SmartRecruiters
  { name: 'Ubisoft', platform: 'smartrecruiters', token: 'Ubisoft' },
];

const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
  },
  maxContentLength: 100 * 1024 * 1024 
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
      location: 'Sweden',
      link: job.url,
      postedAt: job.date_published,
      region: 'Sweden'
    }));
  } catch (error) {
    return [];
  }
}

async function fetchTravelokaJobs(company) {
  let allTraveloka = [];
  const regions = [{ code: 'CN', name: 'China' }, { code: 'SG', name: 'Singapore' }, { code: 'HK', name: 'Hong Kong' }];
  for (const reg of regions) {
    try {
      const response = await axiosInstance.get(`https://careers-api.cnt.traveloka.com/v2/career/jobs/search?intf=desktop&location=${reg.code}&department=&type=&keyword=&page=1`);
      if (response.data?.data?.jobs) {
        const jobs = response.data.data.jobs.map(job => ({
          id: `tv-${job.requisitionId}`,
          title: job.title,
          company: company.name,
          location: job.location,
          link: `https://careers.traveloka.com${job.link}`,
          postedAt: new Date(job.createdAt).toISOString(),
          region: reg.name
        }));
        allTraveloka = allTraveloka.concat(jobs);
      }
    } catch (error) {}
  }
  return allTraveloka;
}

async function fetchWorkdayV2Jobs(company) {
  let allPostings = [];
  const limit = 20; 
  const baseUrl = `https://${company.tenant}.${company.sub}.myworkdayjobs.com`;
  const url = `${baseUrl}/wday/cxs/${company.tenant}/${company.token}/jobs`;

  try {
    const initialResponse = await axiosInstance.post(url, { appliedFacets: {}, limit: limit, offset: 0, searchText: "" }, {
      headers: { 'Origin': baseUrl, 'Referer': `${baseUrl}/${company.token}` }
    });

    if (!initialResponse.data || initialResponse.data.total === undefined) return [];
    const initialTotal = initialResponse.data.total;
    if (initialResponse.data.jobPostings) allPostings = allPostings.concat(initialResponse.data.jobPostings);

    let offset = limit;
    while (offset < initialTotal && offset < 1000) {
      try {
        const response = await axiosInstance.post(url, { appliedFacets: {}, limit: limit, offset: offset, searchText: "" }, {
          headers: { 'Origin': baseUrl, 'Referer': `${baseUrl}/${company.token}` }
        });
        if (response.data?.jobPostings) allPostings = allPostings.concat(response.data.jobPostings);
      } catch (loopError) {}
      offset += limit;
      await new Promise(r => setTimeout(r, 400));
    }
  } catch (error) {
    return [];
  }

  return allPostings.map(job => ({
    id: `wd2-${job.bulletinNumber || job.externalPath}`,
    title: job.title,
    company: company.name,
    location: job.locationsText,
    link: `${baseUrl}/${company.token}${job.externalPath}`,
    postedAt: new Date().toISOString(),
    region: detectRegion(job.locationsText)
  }));
}

async function fetchRMKJobs(company) {
  const allRMK = [];
  try {
    const url = `https://${company.domain}/search/?q=&locationsearch=`;
    const response = await axiosInstance.get(url, { headers: { 'Accept': 'text/html' } });
    const html = response.data;
    const jobRegex = /<a href="(\/job\/[^"]+)" class="jobTitle-link">([^<]+)<\/a>/g;
    const locRegex = /<span class="jobLocation">\s*([^<]+)\s*<\/span>/g;
    let match;
    const titles = [];
    const links = [];
    while ((match = jobRegex.exec(html)) !== null) {
      links.push(`https://${company.domain}${match[1]}`);
      titles.push(match[2].trim());
    }
    const locations = [];
    while ((match = locRegex.exec(html)) !== null) {
      locations.push(match[1].trim().replace(/\s+/g, ' '));
    }
    for (let i = 0; i < titles.length; i++) {
      allRMK.push({
        id: `rmk-${company.name}-${i}`,
        title: titles[i],
        company: company.name,
        location: locations[i],
        link: links[i],
        postedAt: new Date().toISOString(),
        region: detectRegion(locations[i])
      });
    }
  } catch (error) {}
  return allRMK;
}

async function fetchPhenomJobs(company) {
  try {
    const url = `https://${company.domain}/widgets`;
    const response = await axiosInstance.post(url, {
      lang: "en_global",
      deviceType: "desktop",
      country: "global",
      pageName: "search-results",
      ddoKey: "refineSearch",
      from: 0,
      size: 100,
      jobs: true,
      counts: true,
      global: true,
      selected_fields: {
        country: ["China", "Hong Kong", "Singapore", "Sweden"],
        category: company.categories
      }
    });

    if (response.data?.refineSearch?.data?.jobs) {
      return response.data.refineSearch.data.jobs.map(job => ({
        id: `ph-${job.jobId}`,
        title: job.title,
        company: company.name,
        location: job.location,
        link: job.url,
        postedAt: job.postedDate || new Date().toISOString(),
        region: detectRegion(job.location)
      }));
    }
  } catch (error) {}
  return [];
}

async function fetchBookingJobs(company) {
  try {
    const url = `https://jobs.booking.com/api/jobs?keywords=&locations=Shanghai,Shanghai,China%7CSingapore,Central%20Singapore,Singapore&page=1&sortBy=relevance&descending=false&internal=false&domain=workingatbooking.jibeapply.com`;
    const response = await axiosInstance.get(url, { headers: { 'Referer': 'https://jobs.booking.com/booking/jobs' } });
    if (response.data?.jobs) {
      return response.data.jobs.map(job => ({
        id: `bk-${job.data.req_id}`,
        title: job.data.title,
        company: company.name,
        location: job.data.full_location,
        link: `https://jobs.booking.com/booking/jobs/${job.data.slug}`,
        postedAt: job.data.create_date,
        region: detectRegion(job.data.full_location)
      }));
    }
  } catch (error) {}
  return [];
}

async function fetchAlgoliaJobs(company) {
  try {
    const url = `https://${company.appId.toLowerCase()}-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20JavaScript%20(4.25.2)&x-algolia-api-key=${company.apiKey}&x-algolia-application-id=${company.appId}`;
    const response = await axiosInstance.post(url, {
      requests: [{
        indexName: company.index,
        params: `facetFilters=%5B%5B%22data.country%3AChina%22%2C%22data.country%3AHong%20Kong%22%2C%22data.country%3ASingapore%22%2C%22data.country%3ASweden%22%5D%2C%5B%22data.jobFunction%3AInformation%20Technology%22%5D%5D&filters=(data.tagsTranslated%3A%22Job%20vacancy%22)&hitsPerPage=100`
      }]
    });
    if (response.data?.results?.[0]?.hits) {
      return response.data.results[0].hits.map(hit => ({
        id: `alg-${hit.objectID}`,
        title: hit.data.title,
        company: company.name,
        location: hit.data.city + ", " + hit.data.country,
        link: hit.data.externalPath,
        postedAt: hit.data.postingDate,
        region: detectRegion(hit.data.country)
      }));
    }
  } catch (error) {}
  return [];
}

async function fetchVolvoFeed(company) {
  try {
    const response = await axiosInstance.get(company.url);
    const result = await parseStringPromise(response.data);
    // Volvo Group feed structure: source -> jobs -> job (ARRAY)
    const rawJobs = result?.source?.jobs?.[0]?.job;
    if (!rawJobs) return [];
    
    const countryMap = {
      'CN': 'China',
      'HK': 'Hong Kong',
      'SG': 'Singapore',
      'SE': 'Sweden'
    };

    return rawJobs
      .map((job) => {
        const countryCode = (job.country?.[0] || "").toUpperCase();
        const region = countryMap[countryCode] || detectRegion(job.location?.[0] || "");
        
        return {
          id: `vo-${job.ID?.[0]}`,
          title: job.title?.[0],
          company: company.name,
          location: job.location?.[0],
          link: job.url?.[0],
          postedAt: new Date().toISOString(),
          region: region
        };
      })
      .filter(job => REGIONS.includes(job.region));
  } catch (error) {
    return [];
  }
}

function detectRegion(location) {
  if (!location) return 'Other';
  const loc = location.toLowerCase();
  if (loc.includes('china') || loc.includes('beijing') || loc.includes('shanghai') || loc.includes('shenzhen') || loc.includes('guangzhou') || loc.includes('hangzhou') || loc.includes(', cn') || loc.includes('chengdu')) return 'China';
  if (loc.includes('hong kong') || loc.includes('hk')) return 'Hong Kong';
  if (loc.includes('singapore') || loc.includes(', sg')) return 'Singapore';
  if (loc.includes('sweden') || loc.includes('stockholm') || loc.includes('gothenburg') || loc.includes('malmö') || loc.includes('lund') || loc.includes(', se') || loc.includes('södertälje') || loc.includes('västerås')) return 'Sweden';
  return 'Other';
}

function matchesKeywords(title) {
  if (!title) return false;
  const t = title.toLowerCase();
  return KEYWORDS.some(keyword => t.includes(keyword.toLowerCase()));
}

async function main() {
  let allJobs = [];

  for (const company of COMPANIES) {
    console.log(`Fetching jobs for ${company.name}...`);
    let jobs = [];
    if (company.platform === 'greenhouse') jobs = await fetchGreenhouseJobs(company);
    else if (company.platform === 'smartrecruiters') jobs = await fetchSmartRecruitersJobs(company);
    else if (company.platform === 'bytedance') jobs = await fetchByteDanceJobs(company);
    else if (company.platform === 'ashby') jobs = await fetchAshbyJobs(company);
    else if (company.platform === 'teamtailor-feed') jobs = await fetchTeamtailorFeedJobs(company);
    else if (company.platform === 'traveloka') jobs = await fetchTravelokaJobs(company);
    else if (company.platform === 'workday-v2') jobs = await fetchWorkdayV2Jobs(company);
    else if (company.platform === 'rmk') jobs = await fetchRMKJobs(company);
    else if (company.platform === 'phenom') jobs = await fetchPhenomJobs(company);
    else if (company.platform === 'booking') jobs = await fetchBookingJobs(company);
    else if (company.platform === 'algolia') jobs = await fetchAlgoliaJobs(company);
    else if (company.platform === 'volvo-feed') jobs = await fetchVolvoFeed(company);
    
    const filteredJobs = jobs.filter(job => matchesKeywords(job.title) && REGIONS.includes(job.region));
    console.log(`  Summary: ${jobs.length} total, ${filteredJobs.length} matched criteria (Region & Keywords).`);
    allJobs = allJobs.concat(filteredJobs);
  }

  allJobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  fs.writeFileSync(path.join(process.cwd(), 'public', 'jobs.json'), JSON.stringify(allJobs, null, 2));
  console.log(`Successfully wrote ${allJobs.length} matched jobs.`);
}

main();
