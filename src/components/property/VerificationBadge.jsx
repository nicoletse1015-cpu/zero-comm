import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BADGE_CONFIG = {
  grey: {
    icon: Shield,
    label: '未驗證',
    description: '新上架，尚未完成任何驗證',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    iconColor: 'text-gray-500',
    borderColor: 'border-gray-200'
  },
  blue: {
    icon: ShieldCheck,
    label: '基本驗證',
    description: '已完成 Email + 電話驗證',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-200'
  },
  green: {
    icon: ShieldCheck,
    label: '身份已驗證',
    description: '已完成香港身份證驗證',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    iconColor: 'text-green-500',
    borderColor: 'border-green-200'
  },
  rainbow: {
    icon: Sparkles,
    label: '業權已驗證',
    description: '已驗證業權文件（業權登記書/差餉單/水電單）',
    bgColor: 'bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50',
    textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500',
    iconColor: 'text-purple-500',
    borderColor: 'border-purple-200',
    isRainbow: true
  }
};

export default function VerificationBadge({ level = 'grey', size = 'md', showLabel = true }) {
  const config = BADGE_CONFIG[level] || BADGE_CONFIG.grey;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center rounded-full border font-medium transition-all hover:shadow-sm cursor-help",
              config.bgColor,
              config.borderColor,
              sizeClasses[size]
            )}
          >
            <Icon className={cn(iconSizes[size], config.iconColor, config.isRainbow && "animate-pulse")} />
            {showLabel && (
              <span className={cn("font-semibold", config.textColor)}>
                {config.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="font-medium">{config.label}</p>
          <p className="text-gray-500 text-xs mt-0.5">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}