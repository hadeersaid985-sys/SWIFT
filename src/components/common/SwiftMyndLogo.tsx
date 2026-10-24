import React from 'react';
import { Edit3 } from 'lucide-react';
import { useCRM, DEFAULT_BRAND_CONFIG } from '../../context/CRMContext';
import { BrandConfig } from '../../types/crm';

interface SwiftMyndLogoProps {
  variant?: 'full' | 'icon' | 'horizontal' | 'stacked';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isDark?: boolean;
  className?: string;
  onClick?: () => void;
  showSubtitle?: boolean;
  brandConfigOverride?: BrandConfig;
  allowAdminEdit?: boolean;
}

export const SwiftMyndLogo: React.FC<SwiftMyndLogoProps> = ({
  variant = 'full',
  size = 'md',
  isDark = false,
  className = '',
  onClick,
  showSubtitle = true,
  brandConfigOverride,
  allowAdminEdit = true
}) => {
  // Try to access CRMContext safely
  let contextBrandConfig = DEFAULT_BRAND_CONFIG;
  let isManager = false;
  let setIsBrandModalOpen: ((open: boolean) => void) | undefined = undefined;

  try {
    const crm = useCRM();
    if (crm) {
      contextBrandConfig = crm.brandConfig || DEFAULT_BRAND_CONFIG;
      isManager =
        crm.currentUser?.accessLevel === 'admin' ||
        crm.currentUser?.accessLevel === 'manager' ||
        crm.currentUser?.id === 'user-1';
      setIsBrandModalOpen = crm.setIsBrandModalOpen;
    }
  } catch {
    // Outside context fallback
  }

  const activeBrandConfig = brandConfigOverride || contextBrandConfig || DEFAULT_BRAND_CONFIG;

  // Dimensions config
  const iconSizeMap = {
    xs: { w: 22, h: 22 },
    sm: { w: 30, h: 30 },
    md: { w: 38, h: 38 },
    lg: { w: 52, h: 52 },
    xl: { w: 72, h: 72 },
    '2xl': { w: 120, h: 120 }
  };

  const textStyleMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-4xl'
  };

  const currentIcon = iconSizeMap[size] || iconSizeMap.md;

  // Handle click on admin edit button
  const handleAdminEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (setIsBrandModalOpen) {
      setIsBrandModalOpen(true);
    }
  };

  // Render the logo mark (custom image or SVG Swift mark)
  const renderLogoMark = () => {
    if (activeBrandConfig.logoType === 'custom_image' && activeBrandConfig.customLogoUrl) {
      return (
        <img
          src={activeBrandConfig.customLogoUrl}
          alt={activeBrandConfig.brandName}
          style={{ width: currentIcon.w, height: currentIcon.h }}
          className="shrink-0 object-contain rounded-xl shadow-2xs transition-transform duration-200 group-hover:scale-105"
        />
      );
    }

    // Default Swift SM Vector Logo Mark
    return (
      <svg
        width={currentIcon.w}
        height={currentIcon.h}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="smGradOfficial" x1="40" y1="50" x2="200" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={activeBrandConfig.secondaryColor || '#1e54b7'} />
            <stop offset="35%" stopColor="#2563eb" />
            <stop offset="70%" stopColor={activeBrandConfig.primaryColor || '#0284c7'} />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id="cyanPersonGrad" x1="80" y1="140" x2="110" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={activeBrandConfig.primaryColor || '#0284c7'} />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Main SM Ribbon Ligature matching PROFILE1.png */}
        <path
          d="M 120 72
             C 120 56, 95 50, 72 58
             C 48 66, 36 88, 36 112
             C 36 138, 54 160, 84 160
             C 98 160, 108 150, 110 138
             C 112 126, 102 118, 90 118
             L 68 118
             C 58 118, 52 106, 60 98
             C 68 90, 88 88, 106 88
             L 138 132
             L 162 94
             L 162 165
             L 196 165
             L 196 82
             C 196 66, 184 50, 168 45
             C 156 42, 144 48, 136 58
             L 120 72 Z"
          fill="url(#smGradOfficial)"
        />

        {/* 3 Feather/Claw Slashes on top-right peak of M */}
        <path
          d="M 178 50 L 190 43 C 193 45, 194 49, 192 53 L 182 58 Z"
          fill="#ffffff"
        />
        <path
          d="M 185 58 L 196 52 C 198 55, 199 58, 196 62 L 187 66 Z"
          fill="#ffffff"
        />
        <path
          d="M 190 68 L 201 63 C 203 66, 203 70, 199 74 L 192 76 Z"
          fill="#ffffff"
        />

        {/* Stylized Cyan Person Accent under the S */}
        <circle cx="86" cy="154" r="6.5" fill="url(#cyanPersonGrad)" />
        <path
          d="M 85 163
             C 78 163, 73 170, 73 177
             C 73 182, 78 187, 85 187
             C 93 187, 98 180, 98 172
             C 98 166, 92 163, 85 163 Z"
          fill="url(#cyanPersonGrad)"
        />
      </svg>
    );
  };

  // Render the brand wordmark strictly in LTR so English text NEVER gets reversed in RTL
  const renderBrandWordmark = () => {
    const rawBrand = (activeBrandConfig?.brandName || 'SWIFTMYND').trim();
    const isDefaultSwiftName =
      rawBrand.toUpperCase() === 'SWIFTMYND' ||
      rawBrand.toUpperCase() === 'SWIFT';

    if (isDefaultSwiftName) {
      return (
        <span
          className="inline-flex items-center select-none"
          dir="ltr"
          style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}
        >
          {/* SW in cyan */}
          <span className="text-[#0284c7] font-black tracking-tight">SW</span>
          {/* Stylized I (Person Figure) */}
          <span className="inline-flex flex-col items-center justify-center mx-0.5 relative -top-0.5">
            <span className="w-1 h-1 rounded-full bg-[#0284c7]" />
            <span className="w-1 h-2 bg-gradient-to-b from-[#0284c7] to-[#1e54b7] rounded-full mt-0.2" />
          </span>
          {/* FT in blue */}
          <span className="text-[#2563eb] font-black tracking-tight">FT</span>
          {/* MYND in royal blue */}
          {rawBrand.toUpperCase() === 'SWIFTMYND' && (
            <span className={isDark ? 'text-white font-black ml-0.5' : 'text-[#1e3a8a] font-black ml-0.5'}>
              MYND
            </span>
          )}
        </span>
      );
    }

    // Custom Brand Name
    return (
      <span
        className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-[#172033]'}`}
        dir="auto"
      >
        {rawBrand}
      </span>
    );
  };

  // Icon only
  if (variant === 'icon') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105 ${className}`}
        title={`${activeBrandConfig.brandName} Workspace`}
      >
        {renderLogoMark()}
      </div>
    );
  }

  // Stacked variant
  if (variant === 'stacked') {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-2 cursor-pointer select-none group relative ${className}`}
        title={activeBrandConfig.brandName}
      >
        <div className="relative p-1">
          {renderLogoMark()}
        </div>

        {/* Wordmark centered underneath */}
        <div className="flex flex-col items-center text-center">
          <div className="font-black tracking-tight leading-none uppercase flex items-center gap-1.5 text-lg sm:text-xl">
            {renderBrandWordmark()}
            {activeBrandConfig.brandBadge && (
              <span className="text-[9px] bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white font-black px-1.5 py-0.2 rounded-md shadow-2xs">
                {activeBrandConfig.brandBadge}
              </span>
            )}
          </div>

          {showSubtitle && (
            <span className="text-[10px] font-bold text-blue-500 mt-1 flex items-center gap-1">
              <span>{activeBrandConfig.brandSubtitle}</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  // Check if logo is set to full image only (e.g. uploaded logo banner with text embedded)
  const isFullImageOnly =
    activeBrandConfig.logoType === 'custom_image' &&
    Boolean(activeBrandConfig.customLogoUrl) &&
    activeBrandConfig.logoDisplayMode === 'full_image_only';

  if (isFullImageOnly && (variant === 'full' || variant === 'horizontal' || variant === 'stacked')) {
    const customH = activeBrandConfig.customLogoHeight || (size === 'xs' ? 22 : size === 'sm' ? 28 : size === 'lg' ? 48 : size === 'xl' ? 60 : size === '2xl' ? 90 : 36);
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2 cursor-pointer group select-none relative ${className}`}
        title={`${activeBrandConfig.brandName} Workspace`}
      >
        <img
          src={activeBrandConfig.customLogoUrl}
          alt={activeBrandConfig.brandName}
          style={{ height: `${customH}px`, width: 'auto' }}
          className="max-w-[220px] sm:max-w-[300px] object-contain shrink-0 transition-transform duration-200 group-hover:scale-[1.02]"
        />

        {/* Admin Quick Edit Pencil on Hover */}
        {allowAdminEdit && isManager && setIsBrandModalOpen && !brandConfigOverride && (
          <button
            type="button"
            onClick={handleAdminEditClick}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 rounded-md transition-opacity cursor-pointer shrink-0"
            title="تعديل الشعار والاسم (صلاحية الأدمن)"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // Full / Horizontal variant
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer group select-none relative ${className}`}
      title={`${activeBrandConfig.brandName} Workspace`}
    >
      {/* Logo Icon Mark */}
      <div className="relative p-0.5 rounded-xl transition-all">
        {renderLogoMark()}
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-right">
        <div className={`font-black tracking-tight leading-none uppercase flex items-center gap-1.5 ${textStyleMap[size]}`}>
          {/* Strictly LTR English Wordmark */}
          {renderBrandWordmark()}

          {/* Badge */}
          {activeBrandConfig.brandBadge && (
            <span className="text-[9px] bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white font-black px-1.5 py-0.5 rounded-md shadow-2xs shrink-0">
              {activeBrandConfig.brandBadge}
            </span>
          )}

          {/* Admin Quick Edit Button on Hover */}
          {allowAdminEdit && isManager && setIsBrandModalOpen && !brandConfigOverride && (
            <button
              type="button"
              onClick={handleAdminEditClick}
              className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 text-blue-500 bg-blue-50/90 hover:bg-blue-100 rounded-md transition-all cursor-pointer shrink-0 text-[10px] font-bold flex items-center gap-0.5 border border-blue-200 shadow-2xs"
              title="تعديل الشعار والاسم (صلاحية الأدمن)"
            >
              <Edit3 className="w-2.5 h-2.5" />
              <span>تعديل</span>
            </button>
          )}
        </div>

        {showSubtitle && (
          <span
            className={`text-[9px] font-bold tracking-wider mt-0.5 flex items-center gap-1 ${
              isDark ? 'text-blue-300' : 'text-blue-600'
            }`}
          >
            <span>{activeBrandConfig.brandSubtitle}</span>
            {activeBrandConfig.brandBadge && (
              <>
                <span className="text-slate-400">|</span>
                <span className="text-amber-400 font-bold">{activeBrandConfig.brandBadge} Tasks</span>
              </>
            )}
          </span>
        )}
      </div>
    </div>
  );
};
