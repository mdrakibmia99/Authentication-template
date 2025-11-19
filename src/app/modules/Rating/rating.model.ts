// rating.model.ts
import { Schema, model, Types } from 'mongoose';
import { IRating } from './rating.interface';
import { USER_ROLE, USER_ROLE_ENUM } from '../user/user.constants';

const ratingSchema = new Schema<IRating>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    rater: {
      type: Schema.Types.ObjectId,
      ref: 'User', // which person is giving the rating
      required: true,
    },
    ratee: {
      type: Schema.Types.ObjectId,
      ref: 'User', //  which person is receiving the rating
      required: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },

    RaterRole: {
      type: String,
      enum: [USER_ROLE.GUEST, USER_ROLE.HOST],
      required: [true, 'Role is required'],
    },
    RateeRole: {
      type: String,
      enum: [USER_ROLE.GUEST, USER_ROLE.HOST],
      required: [true, 'Role is required'],
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 1
    },
    comment: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);
ratingSchema.index({ tripId: 1, RaterRole: 1, RateeRole: 1 }, { unique: true });
ratingSchema.index({  vehicleId: 1 ,RateeRole: 1,});
ratingSchema.index({  hostId: 1 ,RateeRole: 1,} );

const Rating = model<IRating>('Rating', ratingSchema);
export default Rating;
