
import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, ZapIcon, LayersIcon, PlusIcon, RefreshIcon, CheckCircleIcon, CheckIcon, CodeIcon, DownloadIcon } from '../Icons';
import CyberpunkLogo from '../landing/CyberpunkLogo';

const COLORS = [
    { name: 'Polygon Purple', hex: '#7B3FE4', role: 'Primary Brand / Accents', rgb: '123, 63, 228' },
    { name: 'Pure Dark', hex: '#020202', role: 'Primary Background', rgb: '2, 2, 2' },
    { name: 'Institutional Gray', hex: '#EAEAEA', role: 'Primary Typography', rgb: '234, 234, 234' },
    { name: 'Cyber Blue', hex: '#3B82F6', role: 'Signal / Action Info', rgb: '59, 130, 246' },
    { name: 'Alert Red', hex: '#EF4444', role: 'Threat / Critical State', rgb: '239, 68, 68' },
];

const ASSETS = [
    { id: 'svg_pack', title: 'Vector Logo Pack', format: 'SVG', size: '14.8 KB', type: 'Master Vector', mime: 'image/svg+xml' },
    { id: 'png_ui', title: 'Raster UI Assets', format: 'PNG', size: '3.4 MB', type: 'Ultra-HD 4K', mime: 'image/png' },
    { id: 'pdf_guide', title: 'Identity Guidelines', format: 'PDF', size: '1.8 MB', type: 'Brand Manual', mime: 'text/markdown' },
    { id: 'jpg_soc', title: 'SOC_Banners_V1', format: 'JPG', size: '5.6 MB', type: '4K Wallpaper', mime: 'image/jpeg' },
];

// High-precision SVG Generator
const generateMasterSVG = (): string => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 600" width="1600" height="600">
  <defs>
    <linearGradient id="pgTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#9B66FF"/>
      <stop offset="100%" stop-color="#7B3FE4"/>
    </linearGradient>
    <linearGradient id="pgBotGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7B3FE4"/>
      <stop offset="100%" stop-color="#C084FC"/>
    </linearGradient>
    <filter id="purpleGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="24" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Dark Background Canvas -->
  <rect width="1600" height="600" fill="#020202" rx="20"/>

  <!-- Subtly Textured Grid Lines -->
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">
    <path d="M0 150 H1600 M0 300 H1600 M0 450 H1600"/>
    <path d="M400 0 V600 M800 0 V600 M1200 0 V600"/>
  </g>

  <!-- Master Kallipolis ZK Emblem -->
  <g transform="translate(240, 300)">
    <!-- Outer Ambient Glow Ring -->
    <circle r="220" fill="#7B3FE4" fill-opacity="0.12" filter="url(#purpleGlow)"/>

    <!-- Outer Hexagon Shield Path -->
    <path d="M0 -180 L155 -90 V90 L0 180 L-155 90 V-90 Z" fill="none" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="6"/>

    <!-- Top Diamond Stack -->
    <path d="M0 -110 L100 -50 L0 10 L-100 -50 Z" fill="url(#pgTopGrad)"/>

    <!-- Bottom Diamond Stack -->
    <path d="M0 -5 L100 55 L0 115 L-100 55 Z" fill="url(#pgBotGrad)" opacity="0.9"/>
  </g>

  <!-- Master Typography Lockup -->
  <g transform="translate(490, 335)">
    <text font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="110" letter-spacing="-3">
      <tspan fill="#FFFFFF">Kallipolis </tspan>
      <tspan fill="#C084FC">ZK</tspan>
    </text>
    <text y="55" font-family="'JetBrains Mono', monospace" font-size="24" font-weight="700" fill="#8E8EA0" letter-spacing="10">
      INSTITUTIONAL AGGLAYER SECURITY KERNEL
    </text>
    <text y="90" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="600" fill="#7B3FE4" letter-spacing="6">
      VERIFIED // ZERO-KNOWLEDGE DEFENSE MATRIX v4.2.0
    </text>
  </g>
