import React from "react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="text-6xl mb-6 opacity-60">
          {icon}
        </div>
        
        {/* Title */}
        <h3 className="text-2xl font-bold text-slate-800 mb-4">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-slate-600 mb-8 leading-relaxed">
          {description}
        </p>
        
        {/* Action Button */}
        {(actionText && actionLink) && (
          <Link
            to={actionLink}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
              text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 
              transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {actionText}
          </Link>
        )}
        
        {(actionText && onAction) && (
          <button
            onClick={onAction}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
              text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 
              transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;