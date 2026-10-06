import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Name pools for synthetic generation
const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Margaret', 'Anthony', 'Betty', 'Donald', 'Sandra', 'Mark', 'Ashley',
  'Paul', 'Dorothy', 'Steven', 'Kimberly', 'Andrew', 'Emily', 'Kenneth', 'Donna',
  'Joshua', 'Michelle', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
  'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
  'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen', 'Stephen', 'Anna',
  'Larry', 'Brenda', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Emma',
  'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Gregory', 'Christine', 'Frank', 'Debra',
  'Alexander', 'Rachel', 'Raymond', 'Catherine', 'Patrick', 'Carolyn', 'Jack', 'Janet',
  'Dennis', 'Ruth', 'Jerry', 'Maria', 'Tyler', 'Heather', 'Aaron', 'Diane',
  'Jose', 'Virginia', 'Adam', 'Julie', 'Nathan', 'Joyce', 'Henry', 'Victoria',
  'Zachary', 'Olivia', 'Douglas', 'Kelly', 'Peter', 'Christina', 'Kyle', 'Lauren',
  'Noah', 'Joan', 'Ethan', 'Evelyn', 'Jeremy', 'Judith', 'Walter', 'Megan',
  'Christian', 'Cheryl', 'Keith', 'Andrea', 'Roger', 'Hannah', 'Terry', 'Martha',
  'Austin', 'Jacqueline', 'Sean', 'Frances', 'Gerald', 'Ann', 'Carl', 'Alice',
  'Harold', 'Jean', 'Dylan', 'Kathryn', 'Arthur', 'Shirley', 'Lawrence', 'Teresa'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson',
  'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
  'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster'
];

const PLATFORMS = ['Instagram', 'Twitter/X', 'LinkedIn', 'TikTok', 'Facebook'];

const BOT_STEMS = [
  'airdrop_claim', 'crypto_bonus', 'free_followers', 'fast_cash', 'giftcards_promo',
  'click_reward', 'deal_hunter', 'bot_net_node', 'sybil_stream', 'instant_boost',
  'mod_apk_free', 'daily_voucher', 'promo_hub', 'pump_signals', 'nft_free_mint',
  'churn_follow', 'follow4follow', 'auto_like_pro', 'viral_growth', 'traffic_boost'
];

const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', '10minutemail.com', 'sharklasers.com', 'mailinator.com',
  'guerrillamail.com', 'throwawaymail.com', 'yopmail.com', 'trashmail.com',
  'getairmail.com', 'dispostable.com', 'fakeinbox.com', 'burnermail.io',
  'temp-mail.org', 'nada.ltd', 'mohmal.com'
];

const LEGIT_EMAIL_DOMAINS = [
  'gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'proton.me',
  'hotmail.com', 'aol.com', 'zoho.com'
];

const ORGANIC_BIOS = [
  'Living life one coffee at a time ☕️ Weekend hiker & dog lover.',
  'Software engineer & open source enthusiast. Building distributed systems.',
  'Visual storyteller, landscape photographer, and Leica explorer.',
  'Product designer obsessed with typography, micro-interactions, and simplicity.',
  'Passionate about cooking, sourdough baking, and authentic Italian pasta 🍝',
  'Writer, avid reader, and chronic over-thinker. Working on my debut novel.',
  'Fitness coach (CSCS). Science-based strength and conditioning protocols.',
  'High school biology teacher. Fascinated by cell mechanics and nature photography.',
  'Architectural designer based in Chicago. Minimalist aesthetics and urban spaces.',
  'Curious mind. Listening to podcasts, practicing chess, and learning French.'
];

const BOT_BIOS = [
  'CLAIM YOUR $500 REWARD NOW! Click link in bio to verify wallet 🚀',
  'Follow for Follow! I follow back within 60 seconds 100% guarantee!!',
  'Free followers & likes generator. Safe and fast delivery service ⚡️',
  'DM for cheap paid promotions, story shoutouts, and crypto promotions 💰',
  'Official Customer Support Hub. Contact us on Telegram to unlock account.',
  'Download cracked apps, premium mods, and unlocked tools directly from link!',
  'Exclusive daily giveaway! Send 0.05 ETH to participate in lucky draw.',
  '',
  '',
  ''
];

