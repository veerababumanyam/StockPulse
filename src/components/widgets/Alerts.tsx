/**
 * Alerts Widget
 * Displays important notifications and alerts.
 * Part of Story 2.2: Customizable Widget System
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
// import Link from 'next/link'; // Removed next/link
import { WidgetComponentProps } from "../../types/dashboard";
import {
  AlertsData,
  AlertItem,
  AlertSeverity,
  AlertStatus,
} from "../../types/widget-data";
import { useTheme } from "../../contexts/ThemeContext";
import { apiClient } from "../../services/api";
import {
  Bell,
  RefreshCw,
  AlertCircle as AlertCircleIcon, // Renamed to avoid conflict with component
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArchiveX,
  Link2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "../../utils/cn";

const getSeverityStyles = (severity: AlertSeverity) => {
  switch (severity) {
    case "critical":
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        color: "text-danger-fg",
        bg: "bg-danger-muted",
        border: "border-danger-emphasis",
      };
    case "warning":
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        color: "text-warning-fg",
        bg: "bg-warning-muted",
        border: "border-warning-emphasis",
      };
    case "info":
    default:
      return {
        icon: <Info className="h-4 w-4" />,
        color: "text-info-fg",
        bg: "bg-info-muted",
        border: "border-info-emphasis",
      };
  }
};

const getStatusIcon = (status: AlertStatus) => {
  switch (status) {
    case "active":
      return <Bell className="h-3.5 w-3.5 text-primary" />;
    case "acknowledged":
      return <CheckCircle2 className="h-3.5 w-3.5 text-success-fg" />;
    case "resolved":
      return <CheckCircle2 className="h-3.5 w-3.5 text-success-fg" />;
    case "dismissed":
      return <ArchiveX className="h-3.5 w-3.5 text-muted-foreground" />;
    default:
      return null;
  }
};

const Alerts: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
  isEditMode,
  onConfigChange,
}) => {
  const { isDarkMode } = useTheme();
  const [alertsData, setAlertsData] = useState<AlertsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const alertsLimit = config.config?.limit || 5;
  const initialFilter = config.config?.filter || {
    status: ["active", "acknowledged"],
  }; // Default to active/ack
  const [activeFilters, setActiveFilters] =
    useState<AlertsData["filter"]>(initialFilter);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getAlertsData(
        alertsLimit,
        activeFilters,
      );
      if (response.success && response.data) {
        setAlertsData(response.data);
      } else {
        setError(response.message || "Failed to fetch alerts.");
      }
    } catch (err: any) {
      console.error(`[${widgetId}] Error fetching alerts:`, err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [widgetId, alertsLimit, activeFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Placeholder actions - these would interact with a service
  const handleUpdateAlertStatus = (alertId: string, newStatus: AlertStatus) => {
    console.log(`[${widgetId}] Update alert ${alertId} to ${newStatus}`);
    alert(`Action for alert ${alertId} (${newStatus}) not implemented yet.`);
    // This would typically involve an API call and then re-fetch or update local state
    // e.g., apiClient.updateAlertStatus(alertId, newStatus).then(() => fetchData());
  };

  const renderAlertItem = (item: AlertItem) => {
    const severityStyle = getSeverityStyles(item.severity);
    const statusIcon = getStatusIcon(item.status);
    return (
      <div
        key={item.id}
        className={cn(
          "p-3 border-b border-border/50 last:border-b-0",
          severityStyle.bg,
          `border-l-4 ${severityStyle.border}`,
        )}
      >
        <div className="flex items-start justify-between mb-1">
          <div
            className={cn(
              "text-sm font-semibold flex items-center",
              severityStyle.color,
            )}
          >
            {severityStyle.icon}
            <span className="ml-1.5">{item.title}</span>
          </div>
          {statusIcon && (
            <div className="flex-shrink-0 ml-2 pt-0.5">{statusIcon}</div>
          )}
        </div>
        <p
          className={cn(
            "text-xs mb-1.5",
            severityStyle.color?.replace("-fg", "-muted-fg"),
          )}
        >
          {item.description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>
            <span>
              {new Date(item.timestamp).toLocaleDateString()}{" "}
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {item.symbol && (
              <Badge variant="secondary" className="ml-2 text-xs font-normal">
                {item.symbol}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                <Link2 className="h-3.5 w-3.5" />
              </a>
            )}
            {isEditMode && item.status === "active" && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-1.5 py-0.5 text-xs"
                onClick={() => handleUpdateAlertStatus(item.id, "acknowledged")}
              >
                Ack
              </Button>
            )}
            {isEditMode &&
              (item.status === "active" || item.status === "acknowledged") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-1.5 py-0.5 text-xs"
                  onClick={() => handleUpdateAlertStatus(item.id, "dismissed")}
                >
                  Dismiss
                </Button>
              )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
              <Bell className="h-4 w-4 mr-2 text-primary" />
              {config.title || "Alerts"}
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          Loading alerts...
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
              <AlertCircleIcon className="h-4 w-4 mr-2" />
              {config.title || "Alerts"}
            </CardTitle>
            <button onClick={fetchData} title="Retry loading alerts">
              <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-danger-fg">
          Error: {error}
        </CardContent>
      </Card>
    );
  }

  if (!alertsData || alertsData.alerts.length === 0) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
              <Bell className="h-4 w-4 mr-2 text-primary" />
              {config.title || "Alerts"}
            </CardTitle>
            <button onClick={fetchData} title="Reload alerts">
              <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center text-muted-foreground">
          <CheckCircle2 className="h-10 w-10 text-success-fg mb-2" />
          <p>No active alerts. All clear!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col", config.className)}>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center">
            <Bell className="h-4 w-4 mr-2 text-primary" />
            {config.title || "Alerts"}
            <Badge variant="destructive" className="ml-2">
              {alertsData.alerts.filter((a) => a.status === "active").length}{" "}
              New
            </Badge>
          </CardTitle>
          <button onClick={fetchData} title="Refresh alerts">
            <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </button>
        </div>
        <CardDescription className="text-xs text-muted-foreground pt-0.5">
          Last refreshed:{" "}
          {new Date(alertsData.lastRefreshed).toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {alertsData.alerts.map(renderAlertItem)}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Alerts;
