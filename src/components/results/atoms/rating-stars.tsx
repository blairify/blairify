import { Star } from "lucide-react";

interface RatingStarsProps {
  score: number;
  maxStars?: number;
  size?: number;
  className?: string;
}

export function RatingStars({
  score,
  maxStars = 5,
  size = 16,
  className = "",
}: RatingStarsProps) {
  // Convert score (0-100) to star rating (1-5)
  const starRating = Math.max(
    1,
    Math.min(maxStars, Math.ceil((score / 100) * maxStars)),
  );

  const stars = Array.from({ length: maxStars }, (_, index) => {
    const starNumber = index + 1;
    const isFilled = starNumber <= starRating;

    return (
      <Star
        key={index}
        size={size}
        className={`transition-colors ${
          isFilled ? "text-yellow-400 fill-yellow-400" : "text-muted fill-muted"
        }`}
      />
    );
  });

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>{stars}</div>
  );
}