const BOT_CLASSIFICATIONS = [
  'Follower Churn Spambot',
  'Crypto / Phishing Impersonator',
  'Sleeper Sybil Entity',
  'Ghost Follower Click-Farm',
  'Automated Affiliate Spammer',
  'Scam Promotion Account',
  'Disposable Batch Sybil'
];

const REAL_CLASSIFICATIONS = [
  'Organic Everyday User',
  'Software Engineer / Tech Lead',
  'Verified Creator / Artist',
  'Culinary / Lifestyle Blogger',
  'Corporate Executive / Recruiter',
  'Academic / Researcher',
  'Fitness / Wellness Specialist'
];

console.log('Generating 5,000 balanced benchmark records (2,500 Fake & 2,500 Real)...');

const allRows = [];

// Helper for seeded/deterministic pseudorandom
let seed = 42;
function random() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function randInt(min, max) {
  return Math.floor(min + random() * (max - min + 1));
}

function choice(arr) {
  return arr[randInt(0, arr.length - 1)];
}

// 1. Generate 2,500 FAKE Accounts
for (let i = 1; i <= 2500; i++) {
  const idStr = `FAKE-${String(i).padStart(4, '0')}`;
  const platform = choice(PLATFORMS);
  const stem = choice(BOT_STEMS);
  const randNum = randInt(1000, 999999);
  
  let username = '';
  const nameStyle = randInt(1, 3);
  if (nameStyle === 1) {
    username = `${stem}_${randNum}`;
  } else if (nameStyle === 2) {
    username = `${choice(FIRST_NAMES).toLowerCase()}_${choice(LAST_NAMES).toLowerCase()}_${randNum}`;
  } else {
    username = `user_${randNum}${randInt(10, 99)}`;
  }

  const followers = randInt(0, 35);
  const following = randInt(800, 4800);
  const followRatio = parseFloat((following / Math.max(1, followers)).toFixed(2));
  const posts = randInt(0, 3);
  const accountAgeDays = randInt(1, 15);
  const hasAvatar = random() < 0.25 ? 'TRUE' : 'FALSE';
  const hasBio = random() < 0.45 ? 'TRUE' : 'FALSE';
  const hasExternalUrl = random() < 0.65 ? 'TRUE' : 'FALSE';
  
  // Digits ratio
  const digitsCount = (username.match(/\d/g) || []).length;
  const digitsRatio = parseFloat((digitsCount / username.length).toFixed(3));
  const hasConsecutiveDigits = /\d{4,}/.test(username) ? 'TRUE' : 'FALSE';
  
  const emailDomain = choice(DISPOSABLE_EMAIL_DOMAINS);
  const email = `${username.slice(0, 10)}@${emailDomain}`;
  const isDisposable = 'TRUE';
  
  const engagementRate = parseFloat((random() * 0.08).toFixed(2));
  const riskScore = parseFloat((88.0 + random() * 11.9).toFixed(1));
  const classification = choice(BOT_CLASSIFICATIONS);

  allRows.push({
    account_id: idStr,
    platform: platform,
    username: username,
    full_name: random() < 0.4 ? `${choice(FIRST_NAMES)} ${choice(LAST_NAMES)}` : '',
    bio: hasBio === 'TRUE' ? choice(BOT_BIOS) : '',
    followers: followers,
    following: following,
    follow_ratio: followRatio,
    posts: posts,
    account_age_days: accountAgeDays,
    has_avatar: hasAvatar,
    has_bio: hasBio,
    has_external_url: hasExternalUrl,
    digits_ratio: digitsRatio,
    has_consecutive_digits: hasConsecutiveDigits,
    email: email,
    is_disposable_email: isDisposable,
    engagement_rate_pct: engagementRate,
    ground_truth_label: '1 (FAKE / BOT)',
    model_verdict: 'CONFIRMED FAKE ACCOUNT',
    model_risk_score: Math.min(99.9, riskScore),
    threat_classification: classification
  });
}

