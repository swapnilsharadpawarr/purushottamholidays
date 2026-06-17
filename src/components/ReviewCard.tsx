import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Review } from '../lib/mockData';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  // Format Date to readable format (e.g. May 2026)
  const formatStayDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col bg-white border border-forest-100 rounded-2xl p-6 shadow-md hover-gold-shadow transition-all duration-300 relative">
      {/* Stars and Source */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4.5 w-4.5 ${
                i < review.rating
                  ? 'text-amber-500 fill-amber-500'
                  : 'text-forest-100'
              }`}
            />
          ))}
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            review.source === 'Google'
              ? 'bg-blue-50 text-blue-700 border-blue-100'
              : review.source === 'Website'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-forest-50 text-forest-700 border-forest-100'
          }`}
        >
          {review.source === 'Google' ? 'Google Review' : review.source === 'Website' ? 'Website Guest' : 'Testimonial'}
        </span>
      </div>

      {/* Review Text */}
      <p className="text-sm text-forest-700 italic leading-relaxed mb-4 flex-1">
        "{review.review_text}"
      </p>

      {/* Reviewer Details */}
      <div className="mt-auto pt-4 border-t border-forest-50 flex justify-between items-center text-xs">
        <div>
          <span className="font-bold text-forest-800 block text-sm">{review.reviewer_name}</span>
          {review.room_type && (
            <span className="text-forest-500 font-medium">{review.room_type}</span>
          )}
        </div>
        
        {review.stay_date && (
          <span className="text-forest-400 font-semibold bg-forest-50 px-2 py-1 rounded">
            Stayed: {formatStayDate(review.stay_date)}
          </span>
        )}
      </div>
    </div>
  );
};
export default ReviewCard;
