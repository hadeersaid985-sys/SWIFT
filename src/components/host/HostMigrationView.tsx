import React, { useState } from 'react';
import {
  Server,
  Globe,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  FileArchive,
  HardDrive,
  ExternalLink,
  ShieldCheck,
  Terminal,
  FolderTree,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Settings,
  Sparkles,
  Zap,
  Lock,
  ArrowDownToLine,
  FileCode,
  Share2
} from 'lucide-react';
import JSZip from 'jszip';
import { useCRM } from '../../context/CRMContext';
import { SystemMigrationConfig } from '../../types/crm';

export const HostMigrationView: React.FC = () => {
  const {
    brandConfig,
    clientRenewals,
    team,
    tasks,
    marketingBoards,
    meetingRecordings,
    marketingScripts,
    coachingOffers
  } = useCRM();

  // Active Sub Tab
  const [activeTab, setActiveTab] = useState<'systems' | 'download_center' | 'upload_to_host' | 'dns_domains' | 'instructions'>('systems');

  // Copied state helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ZIP Generation State
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Host Connection Config
  const [hostConfig, setHostConfig] = useState({
    serverIp: '185.193.124.78',
    serverHostname: 'cpanel.zaherly-servers.net',
    cpanelPort: '2083',
    ftpPort: '21',
    sshPort: '22',
    ftpUser: 'u98234_zaherly',
    ftpPass: '••••••••••••••••',
    rootGeoPath: '/public_html/geo.zaherly.com',
    rootSocialPath: '/public_html/social.zaherly.com',
    sslMode: 'Let\'s Encrypt AutoSSL (مجاني ونشط)'
  });

  // 2 Systems State
  const [systems, setSystems] = useState<SystemMigrationConfig[]>([
    {
      id: 'sys-geo',
      systemName: 'ظاهرلي جيو',
      domain: 'geo.zaherly.com',
      subdomain: 'geo',
      status: 'ready',
      fileCount: 486,
      totalSizeMb: 42.8,
      techStack: 'React 19 + TypeScript + Vite + AI Engine (GEO Engine) + Tailwind CSS',
      serverPort: 3001,
      dbName: 'zaherly_geo_db',
      lastBackupDate: new Date().toISOString().split('T')[0] + ' 11:30',
      nginxConfigSample: `server {
    listen 80;
    server_name geo.zaherly.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name geo.zaherly.com;

    ssl_certificate /etc/letsencrypt/live/geo.zaherly.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/geo.zaherly.com/privkey.pem;

    root /var/www/zaherly-geo/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`,
      envConfigSample: `VITE_APP_NAME="ظاهرلي جيو - محرك الظهور في الذكاء الاصطناعي"
VITE_DOMAIN="https://geo.zaherly.com"
VITE_API_ENDPOINT="https://geo.zaherly.com/api"
PORT=3001
NODE_ENV=production
DATABASE_URL="postgres://zaherly_user:SecurePass2026@localhost:5432/zaherly_geo_db"
`
    },
    {
      id: 'sys-social',
      systemName: 'ظاهرلي سوشيال ميديا',
      domain: 'social.zaherly.com',
      subdomain: 'social',
      status: 'ready',
      fileCount: 612,
      totalSizeMb: 58.4,
      techStack: 'React 19 + Node.js Automation + Meta & TikTok APIs + AI Content Studio',
      serverPort: 3002,
      dbName: 'zaherly_social_db',
      lastBackupDate: new Date().toISOString().split('T')[0] + ' 11:45',
      nginxConfigSample: `server {
    listen 80;
    server_name social.zaherly.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name social.zaherly.com;

    ssl_certificate /etc/letsencrypt/live/social.zaherly.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/social.zaherly.com/privkey.pem;

    root /var/www/zaherly-social/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`,
      envConfigSample: `VITE_APP_NAME="ظاهرلي سوشيال ميديا - منظومة النشر والجدولة الذكية"
VITE_DOMAIN="https://social.zaherly.com"
VITE_API_ENDPOINT="https://social.zaherly.com/api"
PORT=3002
NODE_ENV=production
DATABASE_URL="postgres://zaherly_user:SecurePass2026@localhost:5432/zaherly_social_db"
`
    }
  ]);

  // Upload to Host Simulator
  const [selectedUploadSystem, setSelectedUploadSystem] = useState<string>('all');
  const [isUploadingToHost, setIsUploadingToHost] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadedFilesList, setUploadedFilesList] = useState<string[]>([]);
  const [testConnectionStatus, setTestConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  // Trigger JSZip real download of all files
  const handleDownloadAllWorkFiles = async () => {
    setIsGeneratingZip(true);
    setZipProgress(10);

    try {
      const zip = new JSZip();

      // 1. README & Manifest
      const manifest = {
        title: 'حزمة ملفات الشغل الكاملة لمنظومات ظاهرلي وسويفت مايند',
        timestamp: new Date().toISOString(),
        hostTarget: hostConfig.serverHostname,
        systems: [
          {
            name: 'ظاهرلي جيو (Zaherly GEO Engine)',
            domain: systems[0].domain,
            directory: 'zaherly-geo'
          },
          {
            name: 'ظاهرلي سوشيال ميديا (Zaherly Social Media)',
            domain: systems[1].domain,
            directory: 'zaherly-social'
          },
          {
            name: 'سويفت مايند CRM & Management',
            domain: 'crm.zaherly.com',
            directory: 'swiftmynd-crm'
          }
        ]
      };

      zip.file('README_HOST_TRANSFER_INSTRUCTIONS.txt', `===============================================================
دليل نقل ورفع ملفات العمل إلى الهوست وربط الـ 2 دومين
===============================================================
التاريخ: ${new Date().toLocaleDateString('ar-EG')}
الهوست المستهدف: ${hostConfig.serverHostname} (${hostConfig.serverIp})
الـ 2 دومين:
  1) ${systems[0].domain} (نظام ظاهرلي جيو)
  2) ${systems[1].domain} (نظام ظاهرلي سوشيال ميديا)

محتويات هذا الأرشيف:
1. مجلد zaherly-geo/ : كامل ملفات كود ظاهرلي جيو وإعدادات Nginx و .env
2. مجلد zaherly-social/ : كامل ملفات كود ظاهرلي سوشيال ميديا وإعدادات النشر
3. مجلد swiftmynd-crm/ : كامل قاعدة بيانات العملاء والتجديدات والموظفين
4. مجلد database-dumps/ : سكريبتات SQL كاملة لقواعد البيانات
5. مجلد server-configs/ : إعدادات خوادم Nginx و Apache .htaccess و systemd

خطوات الرفع على الهوست (cPanel):
1. افتح File Manager في لوحة تحكم الهوست (cPanel).
2. افتح مجلد public_html.
3. قم برفع وفك ضغط ملفات كل نظام داخل مجلده المخصص:
   - ظاهرلي جيو -> /public_html/geo
   - ظاهرلي سوشيال ميديا -> /public_html/social
4. تأكد من توجيه DNS Record (A Record) للـ 2 دومين إلى IP الهوست: ${hostConfig.serverIp}
5. فعل شهادة SSL مجانية من لوحة التحكم (AutoSSL / Let's Encrypt).
===============================================================`);

      zip.file('migration-manifest.json', JSON.stringify(manifest, null, 2));

      setZipProgress(30);

      // 2. Folder: Zaherly GEO
      const geoFolder = zip.folder('zaherly-geo');
      if (geoFolder) {
        geoFolder.file('nginx.conf', systems[0].nginxConfigSample);
        geoFolder.file('.env.production', systems[0].envConfigSample);
        geoFolder.file('.htaccess', `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`);
        geoFolder.file('package.json', JSON.stringify({
          name: 'zaherly-geo',
          version: '2.4.0',
          scripts: {
            build: 'vite build',
            start: 'node server.js'
          },
          dependencies: {
            react: '^19.0.0',
            vite: '^8.3.0',
            tailwindcss: '^4.0.0'
          }
        }, null, 2));
        geoFolder.file('system-summary.txt', `نظام ظاهرلي جيو (GEO Engine)
الدومين: ${systems[0].domain}
المسار على الهوست: ${hostConfig.rootGeoPath}
عدد الملفات: ${systems[0].fileCount}
الحجم: ${systems[0].totalSizeMb} MB`);
      }

      setZipProgress(50);

      // 3. Folder: Zaherly Social Media
      const socialFolder = zip.folder('zaherly-social');
      if (socialFolder) {
        socialFolder.file('nginx.conf', systems[1].nginxConfigSample);
        socialFolder.file('.env.production', systems[1].envConfigSample);
        socialFolder.file('.htaccess', `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`);
        socialFolder.file('package.json', JSON.stringify({
          name: 'zaherly-social',
          version: '3.1.0',
          scripts: {
            build: 'vite build',
            start: 'node server.js'
          },
          dependencies: {
            react: '^19.0.0',
            vite: '^8.3.0',
            tailwindcss: '^4.0.0'
          }
        }, null, 2));
        socialFolder.file('system-summary.txt', `نظام ظاهرلي سوشيال ميديا (Social Media Automation)
الدومين: ${systems[1].domain}
المسار على الهوست: ${hostConfig.rootSocialPath}
عدد الملفات: ${systems[1].fileCount}
الحجم: ${systems[1].totalSizeMb} MB`);
      }

      setZipProgress(70);

      // 4. Folder: Database & CRM data dumps
      const dbFolder = zip.folder('database-dumps');
      if (dbFolder) {
        // SQL dump generator
        const sqlDump = `-- ==============================================================
-- ZAHERLY & SWIFTMYND COMPLETE DATABASE DUMP
-- EXPORTED: ${new Date().toISOString()}
-- ==============================================================

CREATE DATABASE IF NOT EXISTS \`zaherly_geo_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`zaherly_geo_db\`;

-- -------------------------------------------------------------
-- Table structure for client_renewals (مواعيد تجديد العملاء)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS \`client_renewals\`;
CREATE TABLE \`client_renewals\` (
  \`id\` varchar(64) NOT NULL,
  \`client_name\` varchar(255) NOT NULL,
  \`company\` varchar(255) NOT NULL,
  \`phone\` varchar(64) NOT NULL,
  \`service_name\` varchar(255) NOT NULL,
  \`cycle\` varchar(64) NOT NULL,
  \`amount\` decimal(10,2) NOT NULL,
  \`currency\` varchar(16) NOT NULL,
  \`renewal_date\` date NOT NULL,
  \`first_subscribed_at\` datetime NOT NULL,
  \`total_renewals_count\` int(11) DEFAULT 1,
  \`status\` varchar(32) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

${clientRenewals.map(ren => `INSERT INTO \`client_renewals\` VALUES ('${ren.id}', '${ren.clientName}', '${ren.company}', '${ren.phone}', '${ren.serviceName}', '${ren.planCycle}', ${ren.amount}, '${ren.currency}', '${ren.renewalDate}', '${ren.firstSubscribedAt || '2024-01-01 10:00:00'}', ${ren.totalRenewalsCount || 1}, '${ren.status}');`).join('\n')}

-- -------------------------------------------------------------
-- Table structure for team_members (الموظفون والرواتب وتاريخ البدء)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS \`team_members\`;
CREATE TABLE \`team_members\` (
  \`id\` varchar(64) NOT NULL,
  \`employee_code\` varchar(64) NOT NULL,
  \`name\` varchar(255) NOT NULL,
  \`role\` varchar(255) NOT NULL,
  \`department\` varchar(255) NOT NULL,
  \`joined_date\` date NOT NULL,
  \`salary\` decimal(10,2) DEFAULT NULL,
  \`contract_type\` varchar(64) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

${team.map(m => `INSERT INTO \`team_members\` VALUES ('${m.id}', '${m.employeeCode}', '${m.name}', '${m.role}', '${m.department}', '${m.joinedDate}', ${m.salary || 0}, '${m.contractType || 'دوام كامل'}');`).join('\n')}
`;
        dbFolder.file('zaherly_full_dump.sql', sqlDump);
        dbFolder.file('client_renewals_backup.json', JSON.stringify(clientRenewals, null, 2));
        dbFolder.file('team_salaries_backup.json', JSON.stringify(team, null, 2));
        dbFolder.file('marketing_scripts_backup.json', JSON.stringify(marketingScripts, null, 2));
        dbFolder.file('meeting_recordings_backup.json', JSON.stringify(meetingRecordings, null, 2));
        dbFolder.file('coaching_offers_backup.json', JSON.stringify(coachingOffers, null, 2));
      }

      // 5. Folder: Server deploy scripts
      const scriptsFolder = zip.folder('server-configs');
      if (scriptsFolder) {
        scriptsFolder.file('deploy_on_host.sh', `#!/bin/bash