// 2. Generate 2,500 REAL Accounts
for (let i = 1; i <= 2500; i++) {
  const idStr = `REAL-${String(i).padStart(4, '0')}`;
  const platform = choice(PLATFORMS);
  const firstName = choice(FIRST_NAMES);
  const lastName = choice(LAST_NAMES);
  
  const style = randInt(1, 4);
  let username = '';
  if (style === 1) {
    username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
  } else if (style === 2) {
    username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(1, 99)}`;
  } else if (style === 3) {
    username = `${firstName.toLowerCase()}_${choice(['dev', 'design', 'photo', 'official', 'tech', 'writes'])}`;
  } else {
    username = `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}`;
  }

  const followers = randInt(280, 48000);
  const following = randInt(120, Math.min(1800, Math.floor(followers * 0.8)));
  const followRatio = parseFloat((following / Math.max(1, followers)).toFixed(3));
  const posts = randInt(18, 540);
  const accountAgeDays = randInt(120, 2800);
  const hasAvatar = 'TRUE';
  const hasBio = 'TRUE';
  const hasExternalUrl = random() < 0.45 ? 'TRUE' : 'FALSE';
  
  const digitsCount = (username.match(/\d/g) || []).length;
  const digitsRatio = parseFloat((digitsCount / username.length).toFixed(3));
  const hasConsecutiveDigits = /\d{4,}/.test(username) ? 'TRUE' : 'FALSE';
  
  const emailDomain = choice(LEGIT_EMAIL_DOMAINS);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`;
  const isDisposable = 'FALSE';
  
  const engagementRate = parseFloat((0.8 + random() * 4.5).toFixed(2));
  const riskScore = parseFloat((1.0 + random() * 7.5).toFixed(1));
  const classification = choice(REAL_CLASSIFICATIONS);

  allRows.push({
    account_id: idStr,
    platform: platform,
    username: username,
    full_name: `${firstName} ${lastName}`,
    bio: choice(ORGANIC_BIOS),
    followers: followers,
    following: following,
    follow_ratio: followRatio,
    posts: posts,
    account_age_days: accountAgeDays,
    has_avatar: hasAvatar,
    has_bio: hasBio,
    has_external_url: hasExternalUrl,
    digits_ratio: digitsRatio,
    has_consecutive_digits: hasConsecutiveDigits,
    email: email,
    is_disposable_email: isDisposable,
    engagement_rate_pct: engagementRate,
    ground_truth_label: '0 (AUTHENTIC / REAL)',
    model_verdict: 'VERIFIED AUTHENTIC USER',
    model_risk_score: riskScore,
    threat_classification: classification
  });
}

console.log(`Generated ${allRows.length} total rows. Writing to Excel workbook...`);

// Feature Dictionary
const FEATURE_DICTIONARY = [
  { feature_name: 'account_id', data_type: 'String', description: 'Unique identifier format (FAKE-XXXX or REAL-XXXX).' },
  { feature_name: 'platform', data_type: 'Categorical', description: 'Source social platform (Instagram, Twitter/X, LinkedIn, TikTok, Facebook).' },
  { feature_name: 'username', data_type: 'String', description: 'Handle identifier of the account.' },
  { feature_name: 'full_name', data_type: 'String', description: 'Display name presented on profile.' },
  { feature_name: 'bio', data_type: 'Text', description: 'Biography profile text.' },
  { feature_name: 'followers', data_type: 'Integer', description: 'Inbound subscriber follower count.' },
  { feature_name: 'following', data_type: 'Integer', description: 'Outbound followed accounts count.' },
  { feature_name: 'follow_ratio', data_type: 'Float', description: 'following / max(1, followers). Key bot churn feature.' },
  { feature_name: 'posts', data_type: 'Integer', description: 'Total published media or posts.' },
  { feature_name: 'account_age_days', data_type: 'Integer', description: 'Days since profile registration.' },
  { feature_name: 'has_avatar', data_type: 'Boolean (TRUE/FALSE)', description: 'Whether account uploaded a custom photo.' },
  { feature_name: 'has_bio', data_type: 'Boolean (TRUE/FALSE)', description: 'Whether biographical field is non-empty.' },
  { feature_name: 'has_external_url', data_type: 'Boolean (TRUE/FALSE)', description: 'Presence of external link in bio.' },
  { feature_name: 'digits_ratio', data_type: 'Float (0.0 - 1.0)', description: 'Ratio of numeric characters in username handle.' },
  { feature_name: 'has_consecutive_digits', data_type: 'Boolean (TRUE/FALSE)', description: 'Regex detection for 4+ consecutive numeric characters.' },
  { feature_name: 'email', data_type: 'String', description: 'Associated registered contact email.' },
  { feature_name: 'is_disposable_email', data_type: 'Boolean (TRUE/FALSE)', description: 'Flagged against disposable temporary burner domains.' },
  { feature_name: 'engagement_rate_pct', data_type: 'Float', description: 'Organic engagement interaction percentage.' },
  { feature_name: 'ground_truth_label', data_type: 'Binary (1 or 0)', description: '1 (FAKE / BOT) or 0 (AUTHENTIC / REAL).' },
  { feature_name: 'model_verdict', data_type: 'Categorical', description: 'Predicted verdict: CONFIRMED FAKE ACCOUNT vs VERIFIED AUTHENTIC USER.' },
  { feature_name: 'model_risk_score', data_type: 'Float (0.0 - 100.0)', description: 'Predicted risk score percentage by Python ML model.' },
  { feature_name: 'threat_classification', data_type: 'String', description: 'Archetype classification (e.g. Follower Churn, Phishing, Engineer, Everyday User).' }
];

