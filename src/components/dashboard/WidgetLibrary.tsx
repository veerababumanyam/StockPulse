"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  WidgetMetadata,
  WidgetCategory,
  WidgetLibraryCategory,
  WidgetLibraryFilters,
  WIDGET_LIBRARY, // Using this directly as getAvailableWidgets() just returns it
  WidgetType,
  WidgetConfig,
} from "../../types/dashboard";
import { useTheme } from "../../contexts/ThemeContext";
import {
  X,
  Search,
  CheckSquare,
  Square,
  PlusCircle,
  Filter,
} from "lucide-react";
import { dashboardService } from "../../services/dashboardService";

interface WidgetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetType: WidgetType) => void;
  currentWidgets: WidgetConfig[]; // To potentially disable adding already present widgets (optional feature)
}

const ALL_CATEGORIES: WidgetCategory[] = [
  "portfolio",
  "market",
  "trading",
  "analytics",
  "news",
];

const WidgetLibrary: React.FC<WidgetLibraryProps> = ({
  isOpen,
  onClose,
  onAddWidget,
  currentWidgets,
}) => {
  const { isDarkMode } = useTheme();
  const [filters, setFilters] = useState<WidgetLibraryFilters>({
    searchQuery: "",
    categories: [],
    showPremiumOnly: false,
    showAvailableOnly: false, // Placeholder for future permission checks
    sortBy: "category",
    sortOrder: "asc",
  });
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);

  const availableWidgets = useMemo(() => WIDGET_LIBRARY, []);

  const filteredAndSortedWidgets = useMemo(() => {
    let widgets = [...availableWidgets];

    // Filter by search query
    if (filters.searchQuery) {
      widgets = widgets.filter(
        (widget) =>
          widget.name
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase()) ||
          widget.description
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase()) ||
          widget.tags?.some((tag) =>
            tag.toLowerCase().includes(filters.searchQuery.toLowerCase()),
          ),
      );
    }

    // Filter by category
    if (filters.categories.length > 0) {
      widgets = widgets.filter((widget) =>
        filters.categories.includes(widget.category),
      );
    }

    // Filter by premium
    if (filters.showPremiumOnly) {
      widgets = widgets.filter((widget) => widget.isPremium);
    }

    // TODO: Implement showAvailableOnly based on user permissions if needed

    // Sort
    widgets.sort((a, b) => {
      let comparison = 0;
      if (filters.sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (filters.sortBy === "category") {
        comparison = a.category.localeCompare(b.category);
        if (comparison === 0) {
          comparison = a.name.localeCompare(b.name); // Secondary sort by name within category
        }
      }
      // TODO: Implement popularity and recent sorting if metrics are available
      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return widgets;
  }, [availableWidgets, filters]);

  const groupedWidgets = useMemo(() => {
    const groups: WidgetLibraryCategory[] = [];
    ALL_CATEGORIES.forEach((category) => {
      const categoryWidgets = filteredAndSortedWidgets.filter(
        (w) => w.category === category,
      );
      if (categoryWidgets.length > 0) {
        const categoryMeta = WIDGET_LIBRARY.find(
          (w) => w.category === category,
        ); // Get a sample for name/icon
        groups.push({
          category: category,
          name: category.charAt(0).toUpperCase() + category.slice(1), // Simple capitalization
          description: `Widgets related to ${category}`, // Generic description
          icon: categoryMeta?.icon || "LayoutGrid", // Fallback icon
          widgets: categoryWidgets,
          isExpanded: true, // Default to expanded
        });
      }
    });
    // If no categories selected, or search is active, show flat list or "all" category
    if (filters.categories.length === 0 && filters.searchQuery) {
      if (filteredAndSortedWidgets.length > 0) {
        return [
          {
            category: "search-results" as WidgetCategory, // Special category
            name: "Search Results",
            description: "Widgets matching your search criteria",
            icon: "Search",
            widgets: filteredAndSortedWidgets,
            isExpanded: true,
          },
        ];
      }
    }
    if (
      filters.categories.length === 0 &&
      !filters.searchQuery &&
      groups.length > 1
    ) {
      // Show all widgets if no specific category is chosen and no search query
      return [
        {
          category: "all" as WidgetCategory,
          name: "All Widgets",
          description: "Browse all available widgets",
          icon: "LayoutGrid",
          widgets: filteredAndSortedWidgets,
          isExpanded: true,
        },
        ...groups,
      ]; // Show "All" then categorized
    }

    return groups.length > 0
      ? groups
      : [
          {
            // Ensure at least one group if results exist, or an empty state
            category: "no-results" as WidgetCategory,
            name:
              filters.searchQuery || filters.categories.length > 0
                ? "No Matching Widgets"
                : "No Widgets Available",
            description: "Try adjusting your filters or search.",
            icon: "Inbox",
            widgets: [],
            isExpanded: true,
          },
        ];
  }, [filteredAndSortedWidgets, filters.categories, filters.searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchQuery: e.target.value });
  };

  const toggleCategoryFilter = (category: WidgetCategory) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      categories: prevFilters.categories.includes(category)
        ? prevFilters.categories.filter((c) => c !== category)
        : [...prevFilters.categories, category],
    }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = e.target.value as
      | "name"
      | "category"
      | "popularity"
      | "recent";
    setFilters({ ...filters, sortBy: newSortBy });
  };

  const toggleSortOrder = () => {
    setFilters({
      ...filters,
      sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
    });
  };

  const handleAddWidgetClick = (widgetType: WidgetType) => {
    onAddWidget(widgetType);
    // Optionally close modal after adding: onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle(isDarkMode)}>
      <div style={modalStyle(isDarkMode)}>
        <div style={headerStyle}>
          <h2
            style={{
              margin: 0,
              fontSize: "var(--font-size-xl)",
              color: "var(--color-text-primary)",
            }}
          >
            Widget Library
          </h2>
          <button onClick={onClose} style={closeButtonStyle(isDarkMode)}>
            <X size={24} />
          </button>
        </div>

        <div style={controlsContainerStyle}>
          <div style={searchContainerStyle}>
            <Search
              size={18}
              style={{
                color: "var(--color-text-tertiary)",
                marginRight: "var(--spacing-xs)",
              }}
            />
            <input
              type="text"
              placeholder="Search widgets (e.g., Portfolio, AI, News)..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              style={searchInputStyle(isDarkMode)}
            />
          </div>
          <button
            onClick={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
            style={filterButtonStyle(isDarkMode, isFiltersPanelOpen)}
            title={isFiltersPanelOpen ? "Close Filters" : "Open Filters"}
          >
            <Filter size={18} />
            <span style={{ marginLeft: "var(--spacing-xs)" }}>Filters</span>
          </button>
        </div>

        {isFiltersPanelOpen && (
          <div style={filterPanelStyle(isDarkMode)}>
            <div style={filterGroupStyle}>
              <h4 style={filterGroupTitleStyle}>Categories</h4>
              <div style={categoryFiltersContainerStyle}>
                {ALL_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategoryFilter(category)}
                    style={categoryButtonStyle(
                      isDarkMode,
                      filters.categories.includes(category),
                    )}
                  >
                    {filters.categories.includes(category) ? (
                      <CheckSquare
                        size={16}
                        style={{ marginRight: "var(--spacing-xxs)" }}
                      />
                    ) : (
                      <Square
                        size={16}
                        style={{ marginRight: "var(--spacing-xxs)" }}
                      />
                    )}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={filterGroupStyle}>
              <h4 style={filterGroupTitleStyle}>Sort By</h4>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-sm)",
                }}
              >
                <select
                  value={filters.sortBy}
                  onChange={handleSortChange}
                  style={selectStyle(isDarkMode)}
                >
                  <option value="category">Category</option>
                  <option value="name">Name</option>
                  {/* <option value="popularity">Popularity</option> */}
                  {/* <option value="recent">Recently Added</option> */}
                </select>
                <button
                  onClick={toggleSortOrder}
                  style={sortOrderButtonStyle(isDarkMode)}
                >
                  {filters.sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                </button>
              </div>
            </div>
            <div style={filterGroupStyle}>
              <h4 style={filterGroupTitleStyle}>Options</h4>
              <label style={checkboxLabelStyle(isDarkMode)}>
                <input
                  type="checkbox"
                  checked={filters.showPremiumOnly}
                  onChange={() =>
                    setFilters((prev) => ({
                      ...prev,
                      showPremiumOnly: !prev.showPremiumOnly,
                    }))
                  }
                  style={{ marginRight: "var(--spacing-xs)" }}
                />
                Show Premium Widgets Only
              </label>
            </div>
          </div>
        )}

        <div style={widgetListStyle}>
          {groupedWidgets.map((group) =>
            group.widgets.length > 0 ||
            group.category === ("no-results" as WidgetCategory) ? (
              <div key={group.category} style={categoryGroupStyle}>
                <h3 style={categoryHeaderStyle(isDarkMode)}>
                  {group.name}
                  <span
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-text-tertiary)",
                      marginLeft: "var(--spacing-sm)",
                    }}
                  >
                    ({group.widgets.length}{" "}
                    {group.widgets.length === 1 ? "widget" : "widgets"})
                  </span>
                </h3>
                <div style={widgetItemsContainerStyle}>
                  {group.widgets.map((widget) => (
                    <div key={widget.type} style={widgetItemStyle(isDarkMode)}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <h4 style={widgetTitleStyle(isDarkMode)}>
                            {widget.name}
                          </h4>
                          <p style={widgetDescriptionStyle(isDarkMode)}>
                            {widget.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddWidgetClick(widget.type)}
                          style={addButtonStyle(isDarkMode)}
                          title={`Add ${widget.name} to dashboard`}
                        >
                          <PlusCircle size={20} />
                        </button>
                      </div>
                      <div style={widgetMetaStyle(isDarkMode)}>
                        <span>Category: {widget.category}</span>
                        {widget.isPremium && (
                          <span style={premiumTagStyle(isDarkMode)}>
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
};

// Styles (using CSS variables for theming)
const overlayStyle = (isDarkMode: boolean): React.CSSProperties => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000, // Ensure it's above other content
  backdropFilter: "blur(4px)",
});

const modalStyle = (isDarkMode: boolean): React.CSSProperties => ({
  backgroundColor: "var(--color-background)",
  padding: "var(--spacing-lg)",
  borderRadius: "var(--border-radius-lg)",
  boxShadow: "var(--shadow-xl)",
  width: "clamp(300px, 90vw, 1000px)", // Responsive width
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  border: "1px solid var(--color-border-muted)",
});

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "var(--spacing-md)",
  paddingBottom: "var(--spacing-md)",
  borderBottom: "1px solid var(--color-border-subtle)",
};

const closeButtonStyle = (isDarkMode: boolean): React.CSSProperties => ({
  background: "none",
  border: "none",
  color: "var(--color-text-secondary)",
  cursor: "pointer",
  padding: "var(--spacing-xs)",
  borderRadius: "var(--border-radius-sm)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const controlsContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "var(--spacing-md)",
  gap: "var(--spacing-md)",
};

const searchContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexGrow: 1,
  padding: "var(--spacing-sm) var(--spacing-md)",
  backgroundColor: "var(--color-surface)",
  borderRadius: "var(--border-radius-md)",
  border: "1px solid var(--color-border-muted)",
};

const searchInputStyle = (isDarkMode: boolean): React.CSSProperties => ({
  flexGrow: 1,
  border: "none",
  outline: "none",
  fontSize: "var(--font-size-base)",
  color: "var(--color-text-primary)",
  backgroundColor: "transparent",
});

const filterButtonStyle = (
  isDarkMode: boolean,
  isActive: boolean,
): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  padding: "var(--spacing-sm) var(--spacing-md)",
  backgroundColor: isActive
    ? "var(--color-primary-muted)"
    : "var(--color-surface)",
  color: isActive ? "var(--color-primary-fg)" : "var(--color-text-secondary)",
  border: `1px solid ${isActive ? "var(--color-primary)" : "var(--color-border-muted)"}`,
  borderRadius: "var(--border-radius-md)",
  cursor: "pointer",
  fontWeight: "var(--font-weight-medium)",
  transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
});

