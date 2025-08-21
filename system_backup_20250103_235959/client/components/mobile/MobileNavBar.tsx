import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Search,
  Filter,
  MapPin,
  Share2,
  Bookmark,
  Star,
} from "lucide-react";

interface MobileNavBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showSearch?: boolean;
  showFilter?: boolean;
  showMap?: boolean;
  showShare?: boolean;
  showBookmark?: boolean;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  onShareClick?: () => void;
  onFilterClick?: () => void;
  rating?: number;
  reviewCount?: number;
  rightActions?: React.ReactNode;
  backgroundColor?: string;
}

export function MobileNavBar({
  title,
  subtitle,
  onBack,
  showSearch = false,
  showFilter = false,
  showMap = false,
  showShare = false,
  showBookmark = false,
  isBookmarked = false,
  onBookmarkToggle,
  onShareClick,
  onFilterClick,
  rating,
  reviewCount,
  rightActions,
  backgroundColor = "#003580",
}: MobileNavBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Simple navigation back or fallback to home
      const currentPath = location.pathname;

      try {
        // Try to go back in browser history
        if (window.history.length > 1 && document.referrer) {
          navigate(-1);
        } else {
          // Fallback to home page
          navigate("/");
        }
      } catch (error) {
        // Fallback to home page if navigation fails
        console.log("Navigation fallback:", error);
        navigate("/");
      }
    }
  };

  return (
    <div className="md:hidden bg-white">
      {/* Main Header */}
      <div className="text-white" style={{ backgroundColor }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2 mr-3 flex-shrink-0"
              onClick={handleBack}
            >
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <ChevronLeft className="w-4 h-4" />
              </div>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-lg line-clamp-1">{title}</h1>
              {subtitle && (
                <div className="flex items-center text-blue-200">
                  {rating && (
                    <>
                      <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center mr-1">
                        <Star className="w-2.5 h-2.5 fill-white text-white" />
                      </div>
                      <span className="text-xs">{rating}</span>
                      {reviewCount && (
                        <span className="text-xs ml-1">
                          • {reviewCount} reviews
                        </span>
                      )}
                    </>
                  )}
                  {!rating && <p className="text-xs truncate">{subtitle}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {rightActions}

            {showBookmark && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
                onClick={onBookmarkToggle}
              >
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bookmark
                    className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                </div>
              </Button>
            )}

            {showShare && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
                onClick={onShareClick}
              >
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Share2 className="w-4 h-4" />
                </div>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {(showSearch || showFilter || showMap) && (
        <div className="bg-white border-b border-gray-200 p-3">
          <div className="flex gap-2 overflow-x-auto">
            {showSearch && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 whitespace-nowrap min-w-fit border-[#003580] text-[#003580] hover:bg-[#003580] hover:text-white"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-[#003580] to-[#0071c2] rounded flex items-center justify-center">
                  <Search className="w-3 h-3 text-white" />
                </div>
                Search
              </Button>
            )}

            {showFilter && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 whitespace-nowrap min-w-fit border-[#003580] text-[#003580] hover:bg-[#003580] hover:text-white"
                onClick={onFilterClick}
              >
                <div className="w-5 h-5 bg-gradient-to-br from-[#003580] to-[#0071c2] rounded flex items-center justify-center">
                  <Filter className="w-3 h-3 text-white" />
                </div>
                Filters
              </Button>
            )}

            {showMap && (
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap border-[#003580] text-[#003580] hover:bg-[#003580] hover:text-white flex items-center gap-2"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-[#003580] to-[#0071c2] rounded flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                Map
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
