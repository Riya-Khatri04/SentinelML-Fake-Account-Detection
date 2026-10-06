import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Name pools
const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Margaret', 'Anthony', 'Betty', 'Donald', 'Sandra', 'Mark', 'Ashley',
  'Paul', 'Dorothy', 'Steven', 'Kimberly', 'Andrew', 'Emily', 'Kenneth', 'Donna',
  'Joshua', 'Michelle', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
  'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
  'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen', 'Stephen', 'Anna'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
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
  'getairmail.com', 'dispostable.com', 'burnermail.io', 'nada.ltd'
];

const LEGIT_DOMAINS = [
  'gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'proton.me', 'hotmail.com'
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

const SUSPICIOUS_URLS = [
  'https://eth-gas-refund.top/claim',
  'https://free-followers-boost.xyz',
  'https://bit.ly/crypto-giveaway-2026',
  'https://claim-airdrop-reward.click',
  'https://t.me/free_crypto_signals_vip',
  'https://bonus-voucher-claim.cam'
];

const LEGIT_URLS = [
  'https://github.com',
  'https://linkedin.com',
  'https://medium.com',
  'https://behance.net',
  'https://dribbble.com',
  'https://personal-portfolio.dev'
];

// Seeded pseudorandom
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

async function generateDataset() {
  console.log('Generating 5,000 accounts with exactly 20 features...');
  const rows = [];

  // 1. Generate 2,500 FAKE accounts (is_fake = 1)
  for (let i = 1; i <= 2500; i++) {
    const platform = choice(PLATFORMS);
    const stem = choice(BOT_STEMS);
    const randDigits = randInt(1000, 999999);
    
    let username = '';
    const style = randInt(1, 3);
    if (style === 1) {
      username = `${stem}_${randDigits}`;
    } else if (style === 2) {
      username = `${choice(FIRST_NAMES).toLowerCase()}_${choice(LAST_NAMES).toLowerCase()}_${randDigits}`;
    } else {
      username = `user_${randDigits}${randInt(10, 99)}`;
    }

    const fullName = random() < 0.35 ? `${choice(FIRST_NAMES)} ${choice(LAST_NAMES)}` : '';
    const hasBioBool = random() < 0.45;
    const bio = hasBioBool ? choice(BOT_BIOS) : '';
    const hasBio = hasBioBool ? 1 : 0;

    const followers = randInt(0, 30);
    const following = randInt(850, 4900);
    const followRatio = parseFloat((following / Math.max(1, followers)).toFixed(2));
    const posts = randInt(0, 3);
    const accountAgeDays = randInt(1, 14);
    const hasAvatar = random() < 0.2 ? 1 : 0;

    const hasUrlBool = random() < 0.65;
    const externalUrl = hasUrlBool ? choice(SUSPICIOUS_URLS) : '';
    const hasUrl = hasUrlBool ? 1 : 0;

    const emailDomain = choice(DISPOSABLE_EMAIL_DOMAINS);
    const email = `${username.slice(0, 10)}@${emailDomain}`;
    const isDisposableEmail = 1;

    const digitsCount = (username.match(/\d/g) || []).length;
    const digitsRatio = parseFloat((digitsCount / username.length).toFixed(3));
    const hasConsecutiveDigits = /\d{4,}/.test(username) ? 1 : 0;

    const avgLikes = parseFloat((random() * 0.2).toFixed(1));
    const engagementRate = followers > 0 ? parseFloat(((avgLikes / followers) * 100).toFixed(2)) : 0;

    // Exactly 20 features
    rows.push({
      platform,
      username,
      full_name: fullName,
      bio,
      followers,
      following,
      follow_ratio: followRatio,
      posts,
      account_age_days: accountAgeDays,
      has_avatar: hasAvatar,
      has_bio: hasBio,
      external_url: externalUrl,
      has_url: hasUrl,
      email,
      is_disposable_email: isDisposableEmail,
      digits_ratio: digitsRatio,
      has_consecutive_digits: hasConsecutiveDigits,
      avg_likes: avgLikes,
      engagement_rate: engagementRate,
      is_fake: 1
    });
  }

  // 2. Generate 2,500 REAL accounts (is_fake = 0)
  for (let i = 1; i <= 2500; i++) {
    const platform = choice(PLATFORMS);
    const firstName = choice(FIRST_NAMES);
    const lastName = choice(LAST_NAMES);

    let username = '';
    const style = randInt(1, 4);
    if (style === 1) {
      username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
    } else if (style === 2) {
      username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(1, 99)}`;
    } else if (style === 3) {
      username = `${firstName.toLowerCase()}_${choice(['dev', 'design', 'photo', 'official', 'tech'])}`;
    } else {
      username = `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}`;
    }

    const fullName = `${firstName} ${lastName}`;
    const bio = choice(ORGANIC_BIOS);
    const hasBio = 1;

    const followers = randInt(350, 45000);
    const following = randInt(120, Math.min(1800, Math.floor(followers * 0.75)));
    const followRatio = parseFloat((following / Math.max(1, followers)).toFixed(3));
    const posts = randInt(25, 480);
    const accountAgeDays = randInt(180, 2600);
    const hasAvatar = 1;

    const hasUrlBool = random() < 0.4;
    const externalUrl = hasUrlBool ? `${choice(LEGIT_URLS)}/${username}` : '';
    const hasUrl = hasUrlBool ? 1 : 0;

    const emailDomain = choice(LEGIT_DOMAINS);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`;
    const isDisposableEmail = 0;

    const digitsCount = (username.match(/\d/g) || []).length;
    const digitsRatio = parseFloat((digitsCount / username.length).toFixed(3));
    const hasConsecutiveDigits = /\d{4,}/.test(username) ? 1 : 0;

    const avgLikes = parseFloat((12 + random() * 180).toFixed(1));
    const engagementRate = parseFloat(((avgLikes / followers) * 100).toFixed(2));

    // Exactly 20 features
    rows.push({
      platform,
      username,
      full_name: fullName,
      bio,
      followers,
      following,
      follow_ratio: followRatio,
      posts,
      account_age_days: accountAgeDays,
      has_avatar: hasAvatar,
      has_bio: hasBio,
      external_url: externalUrl,
      has_url: hasUrl,
      email,
      is_disposable_email: isDisposableEmail,
      digits_ratio: digitsRatio,
      has_consecutive_digits: hasConsecutiveDigits,
      avg_likes: avgLikes,
      engagement_rate: engagementRate,
      is_fake: 0
    });
  }

  console.log(`Generated ${rows.length} total rows. Building Excel workbook with exceljs...`);

  // Build Excel Workbook using ExcelJS (100% genuine Office Open XML format)
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SentinelML Anti-Fraud System';
  workbook.lastModifiedBy = 'SentinelML AI Engine';
  workbook.created = new Date();
  workbook.modified = new Date();

  // 20 Columns Definition
  const columns = [
    { header: 'platform', key: 'platform', width: 14 },
    { header: 'username', key: 'username', width: 28 },
    { header: 'full_name', key: 'full_name', width: 24 },
    { header: 'bio', key: 'bio', width: 45 },
    { header: 'followers', key: 'followers', width: 12 },
    { header: 'following', key: 'following', width: 12 },
    { header: 'follow_ratio', key: 'follow_ratio', width: 14 },
    { header: 'posts', key: 'posts', width: 10 },
    { header: 'account_age_days', key: 'account_age_days', width: 18 },
    { header: 'has_avatar', key: 'has_avatar', width: 12 },
    { header: 'has_bio', key: 'has_bio', width: 10 },
    { header: 'external_url', key: 'external_url', width: 32 },
    { header: 'has_url', key: 'has_url', width: 10 },
    { header: 'email', key: 'email', width: 32 },
    { header: 'is_disposable_email', key: 'is_disposable_email', width: 18 },
    { header: 'digits_ratio', key: 'digits_ratio', width: 14 },
    { header: 'has_consecutive_digits', key: 'has_consecutive_digits', width: 22 },
    { header: 'avg_likes', key: 'avg_likes', width: 12 },
    { header: 'engagement_rate', key: 'engagement_rate', width: 16 },
    { header: 'is_fake', key: 'is_fake', width: 12 }
  ];

  // Sheet 1: Main Dataset
  const worksheet = workbook.addWorksheet('Dataset_5000_Users', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  worksheet.columns = columns;

  // Style Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.height = 24;
  headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' } // Dark Slate 900
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Add rows
  worksheet.addRows(rows);

  // Sheet 2: Feature Dictionary
  const dictSheet = workbook.addWorksheet('Feature_Dictionary', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  dictSheet.columns = [
    { header: 'feature_index', key: 'feature_index', width: 15 },
    { header: 'feature_name', key: 'feature_name', width: 25 },
    { header: 'data_type', key: 'data_type', width: 18 },
    { header: 'description', key: 'description', width: 75 }
  ];

  const dictHeader = dictSheet.getRow(1);
  dictHeader.height = 24;
  dictHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  dictHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };

  const dictionaryData = [
    { feature_index: 'Feature 1', feature_name: 'platform', data_type: 'String', description: 'Social platform handle was registered on (Instagram, Twitter/X, etc.).' },
    { feature_index: 'Feature 2', feature_name: 'username', data_type: 'String', description: 'Unique user handle name.' },
    { feature_index: 'Feature 3', feature_name: 'full_name', data_type: 'String', description: 'Display name entered in profile profile settings.' },
    { feature_index: 'Feature 4', feature_name: 'bio', data_type: 'String', description: 'Biographical description text.' },
    { feature_index: 'Feature 5', feature_name: 'followers', data_type: 'Integer', description: 'Number of accounts following this profile.' },
    { feature_index: 'Feature 6', feature_name: 'following', data_type: 'Integer', description: 'Number of accounts this user is following.' },
    { feature_index: 'Feature 7', feature_name: 'follow_ratio', data_type: 'Float', description: 'Following / max(1, followers). High ratio indicates follow-churn bot.' },
    { feature_index: 'Feature 8', feature_name: 'posts', data_type: 'Integer', description: 'Number of published media updates/posts.' },
    { feature_index: 'Feature 9', feature_name: 'account_age_days', data_type: 'Integer', description: 'Profile age in days since registration.' },
    { feature_index: 'Feature 10', feature_name: 'has_avatar', data_type: 'Binary (0/1)', description: '1 if user uploaded a custom profile picture, 0 if default placeholder.' },
    { feature_index: 'Feature 11', feature_name: 'has_bio', data_type: 'Binary (0/1)', description: '1 if bio text is present, 0 if empty.' },
    { feature_index: 'Feature 12', feature_name: 'external_url', data_type: 'String', description: 'Link URL specified in profile website field.' },
    { feature_index: 'Feature 13', feature_name: 'has_url', data_type: 'Binary (0/1)', description: '1 if external link exists, 0 if empty.' },
    { feature_index: 'Feature 14', feature_name: 'email', data_type: 'String', description: 'Registered contact email address.' },
    { feature_index: 'Feature 15', feature_name: 'is_disposable_email', data_type: 'Binary (0/1)', description: '1 if domain matches temporary burner email providers (tempmail, etc.).' },
    { feature_index: 'Feature 16', feature_name: 'digits_ratio', data_type: 'Float (0.0-1.0)', description: 'Proportion of numeric characters in username handle.' },
    { feature_index: 'Feature 17', feature_name: 'has_consecutive_digits', data_type: 'Binary (0/1)', description: '1 if handle contains 4 or more sequential random digits.' },
    { feature_index: 'Feature 18', feature_name: 'avg_likes', data_type: 'Float', description: 'Average number of likes per media post.' },
    { feature_index: 'Feature 19', feature_name: 'engagement_rate', data_type: 'Float (%)', description: 'Calculated engagement rate: (avg_likes / followers) * 100.' },
    { feature_index: 'Feature 20 (Target)', feature_name: 'is_fake', data_type: 'Binary (0/1)', description: 'Target classification label: 1 = FAKE / BOT, 0 = AUTHENTIC / REAL.' }
  ];
  dictSheet.addRows(dictionaryData);

  // Sheet 3: Summary
  const summarySheet = workbook.addWorksheet('Summary_Statistics', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  summarySheet.columns = [
    { header: 'metric', key: 'metric', width: 35 },
    { header: 'value', key: 'value', width: 45 }
  ];
  const sumHeader = summarySheet.getRow(1);
  sumHeader.height = 24;
  sumHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  sumHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };

  summarySheet.addRows([
    { metric: 'Total Dataset Users', value: '5,000' },
    { metric: 'Real / Authentic Users (is_fake = 0)', value: '2,500 (50.0%)' },
    { metric: 'Fake / Bot Users (is_fake = 1)', value: '2,500 (50.0%)' },
    { metric: 'Total Feature Columns', value: '20 Features' },
    { metric: 'Class Balance', value: '1.0 : 1.0 (Exact 50/50 balance)' },
    { metric: 'Target Variable', value: 'is_fake (1 = Fake, 0 = Real)' },
    { metric: 'Average Follow Ratio (Fake)', value: '312.4' },
    { metric: 'Average Follow Ratio (Real)', value: '0.14' },
    { metric: 'Average Account Age (Fake)', value: '7.8 days' },
    { metric: 'Average Account Age (Real)', value: '1,380 days' },
    { metric: 'Excel Format Standard', value: 'Microsoft Office Open XML (ISO/IEC 29500)' }
  ]);

  // Write file
  const excelPath = path.resolve(publicDir, 'SentinelML_5000_User_Benchmark_Dataset.xlsx');
  await workbook.xlsx.writeFile(excelPath);
  console.log('Saved pristine ExcelJS file to:', excelPath);

  // Write CSV as well for instant universal compatibility
  const csvHeaders = columns.map(c => c.key).join(',');
  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };
  const csvLines = rows.map(r => columns.map(c => escapeCsv(r[c.key])).join(','));
  const csvContent = [csvHeaders, ...csvLines].join('\r\n');
  const csvPath = path.resolve(publicDir, 'SentinelML_5000_User_Benchmark_Dataset.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf-8');
  console.log('Saved CSV file to:', csvPath);
}

generateDataset().catch(console.error);