const filterPanelStyle = (isDarkMode: boolean): React.CSSProperties => ({
  padding: "var(--spacing-md)",
  backgroundColor: "var(--color-surface-subtle)",
  borderRadius: "var(--border-radius-md)",
  marginBottom: "var(--spacing-md)",
  border: "1px solid var(--color-border-subtle)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--spacing-lg)",
});

const filterGroupStyle: React.CSSProperties = {};

const filterGroupTitleStyle: React.CSSProperties = {
  fontSize: "var(--font-size-md)",
  color: "var(--color-text-secondary)",
  marginBottom: "var(--spacing-sm)",
  fontWeight: "var(--font-weight-semibold)",
};

const categoryFiltersContainerStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--spacing-sm)",
};

const categoryButtonStyle = (
  isDarkMode: boolean,
  isActive: boolean,
): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  padding: "var(--spacing-xs) var(--spacing-md)",
  backgroundColor: isActive
    ? "var(--color-primary-muted)"
    : "var(--color-surface)",
  color: isActive ? "var(--color-primary-fg)" : "var(--color-text-secondary)",
  border: `1px solid ${isActive ? "var(--color-primary)" : "var(--color-border-muted)"}`,
  borderRadius: "var(--border-radius-sm)",
  cursor: "pointer",
  fontSize: "var(--font-size-sm)",
  transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
});

