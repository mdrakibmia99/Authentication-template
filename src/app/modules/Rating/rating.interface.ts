import { Types } from 'mongoose';
import { USER_ROLE_INTERFACE } from '../user/user.constants';

export interface IRating {
  tripId: Types.ObjectId;
  rater: Types.ObjectId;
  ratee: Types.ObjectId;
  vehicleId: Types.ObjectId;
  RaterRole: USER_ROLE_INTERFACE;
  RateeRole: USER_ROLE_INTERFACE;
  rating: number;
  comment?: string;
}