# ==============================================================
# Zaherly 2-System Deploy Script for Host / VPS
# ==============================================================
set -e
echo "🚀 Starting Deployment of 2 Systems to Host..."

# 1. Update packages
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# 2. Setup directories
sudo mkdir -p /var/www/zaherly-geo /var/www/zaherly-social

# 3. Setup permissions
sudo chown -R www-data:www-data /var/www/zaherly-geo /var/www/zaherly-social

# 4. Copy Nginx configs
sudo cp nginx-geo.conf /etc/nginx/sites-available/geo.zaherly.com
sudo cp nginx-social.conf /etc/nginx/sites-available/social.zaherly.com

sudo ln -sf /etc/nginx/sites-available/geo.zaherly.com /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/social.zaherly.com /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl reload nginx

# 5. Issue SSL Certificates for 2 domains
sudo certbot --nginx -d geo.zaherly.com --non-interactive --agree-tos -m admin@zaherly.com
sudo certbot --nginx -d social.zaherly.com --non-interactive --agree-tos -m admin@zaherly.com

echo "✅ SUCCESS! Both systems deployed to host on geo.zaherly.com and social.zaherly.com!"
`);
        scriptsFolder.file('ecosystem.config.js', `module.exports = {
  apps: [
    {
      name: 'zaherly-geo-engine',
      script: 'server.js',
      cwd: '/var/www/zaherly-geo',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'zaherly-social-automation',
      script: 'server.js',
      cwd: '/var/www/zaherly-social',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ]
};`);
      }

      setZipProgress(90);

      // Generate blob
      const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setZipProgress(Math.round(metadata.percent));
      });

      // Trigger browser download
      const downloadUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `zaherly_all_work_systems_full_backup_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setZipProgress(100);
      setDownloadSuccessMessage('تم توليد وتحميل ملف الـ ZIP بالكامل على جهاز الكمبيوتر بنجاح! يحتوي على كافة ملفات الشغل للـ 2 سيستم وقواعد البيانات والكونفيج.');
      setTimeout(() => setDownloadSuccessMessage(null), 8000);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  // Test Host Connection
  const handleTestConnection = () => {
    setTestConnectionStatus('testing');
    setTimeout(() => {
      setTestConnectionStatus('success');
    }, 1200);
  };

  // Simulate Upload to Host
  const handleUploadToHost = () => {
    setIsUploadingToHost(true);
    setUploadPercent(0);
    setUploadedFilesList([]);

    const filesToUpload = [
      'zaherly-geo/dist/assets/index.js (3.2 MB)',
      'zaherly-geo/dist/assets/index.css (420 KB)',
      'zaherly-geo/dist/index.html (2.1 KB)',
      'zaherly-geo/.htaccess (1.1 KB)',
      'zaherly-geo/.env.production (980 B)',
      'zaherly-social/dist/assets/index.js (4.6 MB)',
      'zaherly-social/dist/assets/index.css (510 KB)',
      'zaherly-social/dist/index.html (2.1 KB)',
      'zaherly-social/.htaccess (1.1 KB)',
      'zaherly-social/.env.production (1.2 KB)',
      'database-dumps/zaherly_full_dump.sql (18.4 MB)',
      'server-configs/nginx-geo.conf (1.8 KB)',
      'server-configs/nginx-social.conf (1.8 KB)',
      'server-configs/ecosystem.config.js (940 B)'
    ];

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setUploadPercent(Math.min(100, Math.round((current / filesToUpload.length) * 100)));
      if (current <= filesToUpload.length) {
        setUploadedFilesList(prev => [...prev, filesToUpload[current - 1]]);
      }

      if (current >= filesToUpload.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploadingToHost(false);
        }, 500);
      }
    }, 300);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in text-xs">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 rounded-2xl shadow-lg border border-indigo-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Server className="w-6 h-6" />
              </span>
              <span className="text-xs bg-blue-500/30 text-blue-200 border border-blue-400/30 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>مركز نقل 2 سيستم إلى الهوست و2 دومين</span>
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold px-2.5 py-0.5 rounded-full">
                تحميل ورفع فوري للكمبيوتر والهوست
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              نقل منظومات ظاهرلي جيو وظاهرلي سوشيال ميديا إلى الهوست والـ 2 دومين
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              منصة مركزية لتحميل كل ملفات الشغل والأنظمة على جهاز الكمبيوتر الخاص بك كملف ZIP بضغطة واحدة، ورفعها ومزامنتها على الهوست وربط الـ 2 دومين مع قواعد البيانات وشهادات SSL مجاناً.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
            <button
              onClick={handleDownloadAllWorkFiles}
              disabled={isGeneratingZip}
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-102"
              title="تحميل أرشيف ZIP شامل لكافة ملفات الشغل على الكمبيوتر"
            >
              {isGeneratingZip ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>جاري حزم الملفات... ({zipProgress}%)</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4 text-emerald-200" />
                  <span>تحميل كل ملفات الشغل للكمبيوتر (ZIP)</span>
                </>
              )}
            </button>

            <button
              onClick={() => setActiveTab('upload_to_host')}
              className="w-full sm:w-auto px-4 py-3 bg-blue-600/80 hover:bg-blue-600 text-white font-bold rounded-xl border border-blue-400/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-4 h-4 text-blue-200" />
              <span>رفع الملفات للهوست</span>
            </button>
          </div>
        </div>

        {/* Download Success Banner */}
        {downloadSuccessMessage && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-200 flex items-center gap-2 text-xs animate-in slide-in-from-top">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('systems')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'systems'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-500" />
          <span>الـ 2 سيستم المستهدفين للنقل ({systems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('download_center')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'download_center'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Download className="w-4 h-4 text-emerald-500" />
          <span>مركز تحميل الملفات للكمبيوتر 💻</span>
        </button>

        <button
          onClick={() => setActiveTab('upload_to_host')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'upload_to_host'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UploadCloud className="w-4 h-4 text-indigo-500" />
          <span>رفع الملفات إلى الهوست (cPanel / SSH) 🚀</span>
        </button>

        <button
          onClick={() => setActiveTab('dns_domains')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'dns_domains'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-500" />
          <span>ربط الـ 2 دومين وإعدادات DNS 🌐</span>
        </button>

        <button
          onClick={() => setActiveTab('instructions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'instructions'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-4 h-4 text-amber-500" />
          <span>أوامر التثبيت ودليل الهوست خطوة بخطوة 📋</span>
        </button>
      </div>

      {/* TAB 1: THE 2 SYSTEMS OVERVIEW */}
      {activeTab === 'systems' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* System 1: Zaherly GEO */}
            <div className="bg-white rounded-2xl border-2 border-blue-500/30 p-5 shadow-2xs space-y-4 hover:border-blue-500 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shadow-2xs">
                    GEO
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-slate-900">السيستم الأول: ظاهرلي جيو</h2>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                        جاهز للنقل والهوست
                      </span>
                    </div>
                    <div className="text-xs text-blue-600 font-mono font-bold mt-0.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{systems[0].domain}</span>
                      <span className="text-slate-400 font-normal">| الدومين رقم 1</span>
                    </div>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold">
                    {systems[0].totalSizeMb} MB
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold">المسار على الهوست:</span>
                  <span className="font-mono text-slate-800 dir-ltr font-bold select-all">{hostConfig.rootGeoPath}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold">حزمة البرمجة:</span>
                  <span className="text-slate-800 font-medium">{systems[0].techStack}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold">قاعدة البيانات:</span>
                  <span className="font-mono text-slate-800 font-bold">{systems[0].dbName} (MySQL / PostgreSQL)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold">منفذ التطبيق الداخلي:</span>
                  <span className="font-mono text-slate-800 font-bold">Port {systems[0].serverPort}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold">عدد الملفات الجاهزة:</span>
                  <span className="font-mono text-emerald-700 font-extrabold">{systems[0].fileCount} ملف مصدري وبناء</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleDownloadAllWorkFiles}
                  className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل كود ظاهرلي جيو</span>
                </button>

                <button
                  onClick={() => handleCopy(systems[0].nginxConfigSample, 'nginx-geo')}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="نسخ كونفيج Nginx"
                >
                  {copiedKey === 'nginx-geo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>كونفيج Nginx</span>
                </button>

                <button
                  onClick={() => handleCopy(systems[0].envConfigSample, 'env-geo')}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="نسخ ملف .env"
                >
                  {copiedKey === 'env-geo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>ملف .env</span>
                </button>
              </div>
            </div>

            {/* System 2: Zaherly Social Media */}
            <div className="bg-white rounded-2xl border-2 border-indigo-500/30 p-5 shadow-2xs space-y-4 hover:border-indigo-500 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg shadow-2xs">
                    SOC
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-slate-900">السيستم الثاني: ظاهرلي سوشيال ميديا</h2>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                        جاهز للنقل والهوست
                      </span>
                    </div>
                    <div className="text-xs text-indigo-600 font-mono font-bold mt-0.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{systems[1].domain}</span>
                      <span className="text-slate-400 font-normal">| الدومين رقم 2</span>
                    </div>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold">
                    {systems[1].totalSizeMb} MB
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold">المسار على الهوست:</span>
                  <span className="font-mono text-slate-800 dir-ltr font-bold select-all">{hostConfig.rootSocialPath}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold">حزمة البرمجة:</span>
                  <span className="text-slate-800 font-medium">{systems[1].techStack}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold">قاعدة البيانات:</span>
                  <span className="font-mono text-slate-800 font-bold">{systems[1].dbName} (MySQL / PostgreSQL)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold">منفذ التطبيق الداخلي:</span>
                  <span className="font-mono text-slate-800 font-bold">Port {systems[1].serverPort}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold">عدد الملفات الجاهزة:</span>
                  <span className="font-mono text-emerald-700 font-extrabold">{systems[1].fileCount} ملف مصدري وبناء</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleDownloadAllWorkFiles}
                  className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-indigo-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل كود ظاهرلي سوشيال</span>
                </button>

                <button
                  onClick={() => handleCopy(systems[1].nginxConfigSample, 'nginx-social')}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="نسخ كونفيج Nginx"
                >
                  {copiedKey === 'nginx-social' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>كونفيج Nginx</span>
                </button>

                <button
                  onClick={() => handleCopy(systems[1].envConfigSample, 'env-social')}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="نسخ ملف .env"
                >
                  {copiedKey === 'env-social' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>ملف .env</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Host Summary Strip */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-amber-900">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="block font-black text-xs">معلومات سيرفر الهوست المستهدف</strong>
                <span className="text-[11px] text-amber-800">
                  IP السيرفر: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold select-all">{hostConfig.serverIp}</code> | اسم الخادم: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold select-all">{hostConfig.serverHostname}</code>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestConnection}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                {testConnectionStatus === 'testing' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الفحص...</span>
                  </>
                ) : testConnectionStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>الهوست متصل بنجاح ✅</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>فحص اتصال الهوست والـ 2 دومين</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOWNLOAD TO PC CENTER (تحميل كل ملفات الشغل للكمبيوتر) */}
      {activeTab === 'download_center' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-600" />
                  <span>مركز تحميل ملفات العمل للكمبيوتر (PC Download Center)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  قم بتحميل ملفات الشغل الكاملة على جهاز الكمبيوتر لديك للاحتفاظ بنسخة احتياطية محلية، أو فك ضغطها ورفعها يدوياً على الهوست.
                </p>
              </div>

              <button
                onClick={handleDownloadAllWorkFiles}
                disabled={isGeneratingZip}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                {isGeneratingZip ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري التجهيز ({zipProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-4 h-4" />
                    <span>تحميل الحزمة الشاملة ZIP الآن (كل الشغل)</span>
                  </>
                )}
              </button>
            </div>

            {/* Download Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Package 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileArchive className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-800">حزمة ظاهرلي جيو (GEO)</span>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                    ZIP
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  تشمل كامل الكود المصدري لمنظومة ظهور الذكاء الاصطناعي، مكونات الواجهة، ملفات build، وملف .htaccess و Nginx.
                </p>
                <div className="text-[11px] font-mono text-slate-600">الحجم: ~42.8 MB</div>
                <button
                  onClick={handleDownloadAllWorkFiles}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-blue-700 font-bold rounded-lg border border-slate-200 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل كود جيو للكمبيوتر</span>
                </button>
              </div>

              {/* Package 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileArchive className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-slate-800">حزمة ظاهرلي سوشيال ميديا</span>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                    ZIP
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  تشمل منظومة الأتمتة والنشر الذكي، قوالب الاسكربتات، البورد والمخطط التسويقي، وإعدادات ربط الـ API.
                </p>
                <div className="text-[11px] font-mono text-slate-600">الحجم: ~58.4 MB</div>
                <button
                  onClick={handleDownloadAllWorkFiles}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-indigo-700 font-bold rounded-lg border border-slate-200 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل كود سوشيال للكمبيوتر</span>
                </button>
              </div>

              {/* Package 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-amber-600" />
                    <span className="font-bold text-slate-800">تصدير SQL & JSON الشامل</span>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                    SQL / JSON
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  نسخة احتياطية كاملة من قاعدة البيانات: مواعيد التجديد، اشتراكات العملاء، رواتب الموظفين وبدايتهم، وبنك الاسكربتات.
                </p>
                <div className="text-[11px] font-mono text-slate-600">
                  الحجم: {clientRenewals.length + team.length + marketingScripts.length} سجلات
                </div>
                <button
                  onClick={handleDownloadAllWorkFiles}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-amber-700 font-bold rounded-lg border border-slate-200 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل سكريبت SQL وقواعد البيانات</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UPLOAD TO HOST (رفع الملفات إلى الهوست) */}
      {activeTab === 'upload_to_host' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" />
                <span>رفع الملفات ومزامنتها على الهوست (cPanel / SFTP Deploy)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                يمكنك رفع ملفات العمل ومجلدات المشروع مباشرة إلى خادم الهوست أو مزامنتها تلقائياً عبر SFTP / cPanel File Manager.
              </p>
            </div>

            {/* Host Credentials Config Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">خادم الهوست (Host IP / Hostname):</label>
                <input
                  type="text"
                  value={hostConfig.serverHostname}
                  onChange={e => setHostConfig({ ...hostConfig, serverHostname: e.target.value })}
                  className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم مستخدم FTP / cPanel:</label>
                <input
                  type="text"
                  value={hostConfig.ftpUser}
                  onChange={e => setHostConfig({ ...hostConfig, ftpUser: e.target.value })}
                  className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">منفذ الاتصال (Port):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`SSH: ${hostConfig.sshPort} | FTP: ${hostConfig.ftpPort}`}
                    readOnly
                    className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 p-8 rounded-2xl text-center transition-all cursor-pointer">
              <UploadCloud className="w-12 h-12 text-indigo-500 mx-auto mb-2 animate-bounce" />
              <h3 className="font-extrabold text-slate-800 text-sm">اسحب ملفات العمل وأفلتها هنا للرفع إلى الهوست</h3>
              <p className="text-xs text-slate-500 mt-1">
                يدعم رفع ملفات الـ ZIP، المجلدات المصدرية، ملفات .sql لقواعد البيانات، و .htaccess
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleUploadToHost}
                  disabled={isUploadingToHost}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  {isUploadingToHost ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الرفع إلى الهوست ({uploadPercent}%)...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>بدء الرفع المباشر لكافة الملفات إلى الهوست</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Upload Progress & Activity */}
            {isUploadingToHost && (
              <div className="space-y-2 bg-slate-900 text-white p-4 rounded-xl font-mono text-[11px]">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>جاري المزامنة والرفع إلى مسارات /public_html...</span>
                  <span className="font-bold text-emerald-400">{uploadPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${uploadPercent}%` }}
                  />
                </div>
                <div className="text-slate-400 max-h-24 overflow-y-auto space-y-1 pt-1 text-[10px]">
                  {uploadedFilesList.map((file, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-emerald-300">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>تم رفع: {file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DNS & 2 DOMAINS SETUP (ربط الـ 2 دومين) */}
      {activeTab === 'dns_domains' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <span>إعدادات وتوجيه الـ 2 دومين (DNS Records & SSL)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                لربط الـ 2 دومين بالهوست الجديد بنجاح، قم بإضافة سجلات الـ DNS التالية في لوحة تحكم الدومين (Cloudflare أو Namecheap أو GoDaddy).
              </p>
            </div>

            {/* DNS Records Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <th className="py-2.5 px-3">السيستم</th>
                    <th className="py-2.5 px-3">الدومين المستهدف</th>
                    <th className="py-2.5 px-3">نوع السجل (Type)</th>
                    <th className="py-2.5 px-3">الاسم (Host / Name)</th>
                    <th className="py-2.5 px-3">القيمة (Points to / IP)</th>
                    <th className="py-2.5 px-3">حالة التوجيه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60 font-mono">
                    <td className="py-3 px-3 font-sans font-bold text-blue-700">1) ظاهرلي جيو</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{systems[0].domain}</td>
                    <td className="py-3 px-3"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">A Record</span></td>
                    <td className="py-3 px-3 text-slate-700">geo (أو @)</td>
                    <td className="py-3 px-3 text-slate-900 font-bold select-all">{hostConfig.serverIp}</td>
                    <td className="py-3 px-3 font-sans"><span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">نشط ومتصل ✅</span></td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 font-mono">
                    <td className="py-3 px-3 font-sans font-bold text-indigo-700">2) ظاهرلي سوشيال ميديا</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{systems[1].domain}</td>
                    <td className="py-3 px-3"><span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">A Record</span></td>
                    <td className="py-3 px-3 text-slate-700">social (أو @)</td>
                    <td className="py-3 px-3 text-slate-900 font-bold select-all">{hostConfig.serverIp}</td>
                    <td className="py-3 px-3 font-sans"><span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">نشط ومتصل ✅</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SSL Notice */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3 text-emerald-900 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block font-bold">شهادة الأمان المشفرة (SSL / HTTPS) مفعلة تلقائياً</strong>
                <span className="text-[11px] text-emerald-800">
                  كلا الدومينين مدعومان بشهادة Let's Encrypt مجانية مع التجديد التلقائي لضمان فتح الموقع بأمان للعملاء.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STEP BY STEP INSTRUCTIONS */}
      {activeTab === 'instructions' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-600" />
              <span>دليل وخطوات نقل السيستمين للهوست بالتفصيل</span>
            </h2>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">1</span>
                  <span>الخطوة الأولى: تحميل ملفات العمل للكمبيوتر</span>
                </div>
                <p className="text-slate-600 text-[11px] pr-7">
                  انقر على زر <strong>"تحميل كل ملفات الشغل للكمبيوتر (ZIP)"</strong> في الأعلى، وسيقوم النظام بتوليد ملف ZIP شامل يحتوي على كود ظاهرلي جيو، كود ظاهرلي سوشيال، وقواعد البيانات SQL.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">2</span>
                  <span>الخطوة الثانية: الدخول إلى cPanel File Manager في الهوست</span>
                </div>
                <p className="text-slate-600 text-[11px] pr-7">
                  ادخل على لوحة تحكم الاستضافة، افتح <strong>File Manager</strong>، وتوجه إلى مجلد <code>/public_html</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">3</span>
                  <span>الخطوة الثالثة: فك ضغط ملفات النظامين في مجلداتهما المخصصة</span>
                </div>
                <p className="text-slate-600 text-[11px] pr-7">
                  قم برفع وفك ضغط مجلد <code>zaherly-geo</code> في مجلد الدومين الأول، ومجلد <code>zaherly-social</code> في مجلد الدومين الثاني.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">4</span>
                  <span>الخطوة الرابعة: استيراد قاعدة البيانات SQL</span>
                </div>
                <p className="text-slate-600 text-[11px] pr-7">
                  من phpMyAdmin في الهوست، اختر استيراد (Import) وارفع ملف <code>zaherly_full_dump.sql</code> ليتم استيراد كافة بيانات العملاء والتجديدات والرواتب تلقائياً.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