const selectStyle = (isDarkMode: boolean): React.CSSProperties => ({
  padding: "var(--spacing-sm)",
  borderRadius: "var(--border-radius-md)",
  border: "1px solid var(--color-border-muted)",
  backgroundColor: "var(--color-surface)",
  color: "var(--color-text-primary)",
  fontSize: "var(--font-size-sm)",
  minWidth: "150px",
});

const sortOrderButtonStyle = (isDarkMode: boolean): React.CSSProperties => ({
  padding: "var(--spacing-sm) var(--spacing-md)",
  borderRadius: "var(--border-radius-md)",
  border: "1px solid var(--color-border-muted)",
  backgroundColor: "var(--color-surface)",
  color: "var(--color-text-primary)",
  cursor: "pointer",
  fontSize: "var(--font-size-sm)",
});

const checkboxLabelStyle = (isDarkMode: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-secondary)",
  cursor: "pointer",
});

const widgetListStyle: React.CSSProperties = {
  flexGrow: 1,
  overflowY: "auto",
  paddingRight: "var(--spacing-sm)", // For scrollbar spacing
  marginRight: "-var(--spacing-sm)", // Counteract padding for full width feel
};

const categoryGroupStyle: React.CSSProperties = {
  marginBottom: "var(--spacing-lg)",
};

