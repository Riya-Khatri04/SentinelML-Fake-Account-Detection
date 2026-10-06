import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '..', 'public');

const csvPath = path.resolve(publicDir, 'SentinelML_5000_User_Benchmark_Dataset.csv');
let csvContent = fs.readFileSync(csvPath, 'utf-8');

// 1. Ensure CSV starts with UTF-8 BOM (\uFEFF) so Excel opens it with proper column encoding
if (!csvContent.startsWith('\uFEFF')) {
  csvContent = '\uFEFF' + csvContent;
  fs.writeFileSync(csvPath, csvContent, 'utf-8');
  console.log('Added UTF-8 BOM to CSV file.');
}

// 2. Also create Microsoft Excel XML Spreadsheet 2003 (.xls / .xml)
// This format is 100% supported by every single version of Microsoft Excel without zip/openxml issues
console.log('Generating Microsoft Excel XML Spreadsheet (.xls)...');

const lines = csvContent.replace(/^\uFEFF/, '').trim().split('\r\n');
const parseCsvLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

const escapeXml = (unsafe) => {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const headers = parseCsvLine(lines[0]);
let xmlRows = '';

// Header row
xmlRows += '   <Row ss:StyleID="sHeader">\n';
headers.forEach((h) => {
  xmlRows += `    <Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
});
xmlRows += '   </Row>\n';

// Data rows
for (let i = 1; i < lines.length; i++) {
  const cells = parseCsvLine(lines[i]);
  xmlRows += '   <Row>\n';
  cells.forEach((val, idx) => {
    // Numeric features: followers, following, follow_ratio, posts, account_age_days, digits_ratio, avg_likes, engagement_rate, is_fake, has_*
    const isNum = idx >= 4 && !isNaN(Number(val)) && val.trim() !== '';
    if (isNum) {
      xmlRows += `    <Cell><Data ss:Type="Number">${val}</Data></Cell>\n`;
    } else {
      xmlRows += `    <Cell><Data ss:Type="String">${escapeXml(val)}</Data></Cell>\n`;
    }
  });
  xmlRows += '   </Row>\n';
}

const excelXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="sHeader">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Dataset_5000_Users">
  <Table ss:ExpandedColumnCount="20" ss:ExpandedRowCount="${lines.length}" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="15">
${xmlRows}  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>1</SplitHorizontal>
   <TopRowBottomPane>1</TopRowBottomPane>
   <ActivePane>2</ActivePane>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;

const xlsPath = path.resolve(publicDir, 'SentinelML_5000_User_Benchmark_Dataset.xls');
fs.writeFileSync(xlsPath, excelXml, 'utf-8');
console.log('Successfully written Excel XML (.xls) to:', xlsPath);