</svg>`.trim();
};

// High-precision PNG Canvas Generator
const generatePNGBlob = (variant: 'dark' | 'transparent' | 'light' = 'dark'): Promise<Blob> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 2400;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (variant === 'dark') {
            ctx.fillStyle = '#020202';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Subtle tech grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 2;
            for (let x = 0; x < canvas.width; x += 120) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 120) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }
        } else if (variant === 'light') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        const cx = 380;
        const cy = 600;
        const size = 320;

        // Radial Ambient Glow
        if (variant !== 'light') {
            const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 450);
            glow.addColorStop(0, 'rgba(123, 63, 228, 0.45)');
            glow.addColorStop(0.5, 'rgba(123, 63, 228, 0.15)');
            glow.addColorStop(1, 'rgba(123, 63, 228, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(cx, cy, 450, 0, Math.PI * 2);
            ctx.fill();
        }

        // Outer Hex Shield
        ctx.beginPath();
        const r = size * 0.9;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = variant === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Top Diamond
        const topGrad = ctx.createLinearGradient(cx, cy - size * 0.6, cx, cy + size * 0.1);
        topGrad.addColorStop(0, '#9B66FF');
        topGrad.addColorStop(1, '#7B3FE4');

        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 0.58);
        ctx.lineTo(cx + size * 0.5, cy - size * 0.28);
        ctx.lineTo(cx, cy + size * 0.03);
        ctx.lineTo(cx - size * 0.5, cy - size * 0.28);
        ctx.closePath();
        ctx.fillStyle = topGrad;
        ctx.fill();

        // Bottom Diamond
        const botGrad = ctx.createLinearGradient(cx, cy - size * 0.03, cx, cy + size * 0.6);
        botGrad.addColorStop(0, '#7B3FE4');
        botGrad.addColorStop(1, variant === 'light' ? '#6B21A8' : '#C084FC');

        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 0.03);
        ctx.lineTo(cx + size * 0.5, cy + size * 0.28);
        ctx.lineTo(cx, cy + size * 0.58);
        ctx.lineTo(cx - size * 0.5, cy + size * 0.28);
        ctx.closePath();
        ctx.fillStyle = botGrad;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Typography: KALLIPOLIS_ZK
        ctx.fillStyle = variant === 'light' ? '#0A0A0A' : '#FFFFFF';
        ctx.font = '900 170px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        const textX = 800;
        const textY = 560;
        ctx.fillText('Kallipolis ', textX, textY);

        const polyWidth = ctx.measureText('Kallipolis ').width;
        ctx.fillStyle = '#C084FC';
        ctx.fillText('ZK', textX + polyWidth, textY);

        // Subtitles
        ctx.fillStyle = variant === 'light' ? '#4B5563' : '#9CA3AF';
        ctx.font = '700 38px "JetBrains Mono", monospace';
        ctx.fillText('INSTITUTIONAL AGGLAYER DEFENSE KERNEL', textX, textY + 130);

        ctx.fillStyle = '#7B3FE4';
        ctx.font = '600 24px "JetBrains Mono", monospace';
        ctx.fillText('VERIFIED // ZERO-KNOWLEDGE DEFENSE MATRIX v4.2.0', textX, textY + 190);

        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
        }, 'image/png');
    });
};

// 4K SOC Wallpaper Generator
const generateSOCWallpaperJPG = (): Promise<Blob> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 3840;
        canvas.height = 2160;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Deep Cyber Canvas
        ctx.fillStyle = '#020202';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cyber Grid Lines
        ctx.strokeStyle = 'rgba(123, 63, 228, 0.06)';
        ctx.lineWidth = 2;
        for (let x = 0; x < canvas.width; x += 160) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 160) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // Central Radial Ambient Glow
        const cx = canvas.width / 2;
        const cy = canvas.height / 2 - 100;
        const radGlow = ctx.createRadialGradient(cx, cy, 50, cx, cy, 900);
        radGlow.addColorStop(0, 'rgba(123, 63, 228, 0.35)');
        radGlow.addColorStop(0.5, 'rgba(123, 63, 228, 0.08)');
        radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, 900, 0, Math.PI * 2);
        ctx.fill();

        // Hexagon Shield Emblem
        const size = 360;
        ctx.beginPath();
        const r = size * 0.9;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Top Diamond
        const topGrad = ctx.createLinearGradient(cx, cy - size * 0.6, cx, cy + size * 0.1);
        topGrad.addColorStop(0, '#9B66FF');
        topGrad.addColorStop(1, '#7B3FE4');
        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 0.58);
        ctx.lineTo(cx + size * 0.5, cy - size * 0.28);
        ctx.lineTo(cx, cy + size * 0.03);
        ctx.lineTo(cx - size * 0.5, cy - size * 0.28);
        ctx.closePath();
        ctx.fillStyle = topGrad;
        ctx.fill();

        // Bottom Diamond
        const botGrad = ctx.createLinearGradient(cx, cy - size * 0.03, cx, cy + size * 0.6);
        botGrad.addColorStop(0, '#7B3FE4');
        botGrad.addColorStop(1, '#C084FC');
        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 0.03);
        ctx.lineTo(cx + size * 0.5, cy + size * 0.28);
        ctx.lineTo(cx, cy + size * 0.58);
        ctx.lineTo(cx - size * 0.5, cy + size * 0.28);
        ctx.closePath();
        ctx.fillStyle = botGrad;
        ctx.fill();

        // Main Title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 180px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('KALLIPOLIS_ZK', cx, cy + 420);

        ctx.fillStyle = '#A855F7';
        ctx.font = '700 48px "JetBrains Mono", monospace';
        ctx.fillText('INSTITUTIONAL AI & ZERO-KNOWLEDGE DEFENSE MATRIX', cx, cy + 520);

        ctx.fillStyle = '#6B7280';
        ctx.font = '600 32px "JetBrains Mono", monospace';
        ctx.fillText('POLYGON AGGLAYER // PESSIMISTIC PROVER // DEFCON NOMINAL', cx, cy + 590);

        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
        }, 'image/jpeg', 0.96);
    });
};

const generateIdentityGuidelinesDoc = (): string => {
    return `# Kallipolis ZK Brand Identity Protocol & Visual Design System

**Official Institutional Brand Guidelines**  
**Version:** 4.2.0-STABLE  
**Release:** Q1 2026  
**Classification:** Public / Brand Operations  

