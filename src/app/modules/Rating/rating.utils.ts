import { Types } from 'mongoose';
import Rating from './rating.model';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

export const getRatingDetails = async (rateeId: string): Promise<{
  averageRating: number;
  totalRatings: number;
}> => {
  if (!Types.ObjectId.isValid(rateeId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid rateeId');
  }

  const ratingStats = await Rating.aggregate([
    { $match: { ratee: new Types.ObjectId(rateeId) } },
    {
      $group: {
        _id: '$ratee',
        totalRatings: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  const rating =
    ratingStats[0] || {
      totalRatings: 0,
      averageRating: 0,
    };

  return {
    totalRatings: rating.totalRatings || 0,
    averageRating: Number(rating.averageRating?.toFixed(1)) || 0,
  };
};
