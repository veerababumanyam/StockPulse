/**
 * EconomicCalendar Widget
 * Displays upcoming and past economic events.
 * Part of Story 2.2: Customizable Widget System
 */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WidgetComponentProps } from '../../types/dashboard';
import {
  EconomicCalendarData,
  CalendarEventItem,
  EventImpact,
  EventType
} from '../../types/widget-data';
import { useTheme } from '../../contexts/ThemeContext';
import { apiClient } from '../../services/api';
import {
  CalendarDays,
  RefreshCw,
  AlertCircle,
  Flame,
  Zap, // for IPO/Split
  Briefcase, // for Earnings
  Landmark, // for Fed/Govt
  DollarSign, // for Dividend
  TrendingUp, // for CPI/GDP if positive
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../utils/tailwind';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar'; // Assuming shadcn Calendar
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const getEventTypeIcon = (type: EventType) => {
  switch (type) {
    case 'earnings': return <Briefcase className="h-3.5 w-3.5" />;
    case 'dividend': return <DollarSign className="h-3.5 w-3.5" />;
    case 'ipo':
    case 'split': return <Zap className="h-3.5 w-3.5" />;
    case 'fed_meeting': 
    case 'other_economic': return <Landmark className="h-3.5 w-3.5" />;
    case 'cpi_report':
    case 'gdp_report':
    case 'unemployment_report': return <TrendingUp className="h-3.5 w-3.5" />;
    default: return <CalendarDays className="h-3.5 w-3.5" />;
  }
};

const getImpactBadge = (impact?: EventImpact) => {
  if (!impact) return null;
  let colorClasses = '';
  switch (impact) {
    case 'high': colorClasses = 'bg-danger-muted text-danger-fg border-danger-emphasis'; break;
    case 'medium': colorClasses = 'bg-warning-muted text-warning-fg border-warning-emphasis'; break;
    case 'low': colorClasses = 'bg-info-muted text-info-fg border-info-emphasis'; break;
  }
  return <Badge variant="outline" className={cn("text-xs px-1.5 py-0.5 font-normal capitalize", colorClasses)}>{impact}</Badge>;
};

const EconomicCalendar: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
  isEditMode,
  onConfigChange,
}) => {
  const { isDarkMode } = useTheme();
  const [calendarData, setCalendarData] = useState<EconomicCalendarData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initialDateRange = config.config?.dateRange || {
    startDate: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfWeek(new Date()), 'yyyy-MM-dd'),
  };
  const [dateRange, setDateRange] = useState(initialDateRange);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: EconomicCalendarData['filter'] = { dateRange };
      // Add other filters from config if needed: countries, impactLevels, eventTypes
      if (config.config?.countries) filters.countries = config.config.countries;
      if (config.config?.impactLevels) filters.impactLevels = config.config.impactLevels;
      if (config.config?.eventTypes) filters.eventTypes = config.config.eventTypes;

      const response = await apiClient.getEconomicCalendarData(filters);
      if (response.success && response.data) {
        setCalendarData(response.data);
      } else {
        setError(response.message || 'Failed to fetch economic calendar events.');
      }
    } catch (err: any) {
      console.error(`[${widgetId}] Error fetching calendar events:`, err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [widgetId, dateRange, config.config]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateRangeChange = (newRange: { startDate: string, endDate: string }) => {
    setDateRange(newRange);
    if(onConfigChange && config) {
      onConfigChange(widgetId, { ...config, config: { ...config.config, dateRange: newRange }});
    }
  };
  
  const navigateDateRange = (direction: 'prev' | 'next') => {
    const currentStart = new Date(dateRange.startDate);
    const currentEnd = new Date(dateRange.endDate);
    const diffDays = (currentEnd.getTime() - currentStart.getTime()) / (1000 * 3600 * 24) + 1;

    let newStart, newEnd;
    if (direction === 'prev') {
        newStart = subDays(currentStart, diffDays);
        newEnd = subDays(currentEnd, diffDays);
    } else {
        newStart = addDays(currentStart, diffDays);
        newEnd = addDays(currentEnd, diffDays);
    }
    handleDateRangeChange({ startDate: format(newStart, 'yyyy-MM-dd'), endDate: format(newEnd, 'yyyy-MM-dd') });
  };

  const groupedEvents = useMemo(() => {
    if (!calendarData) return {};
    return calendarData.events.reduce((acc, event) => {
      const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
      if (!acc[eventDate]) acc[eventDate] = [];
      acc[eventDate].push(event);
      return acc;
    }, {} as Record<string, CalendarEventItem[]>);
  }, [calendarData]);

  const renderEventItem = (item: CalendarEventItem) => (
    <div key={item.id} className="py-2.5 px-2 border-b border-border/50 last:border-b-0 hover:bg-muted/50 rounded-md">
      <div className="flex items-start justify-between">
        <div className="flex items-start mr-2">
            <div className="mr-2 mt-0.5 flex-shrink-0">{getEventTypeIcon(item.eventType)}</div>
            <div>
                <p className="text-xs font-semibold text-foreground leading-snug">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                    {format(new Date(item.date), 'p')}
                    {item.country && <span className="ml-1.5">({item.country})</span>}
                </p>
            </div>
        </div>
        <div className="flex-shrink-0 ml-auto">
            {getImpactBadge(item.impact)}
        </div>
      </div>
      {(item.actual || item.forecast || item.previous) && (
        <div className="mt-1.5 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 pl-5">
            {item.actual && <span>Actual: <span className="font-medium text-foreground">{item.actual}</span></span>}
            {item.forecast && <span>Forecast: <span className="font-medium text-foreground">{item.forecast}</span></span>}
            {item.previous && <span>Prev: <span className="font-medium text-foreground">{item.previous}</span></span>}
        </div>
      )}
    </div>
  );

  if (isLoading && !calendarData) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
        <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                    {config.title || 'Economic Calendar'}
                </CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
            </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          Loading economic events...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
         <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center text-danger-fg">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {config.title || 'Economic Calendar'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={fetchData} title="Retry loading events" className="h-7 w-7">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-danger-fg">
          Error: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col", config.className)}>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between mb-1">
            <CardTitle className="text-base font-semibold flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                {config.title || 'Economic Calendar'}
            </CardTitle>
            <div className="flex items-center space-x-1">
                <Button variant="outline" size="icon_xs" onClick={() => navigateDateRange('prev')} className="h-6 w-6"><ChevronLeft className="h-3.5 w-3.5" /></Button>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs w-[170px] justify-start text-left font-normal">
                            <span>{`${format(new Date(dateRange.startDate), "MMM d")} - ${format(new Date(dateRange.endDate), "MMM d, yyyy")}`}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={{ from: new Date(dateRange.startDate), to: new Date(dateRange.endDate) }}
                            onSelect={(range) => {
                                if (range?.from && range?.to) {
                                    handleDateRangeChange({
                                        startDate: format(range.from, 'yyyy-MM-dd'),
                                        endDate: format(range.to, 'yyyy-MM-dd'),
                                    });
                                }
                            }}
                            numberOfMonths={1}
                        />
                    </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon_xs" onClick={() => navigateDateRange('next')} className="h-6 w-6"><ChevronRight className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" onClick={fetchData} title="Refresh events" className="h-7 w-7 ml-1">
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
            </div>
        </div>
        {isEditMode && (
            <p className="text-xs text-muted-foreground">Filters (country, impact, type) can be added via widget settings.</p>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        {(!calendarData || calendarData.events.length === 0) && !isLoading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No economic events scheduled for this period.
            </div>
        ) : (
            <ScrollArea className="h-full px-1">
                {Object.entries(groupedEvents).map(([date, eventsOnDate]) => (
                    <div key={date} className="mb-2">
                        <h3 className="text-xs font-semibold text-muted-foreground px-2 py-1 bg-muted/50 rounded-t-md border-b border-border">
                            {format(new Date(date), "EEEE, MMMM d, yyyy")}
                        </h3>
                        {eventsOnDate.map(renderEventItem)}
                    </div>
                ))}
            </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default EconomicCalendar; 