const categoryHeaderStyle = (isDarkMode: boolean): React.CSSProperties => ({
  fontSize: "var(--font-size-lg)",
  color: "var(--color-text-primary)",
  marginBottom: "var(--spacing-md)",
  paddingBottom: "var(--spacing-xs)",
  borderBottom: "1px solid var(--color-border-subtle)",
  fontWeight: "var(--font-weight-semibold)",
});

const widgetItemsContainerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", // Responsive columns
  gap: "var(--spacing-md)",
};

const widgetItemStyle = (isDarkMode: boolean): React.CSSProperties => ({
  backgroundColor: "var(--color-surface-subtle)",
  padding: "var(--spacing-md)",
  borderRadius: "var(--border-radius-md)",
  border: "1px solid var(--color-border-muted)",
  transition: "box-shadow 0.2s, border-color 0.2s",
});

const widgetTitleStyle = (isDarkMode: boolean): React.CSSProperties => ({
  fontSize: "var(--font-size-md)",
  color: "var(--color-text-primary)",
  fontWeight: "var(--font-weight-semibold)",
  marginBottom: "var(--spacing-xs)",
});

const widgetDescriptionStyle = (isDarkMode: boolean): React.CSSProperties => ({
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-secondary)",
  marginBottom: "var(--spacing-sm)",
  lineHeight: 1.5,
});

const addButtonStyle = (isDarkMode: boolean): React.CSSProperties => ({
  background: "var(--color-primary-muted)",
  border: "1px solid var(--color-primary)",
  color: "var(--color-primary-fg)",
  padding: "var(--spacing-xs)",
  borderRadius: "var(--border-radius-sm)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "flex-start", // Align to the top of the flex container if description is short
  transition: "background-color 0.2s",
});

const widgetMetaStyle = (isDarkMode: boolean): React.CSSProperties => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-tertiary)",
  marginTop: "var(--spacing-md)",
  paddingTop: "var(--spacing-sm)",
  borderTop: "1px solid var(--color-border-subtle)",
});

const premiumTagStyle = (isDarkMode: boolean): React.CSSProperties => ({
  backgroundColor: "var(--color-warning-muted)",
  color: "var(--color-warning-fg)",
  padding: "var(--spacing-xxs) var(--spacing-xs)",
  borderRadius: "var(--border-radius-sm)",
  fontWeight: "var(--font-weight-medium)",
});

export default WidgetLibrary;
