import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useToast } from "../../hooks/useToast";
import { useTelemetry } from "../../contexts/TelemetryContext";
import { useGovernance } from "../../contexts/GovernanceContext";
import { useMCPPerformance } from "../../hooks/useMCPPerformance";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import {
  Activity,
  AlertCircle,
  ArrowUpDown,
  BellRing,
  Check,
  ChevronDown,
  ChevronRight,
  Database,
  Download,
  ExternalLink,
  Filter,
  GitCommit,
  Globe,
  Info,
  Link,
  Lock,
  Network,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  Share2,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";

// A/B Testing Variants
const VARIANTS = {
  LAYOUT: {
    COMPACT: "compact",
    EXPANDED: "expanded",
  },
  COLOR_SCHEME: {
    STANDARD: "standard",
    HIGH_CONTRAST: "high-contrast",
  },
  NOTIFICATION_STYLE: {
    MINIMAL: "minimal",
    DETAILED: "detailed",
  },
};

const MCPMobileManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const telemetry = useTelemetry();
  const governance = useGovernance();
  const mcpPerformance = useMCPPerformance();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // A/B Testing state
  const [layoutVariant, setLayoutVariant] = useState(VARIANTS.LAYOUT.EXPANDED);
  const [colorSchemeVariant, setColorSchemeVariant] = useState(
    VARIANTS.COLOR_SCHEME.STANDARD,
  );
  const [notificationStyleVariant, setNotificationStyleVariant] = useState(
    VARIANTS.NOTIFICATION_STYLE.DETAILED,
  );

  // Mobile management state
  const [activeTab, setActiveTab] = useState("connections");
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(true);
  const [criticalAlertsEnabled, setCriticalAlertsEnabled] = useState(true);
  const [performanceAlertsEnabled, setPerformanceAlertsEnabled] =
    useState(true);
  const [securityAlertsEnabled, setSecurityAlertsEnabled] = useState(true);
  const [dataUpdateAlertsEnabled, setDataUpdateAlertsEnabled] = useState(false);
  const [notificationFrequency, setNotificationFrequency] =
    useState("realtime");
  const [mobileDataSaver, setMobileDataSaver] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [syncFrequency, setSyncFrequency] = useState("15min");

  // Mock MCP connections
  const [connections, setConnections] = useState([
    {
      id: "conn-1",
      name: "Market Data Server",
      url: "https://mcp.marketdata.example.com/sse",
      type: "server",
      status: "active",
      lastSync: new Date().toISOString(),
      mobileEnabled: true,
      notifications: true,
    },
    {
      id: "conn-2",
      name: "Technical Analysis Server",
      url: "https://mcp.technicalanalysis.example.com/sse",
      type: "server",
      status: "active",
      lastSync: new Date(Date.now() - 3600000).toISOString(),
      mobileEnabled: true,
      notifications: true,
    },
    {
      id: "conn-3",
      name: "Sentiment Analysis Server",
      url: "https://mcp.sentiment.example.com/sse",
      type: "server",
      status: "inactive",
      lastSync: new Date(Date.now() - 86400000).toISOString(),
      mobileEnabled: false,
      notifications: false,
    },
    {
      id: "conn-4",
      name: "Trading Bot Client",
      url: "https://tradingbot.example.com",
      type: "client",
      status: "active",
      lastSync: new Date(Date.now() - 1800000).toISOString(),
      mobileEnabled: true,
      notifications: true,
    },
  ]);

  // Mock notifications
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Connection Error",
      message: "Failed to connect to Market Data Server",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: "error",
      connectionId: "conn-1",
      read: false,
    },
    {
      id: "notif-2",
      title: "Rate Limit Warning",
      message: "Technical Analysis Server approaching rate limit (85%)",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: "warning",
      connectionId: "conn-2",
      read: true,
    },
    {
      id: "notif-3",
      title: "New Capability Available",
      message: 'Market Data Server added new "Options Chain" capability',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: "info",
      connectionId: "conn-1",
      read: false,
    },
    {
      id: "notif-4",
      title: "Security Certificate Expiring",
      message: "Technical Analysis Server certificate expires in 7 days",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      type: "warning",
      connectionId: "conn-2",
      read: true,
    },
    {
      id: "notif-5",
      title: "Connection Restored",
      message: "Connection to Market Data Server restored after 2 minutes",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: "success",
      connectionId: "conn-1",
      read: true,
    },
  ]);

  // Initialize telemetry span
  useEffect(() => {
    const span = telemetry.startSpan("mcp.mobile_management.view", {
      "mcp.mobile_management.tab": activeTab,
      "mcp.mobile_management.is_mobile": isMobile,
      "mcp.ab_testing.layout": layoutVariant,
      "mcp.ab_testing.color_scheme": colorSchemeVariant,
      "mcp.ab_testing.notification_style": notificationStyleVariant,
    });

    // Randomly assign A/B test variants for new users (simulated)
    const assignRandomVariants = () => {
      const storedLayout = localStorage.getItem("ab_test_layout");
      const storedColorScheme = localStorage.getItem("ab_test_color_scheme");
      const storedNotificationStyle = localStorage.getItem(
        "ab_test_notification_style",
      );

      if (!storedLayout) {
        const newLayoutVariant =
          Math.random() > 0.5
            ? VARIANTS.LAYOUT.COMPACT
            : VARIANTS.LAYOUT.EXPANDED;
        setLayoutVariant(newLayoutVariant);
        localStorage.setItem("ab_test_layout", newLayoutVariant);
      } else {
        setLayoutVariant(storedLayout);
      }

      if (!storedColorScheme) {
        const newColorSchemeVariant =
          Math.random() > 0.5
            ? VARIANTS.COLOR_SCHEME.STANDARD
            : VARIANTS.COLOR_SCHEME.HIGH_CONTRAST;
        setColorSchemeVariant(newColorSchemeVariant);
        localStorage.setItem("ab_test_color_scheme", newColorSchemeVariant);
      } else {
        setColorSchemeVariant(storedColorScheme);
      }

      if (!storedNotificationStyle) {
        const newNotificationStyleVariant =
          Math.random() > 0.5
            ? VARIANTS.NOTIFICATION_STYLE.MINIMAL
            : VARIANTS.NOTIFICATION_STYLE.DETAILED;
        setNotificationStyleVariant(newNotificationStyleVariant);
        localStorage.setItem(
          "ab_test_notification_style",
          newNotificationStyleVariant,
        );
      } else {
        setNotificationStyleVariant(storedNotificationStyle);
      }
    };

    assignRandomVariants();

    return () => {
      telemetry.endSpan(span);
    };
  }, []);

  // Toggle mobile enablement for a connection
  const toggleMobileEnabled = (connectionId: string) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === connectionId
          ? { ...conn, mobileEnabled: !conn.mobileEnabled }
          : conn,
      ),
    );

    const connection = connections.find((conn) => conn.id === connectionId);

    toast({
      title: connection?.mobileEnabled
        ? "Mobile Access Disabled"
        : "Mobile Access Enabled",
      description: `${connection?.name} is now ${connection?.mobileEnabled ? "disabled" : "enabled"} for mobile access.`,
      variant: "default",
    });

    // Record in telemetry
    telemetry.addEvent(
      telemetry.currentSpan,
      "mcp.mobile_management.toggle_mobile",
      {
        "mcp.connection.id": connectionId,
        "mcp.connection.enabled": !connection?.mobileEnabled,
      },
    );

    // Record in governance
    governance.recordAudit({
      actor: "user",
      action: "toggle_mobile_access",
      resource: connection?.url || "",
      outcome: "success",
      details: `${connection?.mobileEnabled ? "Disabled" : "Enabled"} mobile access for ${connection?.name}`,
      severity: "info",
      tags: ["mcp", "mobile", "access_control"],
    });
  };

  // Toggle notifications for a connection
  const toggleNotifications = (connectionId: string) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === connectionId
          ? { ...conn, notifications: !conn.notifications }
          : conn,
      ),
    );

    const connection = connections.find((conn) => conn.id === connectionId);

    toast({
      title: connection?.notifications
        ? "Notifications Disabled"
        : "Notifications Enabled",
      description: `Notifications for ${connection?.name} are now ${connection?.notifications ? "disabled" : "enabled"}.`,
      variant: "default",
    });

    // Record in telemetry
    telemetry.addEvent(
      telemetry.currentSpan,
      "mcp.mobile_management.toggle_notifications",
      {
        "mcp.connection.id": connectionId,
        "mcp.connection.notifications": !connection?.notifications,
      },
    );
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    );

    // Record in telemetry
    telemetry.addEvent(
      telemetry.currentSpan,
      "mcp.mobile_management.mark_notification_read",
      {
        "mcp.notification.id": notificationId,
      },
    );
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));

    toast({
      title: "All Notifications Marked as Read",
      description: "All notifications have been marked as read.",
      variant: "default",
    });

    // Record in telemetry
    telemetry.addEvent(
      telemetry.currentSpan,
      "mcp.mobile_management.mark_all_notifications_read",
      {
        "mcp.notification.count": notifications.length,
      },
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);

    toast({
      title: "All Notifications Cleared",
      description: "All notifications have been cleared.",
      variant: "default",
    });

    // Record in telemetry
    telemetry.addEvent(
      telemetry.currentSpan,
      "mcp.mobile_management.clear_all_notifications",
      {
        "mcp.notification.count": notifications.length,
      },
    );

    // Record in governance
    governance.recordAudit({
      actor: "user",
      action: "clear_notifications",
      resource: "mcp_notifications",
      outcome: "success",
      details: `Cleared ${notifications.length} notifications`,
      severity: "info",
      tags: ["mcp", "mobile", "notifications"],
    });
  };

  // Toggle push notifications
  const togglePushNotifications = () => {
    setPushNotificationsEnabled(!pushNotificationsEnabled);

    toast({
      title: pushNotificationsEnabled
        ? "Push Notifications Disabled"
        : "Push Notifications Enabled",
      description: `Push notifications are now ${pushNotificationsEnabled ? "disabled" : "enabled"}.`,
      variant: "default",
    });

    // Record in telemetry
    telemetry.addEvent(
      telemetry.currentSpan,
      "mcp.mobile_management.toggle_push_notifications",
      {
        "mcp.push_notifications.enabled": !pushNotificationsEnabled,
      },
    );

    // Record in governance
    governance.recordAudit({
      actor: "user",
      action: "toggle_push_notifications",
      resource: "mcp_notifications",
      outcome: "success",
      details: `${pushNotificationsEnabled ? "Disabled" : "Enabled"} push notifications`,
      severity: "info",
      tags: ["mcp", "mobile", "notifications"],
    });
  };

  // Toggle mobile data saver
  const toggleMobileDataSaver = () => {
    setMobileDataSaver(!mobileDataSaver);

    toast({
      title: mobileDataSaver ? "Data Saver Disabled" : "Data Saver Enabled",
      description: `Mobile data saver mode is now ${mobileDataSaver ? "disabled" : "enabled"}.`,
      variant: "default",
    });

    // Record in telemetry
    telemetry.addEvent(
      telemetry.currentSpan,
      "mcp.mobile_management.toggle_data_saver",
      {
        "mcp.data_saver.enabled": !mobileDataSaver,
      },
    );
  };

  // Toggle offline mode
  const toggleOfflineMode = () => {
    setOfflineMode(!offlineMode);

    toast({
      title: offlineMode ? "Online Mode" : "Offline Mode",
      description: `App is now in ${offlineMode ? "online" : "offline"} mode.`,
      variant: "default",
    });

    // Record in telemetry
    telemetry.addEvent(
      telemetry.currentSpan,
      "mcp.mobile_management.toggle_offline_mode",
      {
        "mcp.offline_mode.enabled": !offlineMode,
      },
    );
  };

  // Get notification badge color
  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-destructive text-destructive-foreground";
      case "warning":
        return "bg-yellow-500 text-white";
      case "success":
        return "bg-green-500 text-white";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      case "warning":
        return <AlertCircle className="h-4 w-4" />;
      case "success":
        return <Check className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Get connection status badge
  const getConnectionStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "active" ? "success" : "destructive"}>
        {status}
      </Badge>
    );
  };

  // Get time ago string
  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) {
      return `${diffSec} seconds ago`;
    } else if (diffMin < 60) {
      return `${diffMin} minutes ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hours ago`;
    } else {
      return `${diffDay} days ago`;
    }
  };

  // Render connections tab content
  const renderConnectionsTab = () => {
    return (
      <div className="space-y-4">
        {connections.map((connection) => (
          <Card
            key={connection.id}
            className={`${layoutVariant === VARIANTS.LAYOUT.COMPACT ? "p-3" : ""}`}
          >
            <CardHeader
              className={`${layoutVariant === VARIANTS.LAYOUT.COMPACT ? "p-2 pb-1" : "pb-2"}`}
            >
              <div className="flex justify-between items-center">
                <CardTitle
                  className={`${layoutVariant === VARIANTS.LAYOUT.COMPACT ? "text-base" : ""} flex items-center gap-2`}
                >
                  {connection.type === "server" ? (
                    <Server className="h-5 w-5 text-primary" />
                  ) : (
                    <Database className="h-5 w-5 text-secondary" />
                  )}
                  {connection.name}
                </CardTitle>
                {getConnectionStatusBadge(connection.status)}
              </div>
              {layoutVariant === VARIANTS.LAYOUT.EXPANDED && (
                <CardDescription>{connection.url}</CardDescription>
              )}
            </CardHeader>
            <CardContent
              className={`${layoutVariant === VARIANTS.LAYOUT.COMPACT ? "p-2 pt-0" : ""}`}
            >
              <div className="text-sm text-muted-foreground mb-2">
                Last synced: {getTimeAgo(connection.lastSync)}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={connection.status !== "active"}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Sync Now
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    navigate(
                      `/agents/mcp-capability-mapping?highlight=${connection.id}`,
                    )
                  }
                >
                  <Link className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </CardContent>
            <CardFooter
              className={`flex justify-between border-t ${layoutVariant === VARIANTS.LAYOUT.COMPACT ? "p-2" : ""}`}
            >
              <div className="flex items-center gap-2">
                <Label
                  htmlFor={`mobile-${connection.id}`}
                  className="text-sm cursor-pointer"
                >
                  Mobile Access
                </Label>
                <Switch
                  id={`mobile-${connection.id}`}
                  checked={connection.mobileEnabled}
                  onCheckedChange={() => toggleMobileEnabled(connection.id)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Label
                  htmlFor={`notifications-${connection.id}`}
                  className="text-sm cursor-pointer"
                >
                  Notifications
                </Label>
                <Switch
                  id={`notifications-${connection.id}`}
                  checked={connection.notifications}
                  onCheckedChange={() => toggleNotifications(connection.id)}
                  disabled={!connection.mobileEnabled}
                />
              </div>
            </CardFooter>
          </Card>
        ))}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/agents/mcp-setup-wizard")}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add New Connection
        </Button>
      </div>
    );
  };

  // Render notifications tab content
  const renderNotificationsTab = () => {
    const unreadCount = notifications.filter((notif) => !notif.read).length;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {unreadCount} unread notifications
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllNotificationsAsRead}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              Clear All
            </Button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BellRing className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`${notification.read ? "opacity-75" : ""} ${layoutVariant === VARIANTS.LAYOUT.COMPACT ? "p-3" : ""}`}
              >
                <CardHeader
                  className={`${layoutVariant === VARIANTS.LAYOUT.COMPACT ? "p-2 pb-1" : "pb-2"}`}
                >
                  <div className="flex justify-between items-center">
                    <CardTitle
                      className={`${layoutVariant === VARIANTS.LAYOUT.COMPACT ? "text-base" : ""} flex items-center gap-2`}
                    >
                      <div
                        className={`p-1 rounded-full ${getNotificationBadgeColor(notification.type)}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      {notification.title}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                      {getTimeAgo(notification.timestamp)}
                    </div>
                  </div>
                </CardHeader>

                {(layoutVariant === VARIANTS.LAYOUT.EXPANDED ||
                  notificationStyleVariant ===
                    VARIANTS.NOTIFICATION_STYLE.DETAILED) && (
                  <CardContent
                    className={`${layoutVariant === VARIANTS.LAYOUT.COMPACT ? "p-2 pt-0" : ""}`}
                  >
                    <p className="text-sm">{notification.message}</p>

                    {notificationStyleVariant ===
                      VARIANTS.NOTIFICATION_STYLE.DETAILED && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground">
                          Related to:{" "}
                          {connections.find(
                            (conn) => conn.id === notification.connectionId,
                          )?.name || "Unknown"}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}

                <CardFooter
                  className={`flex justify-end border-t ${layoutVariant === VARIANTS.LAYOUT.COMPACT ? "p-2" : ""}`}
                >
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(
                        `/agents/mcp-capability-mapping?highlight=${notification.connectionId}`,
                      )
                    }
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render settings tab content
  const renderSettingsTab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications on mobile devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications" className="font-medium">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your mobile device
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotificationsEnabled}
                onCheckedChange={togglePushNotifications}
              />
            </div>

            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <div className="flex items-center justify-between">
                <Label htmlFor="critical-alerts" className="text-sm">
                  Critical Alerts
                </Label>
                <Switch
                  id="critical-alerts"
                  checked={criticalAlertsEnabled}
                  onCheckedChange={() =>
                    setCriticalAlertsEnabled(!criticalAlertsEnabled)
                  }
                  disabled={!pushNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="performance-alerts" className="text-sm">
                  Performance Alerts
                </Label>
                <Switch
                  id="performance-alerts"
                  checked={performanceAlertsEnabled}
                  onCheckedChange={() =>
                    setPerformanceAlertsEnabled(!performanceAlertsEnabled)
                  }
                  disabled={!pushNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="security-alerts" className="text-sm">
                  Security Alerts
                </Label>
                <Switch
                  id="security-alerts"
                  checked={securityAlertsEnabled}
                  onCheckedChange={() =>
                    setSecurityAlertsEnabled(!securityAlertsEnabled)
                  }
                  disabled={!pushNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="data-update-alerts" className="text-sm">
                  Data Update Alerts
                </Label>
                <Switch
                  id="data-update-alerts"
                  checked={dataUpdateAlertsEnabled}
                  onCheckedChange={() =>
                    setDataUpdateAlertsEnabled(!dataUpdateAlertsEnabled)
                  }
                  disabled={!pushNotificationsEnabled}
                />
              </div>
            </div>

            <div className="pt-2">
              <Label htmlFor="notification-frequency" className="text-sm">
                Notification Frequency
              </Label>
              <Select
                value={notificationFrequency}
                onValueChange={setNotificationFrequency}
                disabled={!pushNotificationsEnabled}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile Settings
            </CardTitle>
            <CardDescription>
              Configure mobile-specific settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="data-saver" className="font-medium">
                  Data Saver Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Reduce data usage when on cellular networks
                </p>
              </div>
              <Switch
                id="data-saver"
                checked={mobileDataSaver}
                onCheckedChange={toggleMobileDataSaver}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="offline-mode" className="font-medium">
                  Offline Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use cached data when offline
                </p>
              </div>
              <Switch
                id="offline-mode"
                checked={offlineMode}
                onCheckedChange={toggleOfflineMode}
              />
            </div>

            <div className="pt-2">
              <Label htmlFor="sync-frequency" className="text-sm">
                Sync Frequency
              </Label>
              <Select
                value={syncFrequency}
                onValueChange={setSyncFrequency}
                disabled={offlineMode}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5min">Every 5 minutes</SelectItem>
                  <SelectItem value="15min">Every 15 minutes</SelectItem>
                  <SelectItem value="30min">Every 30 minutes</SelectItem>
                  <SelectItem value="1hour">Every hour</SelectItem>
                  <SelectItem value="manual">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Display Settings
            </CardTitle>
            <CardDescription>
              Configure how MCP information is displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Layout Style</Label>
                <p className="text-sm text-muted-foreground">
                  Choose between compact and expanded layouts
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={
                    layoutVariant === VARIANTS.LAYOUT.COMPACT
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setLayoutVariant(VARIANTS.LAYOUT.COMPACT);
                    localStorage.setItem(
                      "ab_test_layout",
                      VARIANTS.LAYOUT.COMPACT,
                    );

                    // Record in telemetry
                    telemetry.addEvent(
                      telemetry.currentSpan,
                      "mcp.ab_testing.layout_changed",
                      {
                        "mcp.ab_testing.layout": VARIANTS.LAYOUT.COMPACT,
                        "mcp.ab_testing.user_selected": true,
                      },
                    );
                  }}
                >
                  Compact
                </Button>
                <Button
                  variant={
                    layoutVariant === VARIANTS.LAYOUT.EXPANDED
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setLayoutVariant(VARIANTS.LAYOUT.EXPANDED);
                    localStorage.setItem(
                      "ab_test_layout",
                      VARIANTS.LAYOUT.EXPANDED,
                    );

                    // Record in telemetry
                    telemetry.addEvent(
                      telemetry.currentSpan,
                      "mcp.ab_testing.layout_changed",
                      {
                        "mcp.ab_testing.layout": VARIANTS.LAYOUT.EXPANDED,
                        "mcp.ab_testing.user_selected": true,
                      },
                    );
                  }}
                >
                  Expanded
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Color Scheme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose between standard and high contrast
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={
                    colorSchemeVariant === VARIANTS.COLOR_SCHEME.STANDARD
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setColorSchemeVariant(VARIANTS.COLOR_SCHEME.STANDARD);
                    localStorage.setItem(
                      "ab_test_color_scheme",
                      VARIANTS.COLOR_SCHEME.STANDARD,
                    );

                    // Record in telemetry
                    telemetry.addEvent(
                      telemetry.currentSpan,
                      "mcp.ab_testing.color_scheme_changed",
                      {
                        "mcp.ab_testing.color_scheme":
                          VARIANTS.COLOR_SCHEME.STANDARD,
                        "mcp.ab_testing.user_selected": true,
                      },
                    );
                  }}
                >
                  Standard
                </Button>
                <Button
                  variant={
                    colorSchemeVariant === VARIANTS.COLOR_SCHEME.HIGH_CONTRAST
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setColorSchemeVariant(VARIANTS.COLOR_SCHEME.HIGH_CONTRAST);
                    localStorage.setItem(
                      "ab_test_color_scheme",
                      VARIANTS.COLOR_SCHEME.HIGH_CONTRAST,
                    );

                    // Record in telemetry
                    telemetry.addEvent(
                      telemetry.currentSpan,
                      "mcp.ab_testing.color_scheme_changed",
                      {
                        "mcp.ab_testing.color_scheme":
                          VARIANTS.COLOR_SCHEME.HIGH_CONTRAST,
                        "mcp.ab_testing.user_selected": true,
                      },
                    );
                  }}
                >
                  High Contrast
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Notification Style</Label>
                <p className="text-sm text-muted-foreground">
                  Choose between minimal and detailed notifications
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={
                    notificationStyleVariant ===
                    VARIANTS.NOTIFICATION_STYLE.MINIMAL
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setNotificationStyleVariant(
                      VARIANTS.NOTIFICATION_STYLE.MINIMAL,
                    );
                    localStorage.setItem(
                      "ab_test_notification_style",
                      VARIANTS.NOTIFICATION_STYLE.MINIMAL,
                    );

                    // Record in telemetry
                    telemetry.addEvent(
                      telemetry.currentSpan,
                      "mcp.ab_testing.notification_style_changed",
                      {
                        "mcp.ab_testing.notification_style":
                          VARIANTS.NOTIFICATION_STYLE.MINIMAL,
                        "mcp.ab_testing.user_selected": true,
                      },
                    );
                  }}
                >
                  Minimal
                </Button>
                <Button
                  variant={
                    notificationStyleVariant ===
                    VARIANTS.NOTIFICATION_STYLE.DETAILED
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setNotificationStyleVariant(
                      VARIANTS.NOTIFICATION_STYLE.DETAILED,
                    );
                    localStorage.setItem(
                      "ab_test_notification_style",
                      VARIANTS.NOTIFICATION_STYLE.DETAILED,
                    );

                    // Record in telemetry
                    telemetry.addEvent(
                      telemetry.currentSpan,
                      "mcp.ab_testing.notification_style_changed",
                      {
                        "mcp.ab_testing.notification_style":
                          VARIANTS.NOTIFICATION_STYLE.DETAILED,
                        "mcp.ab_testing.user_selected": true,
                      },
                    );
                  }}
                >
                  Detailed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            MCP Mobile Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage MCP connections on mobile devices
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate("/agents/mcp-capability-mapping")}
          >
            <Network size={16} />
            View Map
          </Button>

          <Button
            className="gap-2"
            onClick={() => navigate("/agents/mcp-setup-wizard")}
          >
            <Plus size={16} />
            Add Connection
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections">
            <Server className="h-4 w-4 mr-2" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <BellRing className="h-4 w-4 mr-2" />
            Notifications
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="mt-6">
          {renderConnectionsTab()}
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          {renderNotificationsTab()}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          {renderSettingsTab()}
        </TabsContent>
      </Tabs>

      <Card
        className={
          colorSchemeVariant === VARIANTS.COLOR_SCHEME.HIGH_CONTRAST
            ? "border-2 border-primary"
            : ""
        }
      >
        <CardHeader>
          <CardTitle>Mobile Access Overview</CardTitle>
          <CardDescription>
            Summary of mobile access and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Mobile-Enabled Connections
                </span>
                <span className="text-2xl font-bold">
                  {connections.filter((c) => c.mobileEnabled).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Total Connections</span>
                <span>{connections.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Active Connections</span>
                <span>
                  {connections.filter((c) => c.status === "active").length}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Notification-Enabled
                </span>
                <span className="text-2xl font-bold">
                  {connections.filter((c) => c.notifications).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Unread Notifications</span>
                <span>{notifications.filter((n) => !n.read).length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Total Notifications</span>
                <span>{notifications.length}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mobile Status</span>
                <span className="text-2xl font-bold">
                  {offlineMode ? "Offline" : "Online"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Data Saver</span>
                <span>{mobileDataSaver ? "Enabled" : "Disabled"}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Sync Frequency</span>
                <span>
                  {syncFrequency === "5min"
                    ? "Every 5 minutes"
                    : syncFrequency === "15min"
                      ? "Every 15 minutes"
                      : syncFrequency === "30min"
                        ? "Every 30 minutes"
                        : syncFrequency === "1hour"
                          ? "Every hour"
                          : "Manual only"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4" />
            <span>
              Mobile management is{" "}
              {isMobile
                ? "optimized for your device"
                : "available on mobile devices"}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MCPMobileManagement;