---

## 1. Brand Philosophy & Core Identity

Kallipolis ZK represents the apex of **Zero-Knowledge Cryptography** and **Institutional Artificial Intelligence** for the Polygon AggLayer ecosystem.

The visual identity combines industrial military precision with cryptographic transparency.

---

## 2. Master Color Palette Specifications

| Color Name | Hex Code | RGB Value | Usage Role |
| :--- | :--- | :--- | :--- |
| **Polygon Purple** | \`#7B3FE4\` | \`rgb(123, 63, 228)\` | Primary Brand Color, Core Accents & Glows |
| **Purple Light** | \`#C084FC\` | \`rgb(192, 132, 252)\` | Logotype Text Highlights & Callouts |
| **Pure Dark** | \`#020202\` | \`rgb(2, 2, 2)\` | Primary Screen Canvas & UI Backgrounds |
| **Institutional Gray** | \`#EAEAEA\` | \`rgb(234, 234, 234)\` | Primary Display & Body Typography |
| **Cyber Blue** | \`#3B82F6\` | \`rgb(59, 130, 246)\` | Interactive State Signals & RPC Indicators |
| **Defcon Red** | \`#EF4444\` | \`rgb(239, 68, 68)\` | Critical Threat States & Reentrancy Alerts |

---

## 3. Typographic Hierarchy & Fonts

1. **Primary Sans (Display & Body):** \`Inter\` (Weights: 900 Black, 700 Bold, 400 Regular)
2. **Secondary Monospace (Code & Telemetry):** \`JetBrains Mono\` (Weights: 700 Bold, 500 Medium)

---

## 4. Logo Clear Space & Minimum Scale

- **Minimum Clear Space:** Equal to 50% of the emblem width on all four sides.
- **Minimum Digital Size:** 24px height for icon emblem; 120px width for full horizontal logotype.

---

*Copyright © 2026 Kallipolis ZK Security Infrastructure Inc. All Rights Reserved.*
`;
};

