import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortKey = "default" | "distance" | "rating" | "name";

interface PageHeaderCardProps {
  title?: string;
  placeholder?: string;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  onSearch?: () => void;
  selectedFilters?: string[];
  toggleFilter?: (filter: string) => void;
  sortBy?: SortKey;
  setSortBy?: (v: SortKey) => void;
  resultsCount?: number;
  hideFilters?: boolean;
}

export const PageHeaderCard: React.FC<PageHeaderCardProps> = ({
  title,
  placeholder,
  searchTerm,
  setSearchTerm,
  onSearch,
  sortBy = "default",
  setSortBy,
  resultsCount,
  hideFilters = true,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch?.();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-6 md:p-7">
        {title && (
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-comfortaa font-bold text-black">
              {title}
            </h1>
            {typeof resultsCount === "number" && (
              <span className="text-xs sm:text-sm text-gray-600 font-roboto">
                {resultsCount} results
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="flex-1 min-w-0">
            <Input
              type="text"
              placeholder={placeholder || "Search..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full bg-white border-gray-300 text-sm sm:text-base focus:border-black focus:ring-black"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="font-roboto text-sm">
                  <span className="font-semibold mr-1">
                    {sortBy === "default"
                      ? "Default"
                      : sortBy === "distance"
                      ? "Distance"
                      : sortBy === "rating"
                      ? "Rating"
                      : "Name A–Z"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setSortBy?.("default")}>Default</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy?.("distance")}>Distance</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy?.("rating")}>Rating</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy?.("name")}>Name A–Z</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={onSearch} className="bg-black hover:bg-gray-900 text-white">Search</Button>
          </div>
        </div>

        {!hideFilters && (
          <div className="mt-4 text-xs text-gray-500">
            {/* Filters intentionally hidden by default in this first step */}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeaderCard;
