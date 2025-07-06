import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LucideIcon } from 'lucide-react';
import * as design from './design-system';

// Animated Stat Card
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  gradient?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'primary',
  gradient = false 
}: StatCardProps) {
  const colorClasses = {
    primary: 'from-blue-500 to-purple-600 text-blue-600 bg-blue-50',
    secondary: 'from-purple-500 to-pink-600 text-purple-600 bg-purple-50',
    success: 'from-green-500 to-teal-600 text-green-600 bg-green-50',
    warning: 'from-yellow-500 to-orange-600 text-yellow-600 bg-yellow-50',
    danger: 'from-red-500 to-pink-600 text-red-600 bg-red-50',
  };

  return (
    <Card className={cn(
      design.cardVariants.colorful,
      'group hover:scale-[1.02] transition-all duration-300'
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="mt-2 flex items-baseline space-x-2">
              <h3 className={cn(
                "text-2xl sm:text-3xl font-bold",
                gradient ? `bg-gradient-to-r ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} bg-clip-text text-transparent` : 'text-gray-900'
              )}>
                {value}
              </h3>
              {trend && trendValue && (
                <Badge 
                  variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                </Badge>
              )}
            </div>
            {description && (
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-xl",
            gradient ? `bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}` : colorClasses[color].split(' ')[3]
          )}>
            <Icon className={cn(
              "h-6 w-6",
              gradient ? 'text-white' : colorClasses[color].split(' ')[2]
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Feature Card with hover effects
interface FeatureCardProps {
  title: string;
  titleKm?: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  gradient?: string;
}

export function FeatureCard({
  title,
  titleKm,
  description,
  icon: Icon,
  onClick,
  badge,
  badgeVariant = 'default',
  gradient = design.gradients.primary
}: FeatureCardProps) {
  return (
    <Card 
      className={cn(
        design.cardVariants.colorful,
        "group cursor-pointer hover:scale-[1.02] transition-all duration-300",
        onClick && "hover:ring-2 hover:ring-purple-400 hover:ring-offset-2"
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className={cn(
            "p-3 rounded-xl text-white shadow-lg group-hover:shadow-xl transition-all duration-300",
            gradient
          )}>
            <Icon className="h-6 w-6" />
          </div>
          {badge && (
            <Badge variant={badgeVariant} className="animate-pulse">
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="mt-4 text-lg sm:text-xl">{title}</CardTitle>
        {titleKm && (
          <p className="text-sm text-gray-600 font-khmer">{titleKm}</p>
        )}
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm sm:text-base">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

// Progress Card
interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  unit?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  icon?: LucideIcon;
}

export function ProgressCard({
  title,
  current,
  total,
  unit = '',
  color = 'primary',
  icon: Icon
}: ProgressCardProps) {
  const percentage = Math.round((current / total) * 100);
  const colorClasses = {
    primary: 'bg-blue-500',
    secondary: 'bg-purple-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  return (
    <Card className={design.cardVariants.default}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className={cn(
                "p-2 rounded-lg",
                color === 'primary' ? 'bg-blue-100' :
                color === 'secondary' ? 'bg-purple-100' :
                color === 'success' ? 'bg-green-100' :
                color === 'warning' ? 'bg-yellow-100' :
                'bg-red-100'
              )}>
                <Icon className={cn(
                  "h-5 w-5",
                  color === 'primary' ? 'text-blue-600' :
                  color === 'secondary' ? 'text-purple-600' :
                  color === 'success' ? 'text-green-600' :
                  color === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                )} />
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-900">{title}</h4>
              <p className="text-sm text-gray-600">
                {current} / {total} {unit}
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-3" />
      </CardContent>
    </Card>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className={cn(
        "p-4 rounded-full mb-4",
        design.gradients.primary
      )}>
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      {action && (
        <Button 
          onClick={action.onClick}
          className={design.buttonVariants.primary}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Mobile-friendly Tab Navigation
interface TabNavProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: LucideIcon;
    badge?: string | number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 scrollbar-hide">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex items-center space-x-2 whitespace-nowrap",
            activeTab === tab.id && design.buttonVariants.primary
          )}
        >
          {tab.icon && <tab.icon className="h-4 w-4" />}
          <span>{tab.label}</span>
          {tab.badge && (
            <Badge variant="secondary" className="ml-2">
              {tab.badge}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}

// Page Header Component
interface PageHeaderProps {
  title: string;
  titleKm?: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export function PageHeader({ title, titleKm, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="text-gray-600 hover:text-gray-900">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={design.typography.h1}>{title}</h1>
          {titleKm && (
            <p className="text-xl sm:text-2xl text-gray-600 font-khmer mt-1">{titleKm}</p>
          )}
          {description && (
            <p className={cn(design.typography.body, "mt-2")}>{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}