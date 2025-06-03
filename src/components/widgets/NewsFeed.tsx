/**
 * NewsFeed Widget
 * Displays a list of relevant financial news articles.
 * Part of Story 2.2: Customizable Widget System
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
// import Link from 'next/link'; // Removed next/link
// import Image from 'next/image'; // Removed next/image
import { WidgetComponentProps } from "../../types/dashboard";
import { NewsFeedData, NewsArticle } from "../../types/widget-data";
import { useTheme } from "../../contexts/ThemeContext";
import { apiClient } from "../../services/api";
import {
  Newspaper,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  RadioTower,
  Tag,
  Filter,
  Search,
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
import { Input } from "../ui/input"; // Assuming Input component for search
import { cn } from "../../utils/cn";

const NewsFeed: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
  isEditMode,
  onConfigChange,
}) => {
  const { isDarkMode } = useTheme();
  const [newsData, setNewsData] = useState<NewsFeedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const articlesLimit = config.config?.limit || 5;
  const initialKeywords = config.config?.keywords || "";
  const [keywords, setKeywords] = useState<string>(initialKeywords);
  const [debouncedKeywords, setDebouncedKeywords] =
    useState<string>(initialKeywords);

  // Debounce for search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeywords(keywords);
      // Persist to config if changed from initial
      if (keywords !== initialKeywords && onConfigChange && config) {
        onConfigChange(widgetId, {
          ...config,
          config: { ...config.config, keywords },
        });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [keywords, initialKeywords, widgetId, config, onConfigChange]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: NewsFeedData["filter"] = {};
      if (debouncedKeywords) filters.keywords = debouncedKeywords;
      // Could add more filters from config e.g. config.config.symbols, config.config.sources

      const data = await apiClient.getNewsFeedData(articlesLimit, filters);
      setNewsData(data);
    } catch (err: any) {
      console.error(`[${widgetId}] Error fetching news:`, err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [widgetId, articlesLimit, debouncedKeywords]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderArticleItem = (article: NewsArticle) => (
    <div
      key={article.id}
      className="py-3 border-b border-border/50 last:border-b-0"
    >
      <div className="flex items-start space-x-3">
        {article.imageUrl && (
          <div className="flex-shrink-0 w-20 h-16 relative rounded overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}
        <div className="flex-grow">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
              {article.title}
            </h4>
          </a>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {article.summary}
          </p>
          <div className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap gap-x-2 gap-y-1">
            <span className="flex items-center">
              <RadioTower className="h-3 w-3 mr-1" /> {article.source}
            </span>
            <span>
              {new Date(article.publishedAt).toLocaleDateString()}{" "}
              {new Date(article.publishedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {article.symbols && article.symbols.length > 0 && (
              <div className="flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                {article.symbols.map((sym) => (
                  <Badge
                    key={sym}
                    variant="secondary"
                    className="mr-1 text-xs font-normal"
                  >
                    {sym}
                  </Badge>
                ))}
              </div>
            )}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3 mr-0.5" /> Read
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(); // Trigger fetch with current debouncedKeywords
  };

  if (isLoading && !newsData) {
    // Show full loading state only on initial load
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
              <Newspaper className="h-4 w-4 mr-2 text-primary" />
              {config.title || "News Feed"}
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          Loading news...
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
              {config.title || "News Feed"}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchData}
              title="Retry loading news"
              className="h-7 w-7"
            >
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
        <div className="flex items-center justify-between mb-1.5">
          <CardTitle className="text-base font-semibold flex items-center">
            <Newspaper className="h-4 w-4 mr-2 text-primary" />
            {config.title || "News Feed"}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchData}
            title="Refresh news"
            className="h-7 w-7"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
        {isEditMode && (
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search news (e.g. AAPL, inflation)..."
              className="pl-7 text-xs h-8"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </form>
        )}
        <CardDescription className="text-xs text-muted-foreground pt-1">
          Displaying {newsData?.articles.length || 0} articles. Last updated:{" "}
          {newsData
            ? new Date(newsData.lastRefreshed).toLocaleTimeString()
            : "N/A"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full px-3">
          {(!newsData || newsData.articles.length === 0) && !isLoading && (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No news articles found for your criteria.
            </div>
          )}
          {newsData && newsData.articles.map(renderArticleItem)}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NewsFeed;