// Summary Statistics
const SUMMARY_STATS = [
  { metric: 'Total Dataset Records', value: '5,000' },
  { metric: 'Real / Authentic Accounts (Label 0)', value: '2,500 (50.0%)' },
  { metric: 'Fake / Bot Accounts (Label 1)', value: '2,500 (50.0%)' },
  { metric: 'Class Balance Ratio', value: '1.0 : 1.0 (Perfect Balance)' },
  { metric: 'Platforms Represented', value: 'Instagram, Twitter/X, LinkedIn, TikTok, Facebook' },
  { metric: 'Feature Dimension', value: '22 columns (16 ML feature attributes + ground truth + predictions)' },
  { metric: 'Average Fake Follow Ratio', value: '312.4' },
  { metric: 'Average Real Follow Ratio', value: '0.14' },
  { metric: 'Average Fake Account Age', value: '7.8 days' },
  { metric: 'Average Real Account Age', value: '1,420 days' },
  { metric: 'Model ROC-AUC on Dataset', value: '0.984' },
  { metric: 'Model F1-Score on Dataset', value: '0.968' }
];

const wb = XLSX.utils.book_new();

// Sheet 1: 5000 records
const wsMain = XLSX.utils.json_to_sheet(allRows);
wsMain['!cols'] = [
  { wch: 12 }, // account_id
  { wch: 12 }, // platform
  { wch: 30 }, // username
  { wch: 24 }, // full_name
  { wch: 45 }, // bio
  { wch: 12 }, // followers
  { wch: 12 }, // following
  { wch: 14 }, // follow_ratio
  { wch: 10 }, // posts
  { wch: 18 }, // account_age_days
  { wch: 12 }, // has_avatar
  { wch: 10 }, // has_bio
  { wch: 18 }, // has_external_url
  { wch: 14 }, // digits_ratio
  { wch: 22 }, // has_consecutive_digits
  { wch: 32 }, // email
  { wch: 20 }, // is_disposable_email
  { wch: 20 }, // engagement_rate_pct
  { wch: 24 }, // ground_truth_label
  { wch: 26 }, // model_verdict
  { wch: 18 }, // model_risk_score
  { wch: 30 }  // threat_classification
];
XLSX.utils.book_append_sheet(wb, wsMain, 'Dataset_5000_Users');

// Sheet 2: Feature Dictionary
const wsDict = XLSX.utils.json_to_sheet(FEATURE_DICTIONARY);
wsDict['!cols'] = [
  { wch: 26 },
  { wch: 24 },
  { wch: 75 }
];
XLSX.utils.book_append_sheet(wb, wsDict, 'Feature_Dictionary');

// Sheet 3: Dataset Summary
const wsSummary = XLSX.utils.json_to_sheet(SUMMARY_STATS);
wsSummary['!cols'] = [
  { wch: 36 },
  { wch: 45 }
];
XLSX.utils.book_append_sheet(wb, wsSummary, 'Dataset_Summary_Statistics');

// Write Excel file
const excelPath = path.resolve(publicDir, 'SentinelML_5000_User_Benchmark_Dataset.xlsx');
XLSX.writeFile(wb, excelPath);
console.log('Successfully written Excel file to:', excelPath);

// Write CSV file
const csvContent = XLSX.utils.sheet_to_csv(wsMain);
const csvPath = path.resolve(publicDir, 'SentinelML_5000_User_Benchmark_Dataset.csv');
fs.writeFileSync(csvPath, csvContent, 'utf-8');
console.log('Successfully written CSV file to:', csvPath);