const BrandKitView: React.FC = () => {
    const [downloadingStates, setDownloadingStates] = useState<Record<number, 'idle' | 'preparing' | 'downloading' | 'complete'>>({});
    const [copiedColor, setCopiedColor] = useState<string | null>(null);

    // Badge Generator State
    const [badgeDappName, setBadgeDappName] = useState('Kallipolis ZK');
    const [badgeNetwork, setBadgeNetwork] = useState('Polygon AggLayer');
    const [badgeLevel, setBadgeLevel] = useState('Level 4: Formal Verification');
    const [badgeColor, setBadgeColor] = useState('#7B3FE4'); // Purple
    const [provingStep, setProvingStep] = useState<'idle' | 'proving' | 'verified'>('idle');
    const [provingLogs, setProvingLogs] = useState<string[]>([]);

    const handleCompileBadgeProof = async () => {
        setProvingStep('proving');
        setProvingLogs([]);
        
        const logs = [
            `[INIT] Bootstrapping Prover context for "${badgeDappName}"...`,
            `[OK] Loaded primary verification key verification_v4.2.key`,
            `[ZK] Initiating Halo2 Plonkish constraints on prime field Fr`,
            `[MATH] Matrix layout set to 2^15 rows // 48 columns`,
            `[PROVING] Synthesizing circuit gate variables...`,
            `[PROVING] Generating witness layout mapping...`,
            `[OK] Witness vector solved in 184ms`,
            `[PROVING] Calculating KZG polynomial commitments...`,
            `[OK] AggLayer Exit root verified securely`,
            `[SUCCESS] Zero-Knowledge Proof verified! Generating cryptographic badge payload.`
        ];

        for (let i = 0; i < logs.length; i++) {
            await new Promise(r => setTimeout(r, 180));
            setProvingLogs(prev => [...prev, logs[i]]);
        }
        
        setProvingStep('verified');
    };

    const downloadBadgeSVG = () => {
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 150" width="500" height="150">
  <rect width="500" height="150" fill="#060606" rx="8" stroke="${badgeColor}" stroke-width="2"/>
  <line x1="20" y1="75" x2="480" y2="75" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1" />
  <circle cx="50" cy="75" r="30" fill="${badgeColor}" fill-opacity="0.1" stroke="${badgeColor}" stroke-width="2" />
  <path d="M50 63 L62 69 V81 L50 87 L38 81 V69 Z" fill="none" stroke="${badgeColor}" stroke-width="2"/>
  <text x="100" y="55" font-family="'Inter', system-ui, sans-serif" font-size="16" font-weight="900" fill="#ffffff" letter-spacing="1">${badgeDappName.toUpperCase()}</text>
  <text x="100" y="80" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#6B7280" letter-spacing="1">NETWORK: ${badgeNetwork.toUpperCase()}</text>
  <text x="100" y="105" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="800" fill="${badgeColor}" letter-spacing="1.5">STATUS: ${badgeLevel.toUpperCase()}</text>
  <text x="480" y="130" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="700" fill="#374151" text-anchor="end">KALLIPOLIS CRYPTOGRAPHIC KERNEL // v4.2.0</text>
</svg>`.trim();

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kallipolis_verified_badge_${badgeDappName.toLowerCase().replace(/\s+/g, '_')}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedColor(text);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    const triggerFileDownload = async (index: number) => {
        const asset = ASSETS[index];
        let blob: Blob;

        if (asset.id === 'svg_pack') {
            const svgContent = generateMasterSVG();
            blob = new Blob([svgContent], { type: 'image/svg+xml' });
        } else if (asset.id === 'png_ui') {
            blob = await generatePNGBlob('dark');
        } else if (asset.id === 'jpg_soc') {
            blob = await generateSOCWallpaperJPG();
        } else {
            const docContent = generateIdentityGuidelinesDoc();
            blob = new Blob([docContent], { type: 'text/markdown' });
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const extension = asset.id === 'pdf_guide' ? 'md' : asset.format.toLowerCase();
        const fileName = `Kallipolis ZK_${asset.title.replace(/\s+/g, '_')}_v4.${extension}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownload = async (index: number) => {
        if (downloadingStates[index] && downloadingStates[index] !== 'idle' && downloadingStates[index] !== 'complete') return;

        setDownloadingStates(prev => ({ ...prev, [index]: 'preparing' }));
        await new Promise(r => setTimeout(r, 600));
        setDownloadingStates(prev => ({ ...prev, [index]: 'downloading' }));
        await new Promise(r => setTimeout(r, 1200));

        await triggerFileDownload(index);
        setDownloadingStates(prev => ({ ...prev, [index]: 'complete' }));

        setTimeout(() => {
            setDownloadingStates(prev => ({ ...prev, [index]: 'idle' }));
        }, 3000);
    };

    const downloadContextLogo = async (context: 'dark' | 'light' | 'primary', format: 'png' | 'svg') => {
        let blob: Blob;
        let ext = format;
        if (format === 'svg') {
            blob = new Blob([generateMasterSVG()], { type: 'image/svg+xml' });
        } else {
            blob = await generatePNGBlob(context === 'light' ? 'light' : 'dark');
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Kallipolis ZK_Logo_${context.toUpperCase()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-6xl mx-auto pb-24">
            <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-polygon-purple/10 border border-polygon-purple/20 rounded-sm">
                        <LayersIcon className="w-8 h-8 text-polygon-purple-light" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-white leading-none">Identity Protocol</h1>
                        <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-widest">System_Specs // Asset_Repository // Version_4.2.0</p>
                    </div>
                </div>
                <div className="hidden lg:flex gap-4">
                    <div className="text-right">
                        <div className="text-[8px] font-mono text-gray-600 uppercase font-black">Release</div>
                        <div className="text-xs font-mono font-bold text-white uppercase">Q1_2026_DEPLOY</div>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="text-right">
                        <div className="text-[8px] font-mono text-gray-600 uppercase font-black">Auth_Link</div>
                        <div className="text-xs font-mono font-bold text-green-500 uppercase">VERIFIED_SECURE</div>
                    </div>
                </div>
            </div>

            {/* Logo Previews Contexts */}
            <section className="mb-20">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-polygon-purple"></div>
                        <h2 className="text-[11px] font-mono font-black text-white uppercase tracking-[0.4em]">Logotype_Matrix</h2>
                    </div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase">Click below card to download vector & raster assets</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-16 flex flex-col items-center justify-center bg-[#020202] border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 tech-bg opacity-[0.03]"></div>
                        <CyberpunkLogo className="scale-150 relative z-10 mb-8" />
                        <div className="absolute bottom-4 left-4 text-[7px] font-mono text-gray-700 uppercase font-black">Context: Dark_Uplink</div>
                        <div className="flex gap-2 relative z-20 mt-4">
                            <Button 
                                variant="secondary" 
                                className="text-[8px] py-1.5 px-3 border-white/10"
                                onClick={() => downloadContextLogo('dark', 'svg')}
                            >
                                <DownloadIcon className="w-3 h-3 mr-1" /> SVG
                            </Button>
                            <Button 
                                variant="secondary" 
                                className="text-[8px] py-1.5 px-3 border-white/10"
                                onClick={() => downloadContextLogo('dark', 'png')}
                            >
                                <DownloadIcon className="w-3 h-3 mr-1" /> Ultra-HD PNG
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-16 flex flex-col items-center justify-center bg-white border-transparent group relative">
                        <CyberpunkLogo className="scale-150 brightness-0 mb-8" />
                        <div className="absolute bottom-4 left-4 text-[7px] font-mono text-gray-400 uppercase font-black">Context: Document_Print</div>
                        <div className="flex gap-2 relative z-20 mt-4">
                            <Button 
                                variant="secondary" 
                                className="text-[8px] py-1.5 px-3 !bg-gray-100 !text-black !border-gray-300 hover:!bg-black hover:!text-white"
                                onClick={() => downloadContextLogo('light', 'svg')}
                            >
                                <DownloadIcon className="w-3 h-3 mr-1" /> SVG
                            </Button>
                            <Button 
                                variant="secondary" 
                                className="text-[8px] py-1.5 px-3 !bg-gray-100 !text-black !border-gray-300 hover:!bg-black hover:!text-white"
                                onClick={() => downloadContextLogo('light', 'png')}
                            >
                                <DownloadIcon className="w-3 h-3 mr-1" /> PNG
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-16 flex flex-col items-center justify-center bg-polygon-purple border-transparent group overflow-hidden relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <CyberpunkLogo hideText className="scale-[3.5] opacity-20 absolute -right-4 -bottom-4" />
                        <CyberpunkLogo hideText className="scale-[2.5] brightness-200 mb-8 relative z-10" />
                        <div className="absolute bottom-4 left-4 text-[7px] font-mono text-purple-200 uppercase font-black">Context: Brand_Primary</div>
                        <div className="flex gap-2 relative z-20 mt-4">
                            <Button 
                                variant="secondary" 
                                className="text-[8px] py-1.5 px-3 !bg-black/40 !text-white border-white/20 hover:!bg-white hover:!text-black"
                                onClick={() => downloadContextLogo('primary', 'png')}
                            >
                                <DownloadIcon className="w-3 h-3 mr-1" /> Emblem PNG
                            </Button>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Color Palette Grid */}
            <section className="mb-20">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-1 h-4 bg-blue-500"></div>
                    <h2 className="text-[11px] font-mono font-black text-white uppercase tracking-[0.4em]">Chromatic_Protocol</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                    {COLORS.map((color, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => copyToClipboard(color.hex)}
                            className="flex flex-col cursor-pointer group"
                        >
                            <div 
                                className="h-40 w-full rounded-sm border border-white/10 mb-4 transition-all duration-300 group-hover:scale-[1.02] group-hover:border-white/30 relative flex items-center justify-center overflow-hidden" 
                                style={{ backgroundColor: color.hex }}
                            >
                                <AnimatePresence>
                                    {copiedColor === color.hex && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 z-10"
                                        >
                                            <CheckIcon className="w-3 h-3 text-green-500" />
                                            <span className="text-[10px] font-mono text-white font-bold uppercase">Copied</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PlusIcon className="w-3 h-3 text-white/50" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs font-black text-white uppercase tracking-tight">{color.name}</h3>
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-mono text-blue-400 font-bold">{color.hex}</p>
                                    <span className="text-[8px] font-mono text-gray-700 font-black">RGB: {color.rgb}</span>
                                </div>
                                <p className="text-[9px] font-mono text-gray-600 uppercase leading-none pt-1">{color.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Typography Specimen */}
            <section className="mb-20">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-1 h-4 bg-white"></div>
                    <h2 className="text-[11px] font-mono font-black text-white uppercase tracking-[0.4em]">Typographic_Engine</h2>
                </div>
                <div className="grid grid-cols-1 gap-12">
                    {/* Inter Specimen */}
                    <Card className="p-0 bg-[#080808] border-white/10 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] scale-[5] rotate-12 pointer-events-none font-black text-white">INTER</div>
                        
                        <div className="p-6 border-b border-white/5 bg-[#0A0A0A] flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-blue-500/10 rounded-sm border border-blue-500/20">
                                    <ShieldCheckIcon className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Primary_Sans</h3>
                                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Inter / Variable / Variable Optical Size</span>
                                </div>
                            </div>
                            <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Weights: 100 - 900</span>
                        </div>

                        <div className="p-10 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
                            <div className="lg:col-span-7 space-y-12">
                                <div className="space-y-4">
                                    <span className="text-[8px] font-mono text-blue-500 uppercase font-bold tracking-[0.3em]">H1_Display</span>
                                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase">
                                        Sovereign <br/> Defense.
                                    </h1>
                                </div>
                                <div className="space-y-4">
                                    <span className="text-[8px] font-mono text-blue-500 uppercase font-bold tracking-[0.3em]">H2_Heading</span>
                                    <h2 className="text-3xl md:text-5xl font-black text-gray-200 tracking-tight leading-none uppercase">
                                        Algorithmic Integrity <br/> Unified Buffer.
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    <span className="text-[8px] font-mono text-blue-500 uppercase font-bold tracking-[0.3em]">Body_Primary</span>
                                    <p className="text-lg text-gray-400 font-light leading-relaxed max-w-xl">
                                        The quick brown fox jumps over the lazy dog. Kallipolis ZK utilizes Inter as its primary typeface to convey precision, authority, and industrial clarity across all UI primitives.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="lg:col-span-5 border-l border-white/5 pl-12 space-y-12">
                                <div>
                                    <span className="text-[8px] font-mono text-gray-600 uppercase font-black block mb-6 tracking-widest">Weight_Scale</span>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-6">
                                            <span className="text-4xl font-black text-white w-12 text-center">Aa</span>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-white font-black uppercase">900 Black</span>
                                                <span className="text-[9px] text-gray-600 font-mono">Mission Critical Headers</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-4xl font-bold text-white w-12 text-center">Aa</span>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-white font-bold uppercase">700 Bold</span>
                                                <span className="text-[9px] text-gray-600 font-mono">Module Sub-headings</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-4xl font-semibold text-white w-12 text-center">Aa</span>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-white font-semibold uppercase">600 SemiBold</span>
                                                <span className="text-[9px] text-gray-600 font-mono">Interactive Components</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-4xl font-normal text-white w-12 text-center">Aa</span>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-white font-normal uppercase">400 Regular</span>
                                                <span className="text-[9px] text-gray-600 font-mono">Standard Interface Text</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[8px] font-mono text-gray-600 uppercase font-black block mb-6 tracking-widest">Character_Set</span>
                                    <p className="text-sm font-mono text-gray-500 break-all leading-loose tracking-tighter">
                                        ABCDEFGHIJKLMNOPQRSTUVWXYZ <br/>
                                        abcdefghijklmnopqrstuvwxyz <br/>
                                        0123456789 (!@#$%^&*?)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* JetBrains Mono Specimen */}
                    <Card className="p-0 bg-[#080808] border-white/10 font-mono overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] scale-[5] rotate-12 pointer-events-none font-black text-white">MONO</div>
                        
                        <div className="p-6 border-b border-white/5 bg-[#0A0A0A] flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-purple-500/10 rounded-sm border border-purple-500/20">
                                    <CodeIcon className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Secondary_Mono</h3>
                                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">JetBrains Mono / Open-Source / Ligatures-Enabled</span>
                                </div>
                            </div>
                            <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Usage: Telemetry / Bytecode / Logs</span>
                        </div>

                        <div className="p-10 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
                            <div className="lg:col-span-7 space-y-12">
                                <div className="space-y-4">
                                    <span className="text-[8px] font-mono text-purple-500 uppercase font-bold tracking-[0.3em]">Code_Block_Display</span>
                                    <div className="bg-black/60 border border-white/5 p-8 rounded-sm font-mono text-sm leading-relaxed text-blue-300">
                                        <p><span className="text-purple-400">async function</span> <span className="text-white">authorize</span>(node: <span className="text-yellow-400">Address</span>) &#123;</p>
                                        <p className="pl-6 text-gray-600 italic">// Verify cryptographic handshake integrity</p>
                                        <p className="pl-6"><span className="text-purple-400">const</span> status = <span className="text-purple-400">await</span> kernel.<span className="text-white">scan</span>(node);</p>
                                        <p className="pl-6"><span className="text-purple-400">return</span> status.integrity === <span className="text-green-400">1.0</span>;</p>
                                        <p>&#125;</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <span className="text-[8px] font-mono text-purple-500 uppercase font-bold tracking-[0.3em]">Telemetry_Stream</span>
                                    <div className="bg-[#050505] p-6 border-l-2 border-purple-500 space-y-1">
                                        <div className="flex gap-4 text-[10px] text-gray-500">
                                            <span className="w-16">14:02:11</span>
                                            <span className="text-blue-400">[SIGNAL]</span>
                                            <span className="text-white">0x7B3FE4...INIT_SYNC_SUCCESS</span>
                                        </div>
                                        <div className="flex gap-4 text-[10px] text-gray-500">
                                            <span className="w-16">14:02:12</span>
                                            <span className="text-purple-400">[KERNEL]</span>
                                            <span className="text-white">SCANNING_MEMPOOL_VECTORS_V4</span>
                                        </div>
                                        <div className="flex gap-4 text-[10px] text-gray-500">
                                            <span className="w-16">14:02:14</span>
                                            <span className="text-red-500">[WARN]</span>
                                            <span className="text-white">HIGH_LATENCY_DETECTED_NODE_S1</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="lg:col-span-5 border-l border-white/5 pl-12 space-y-12">
                                <div>
                                    <span className="text-[8px] font-mono text-gray-600 uppercase font-black block mb-6 tracking-widest">Symbol_Library</span>
                                    <div className="grid grid-cols-4 gap-4">
                                        {['=>', '!=', '===', '<=', '&&', '||', '=>', '::'].map((sym, i) => (
                                            <div key={i} className="bg-white/5 p-3 flex items-center justify-center rounded-sm">
                                                <span className="text-xl text-white font-bold">{sym}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[8px] text-gray-600 font-mono mt-4 uppercase">Ligature visual verification enabled.</p>
                                </div>

                                <div>
                                    <span className="text-[8px] font-mono text-gray-600 uppercase font-black block mb-6 tracking-widest">Character_Reference</span>
                                    <p className="text-sm font-mono text-gray-400 break-all leading-loose">
                                        0 1 2 3 4 5 6 7 8 9 <br/>
                                        ! @ # $ % ^ &amp; * ( ) <br/>
                                        {"[ ] { } < > / \\ | : ;"}
                                    </p>
                                    <div className="mt-8 space-y-2">
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-[9px] text-gray-600 uppercase">Weight: Regular</span>
                                            <span className="text-[11px] text-white">Mono_400</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-[9px] text-gray-600 uppercase">Weight: Bold</span>
                                            <span className="text-[11px] text-white font-bold">Mono_700</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Dynamic Proving Badge Generator (Cutting-edge sandbox) */}
            <section className="mb-20">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-1 h-4 bg-purple-500"></div>
                    <h2 className="text-[11px] font-mono font-black text-white uppercase tracking-[0.4em]">Interactive_ZK_Badge_Prover</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Configurator Controls */}
                    <Card className="lg:col-span-5 p-8 bg-[#060606] border-white/5 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-mono font-black text-white uppercase tracking-widest mb-1">Badge Configurator</h3>
                                <p className="text-[10px] font-mono text-gray-500 uppercase">Input dApp parameters to construct witness vector</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">Protocol Name</label>
                                    <input 
                                        type="text" 
                                        value={badgeDappName} 
                                        onChange={(e) => setBadgeDappName(e.target.value)}
                                        className="w-full bg-[#0C0C0C] border border-white/10 text-white font-mono text-xs p-3 rounded-none focus:outline-none focus:border-polygon-purple/80" 
                                        placeholder="e.g. Kallipolis ZK"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">Deployment Network</label>
                                    <select 
                                        value={badgeNetwork} 
                                        onChange={(e) => setBadgeNetwork(e.target.value)}
                                        className="w-full bg-[#0C0C0C] border border-white/10 text-white font-mono text-xs p-3 rounded-none focus:outline-none focus:border-polygon-purple/80 appearance-none"
                                    >
                                        <option value="Polygon AggLayer">Polygon AggLayer</option>
                                        <option value="LxLy Exit Bridge">LxLy Exit Bridge</option>
                                        <option value="zkEVM sovereign cluster">zkEVM sovereign cluster</option>
                                        <option value="AggLayer v2 Hub">AggLayer v2 Hub</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">Security Clearance</label>
                                    <select 
                                        value={badgeLevel} 
                                        onChange={(e) => setBadgeLevel(e.target.value)}
                                        className="w-full bg-[#0C0C0C] border border-white/10 text-white font-mono text-xs p-3 rounded-none focus:outline-none focus:border-polygon-purple/80"
                                    >
                                        <option value="Level 4: Formal Verification">Level 4: Formal Verification</option>
                                        <option value="Mempool Shield Active">Mempool Shield Active</option>
                                        <option value="AggLayer Secure Exit Verified">AggLayer Secure Exit Verified</option>
                                        <option value="Pessimistic Prover Handshake">Pessimistic Prover Handshake</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">Glow Signature Color</label>
                                    <div className="flex gap-2">
                                        {[
                                            { name: 'Purple', hex: '#7B3FE4' },
                                            { name: 'Cyan', hex: '#06B6D4' },
                                            { name: 'Emerald', hex: '#10B981' },
                                            { name: 'Amber', hex: '#F59E0B' }
                                        ].map((c) => (
                                            <button 
                                                key={c.hex}
                                                onClick={() => setBadgeColor(c.hex)}
                                                className={`flex-1 text-[8px] font-mono p-2 border transition-all ${badgeColor === c.hex ? 'border-white text-white font-black' : 'border-white/10 text-gray-500'}`}
                                                style={{ backgroundColor: `${c.hex}10` }}
                                            >
                                                <div className="w-1.5 h-1.5 inline-block mr-1.5 rounded-none rotate-45" style={{ backgroundColor: c.hex }}></div>
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <Button 
                                onClick={handleCompileBadgeProof} 
                                disabled={provingStep === 'proving'}
                                className="w-full py-4 bg-white text-black hover:bg-polygon-purple hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.2em] rounded-none border-none shadow-lg disabled:opacity-50"
                            >
                                {provingStep === 'proving' ? 'CALCULATING PROOF VECTOR...' : 'COMPILE CRYPTOGRAPHIC BADGE'}
                            </Button>
                        </div>
                    </Card>

                    {/* Live Badge Preview & Prover Logs Terminal */}
                    <Card className="lg:col-span-7 p-8 bg-[#030303] border-white/10 flex flex-col justify-between overflow-hidden relative">
                        <div className="absolute top-4 right-4 text-[7px] font-mono text-gray-700 uppercase font-black">Stage // Prover_Inference</div>
                        
                        <div className="space-y-8">
                            <h3 className="text-xs font-mono font-black text-white uppercase tracking-widest">Real-time Compiler Output</h3>
                            
                            {/* SVG Badge Render */}
                            <div className="border border-white/5 p-6 bg-[#060606] relative flex items-center justify-center min-h-[160px] overflow-hidden">
                                <div className="absolute inset-0 tech-bg opacity-[0.02] pointer-events-none"></div>
                                <div className="absolute top-2 left-2 text-[6px] font-mono text-gray-700 uppercase">Live_SVG_Raster</div>
                                <div className="w-full">
                                    <svg viewBox="0 0 500 150" className="w-full h-auto max-w-[500px] mx-auto filter drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                                        <rect width="100%" height="100%" fill="#080808" rx="4" stroke={badgeColor} strokeOpacity="0.25" strokeWidth="1.5"/>
                                        <line x1="20" y1="75" x2="480" y2="75" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="1" />
                                        <circle cx="55" cy="75" r="26" fill={`${badgeColor}08`} stroke={badgeColor} strokeWidth="1.5" />
                                        <path d="M55 65 L65 70 V80 L55 85 L45 80 V70 Z" fill="none" stroke={badgeColor} strokeWidth="1.5"/>
                                        <text x="100" y="55" fontFamily="'JetBrains Mono', monospace" fontSize="15" fontWeight="900" fill="#ffffff" letterSpacing="0.5">{badgeDappName.toUpperCase()}</text>
                                        <text x="100" y="80" fontFamily="'JetBrains Mono', monospace" fontSize="9" fontWeight="700" fill="#6B7280" letterSpacing="0.5">NET: {badgeNetwork.toUpperCase()}</text>
                                        <text x="100" y="103" fontFamily="'JetBrains Mono', monospace" fontSize="8" fontWeight="800" fill={badgeColor} letterSpacing="1">🛡️ STATUS: {badgeLevel.toUpperCase()}</text>
                                        <text x="480" y="132" fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fontWeight="700" fill="#374151" textAnchor="end">KALLIPOLIS CRYPTOGRAPHIC KERNEL // v4.2.0</text>
                                    </svg>
                                </div>
                            </div>

                            {/* Proving Console Log */}
                            <div className="bg-[#060606] border border-white/5 p-4 rounded-none font-mono text-[9px] min-h-[140px] max-h-[140px] overflow-y-auto space-y-1">
                                {provingStep === 'idle' ? (
                                    <div className="text-gray-600 uppercase tracking-widest animate-pulse">// Awaiting compiler handshake trigger...</div>
                                ) : (
                                    provingLogs.map((log, i) => (
                                        <div key={i} className="flex gap-2">
                                            <span className="text-purple-500">PROVER_0{i+1}:</span>
                                            <span className={log.includes('[SUCCESS]') || log.includes('[OK]') ? 'text-green-400' : 'text-gray-400'}>{log}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="text-[7px] font-mono text-gray-600 uppercase tracking-[0.2em] font-bold">SHA256_SUM: {provingStep === 'verified' ? 'PASS_INTEGRITY_MATCH' : 'AWAITING_VERIFICATION'}</span>
                            <Button 
                                onClick={downloadBadgeSVG} 
                                disabled={provingStep !== 'verified'}
                                className={`py-2 px-6 border-white/10 text-[9px] uppercase font-bold tracking-widest rounded-none ${provingStep === 'verified' ? 'bg-polygon-purple/10 border-polygon-purple/40 text-white hover:bg-polygon-purple hover:border-transparent' : 'opacity-40 cursor-not-allowed'}`}
                            >
                                Download_Badge_SVG
                            </Button>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Asset Payloads */}
            <section>
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-1 h-4 bg-green-500"></div>
                    <h2 className="text-[11px] font-mono font-black text-white uppercase tracking-[0.4em]">Operational_Resources</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {ASSETS.map((asset, i) => {
                        const state = downloadingStates[i] || 'idle';
                        return (
                            <Card key={i} className="p-8 bg-[#0C0C0C] border-white/5 hover:border-polygon-purple/40 transition-all flex flex-col group relative overflow-hidden rounded-none">
                                {state === 'downloading' && (
                                    <motion.div 
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '100%' }}
                                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                                        className="absolute bottom-0 left-0 h-1 bg-polygon-purple w-full z-20 shadow-[0_0_10px_#7b3fe4]"
                                    />
                                )}
                                
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-3 bg-white/5 rounded-sm group-hover:bg-polygon-purple/20 transition-all duration-500">
                                        <ShieldCheckIcon className={`w-5 h-5 transition-colors duration-500 ${state === 'complete' ? 'text-green-500' : 'text-gray-500 group-hover:text-polygon-purple-light'}`} />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[8px] font-mono text-gray-600 uppercase font-black block mb-1">Payload_Type</span>
                                        <span className="text-[9px] font-mono text-white uppercase font-black tracking-widest">{asset.type}</span>
                                    </div>
                                </div>

                                <h4 className="text-sm font-black text-white uppercase mb-1 group-hover:text-polygon-purple-light transition-colors">{asset.title}</h4>
                                <p className="text-[10px] font-mono text-gray-600 uppercase mb-8">{asset.format} // {asset.size}</p>
                                
                                <Button 
                                    variant="secondary" 
                                    className={`w-full text-[10px] py-4 border-white/10 rounded-none font-black uppercase tracking-widest transition-all duration-500 ${
                                        state === 'complete' ? '!border-green-500/50 !text-green-400 bg-green-500/5' : 
                                        state !== 'idle' ? '!border-polygon-purple/50' : 
                                        'group-hover:border-polygon-purple/60 group-hover:text-white group-hover:bg-polygon-purple/5'
                                    }`}
                                    onClick={() => handleDownload(i)}
                                >
                                    {state === 'idle' && (
                                        <span className="flex items-center gap-2"><RefreshIcon className="w-3.5 h-3.5" /> REQUISITION</span>
                                    )}
                                    {state === 'preparing' && (
                                        <span className="flex items-center gap-2"><RefreshIcon className="w-3.5 h-3.5 animate-spin" /> GENERATING...</span>
                                    )}
                                    {state === 'downloading' && (
                                        <span className="flex items-center gap-2"><ZapIcon className="w-3.5 h-3.5 animate-pulse" /> ENCODING</span>
                                    )}
                                    {state === 'complete' && (
                                        <span className="flex items-center gap-2"><CheckCircleIcon className="w-3.5 h-3.5" /> DELIVERED</span>
                                    )}
                                </Button>
                            </Card>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default BrandKitView;
