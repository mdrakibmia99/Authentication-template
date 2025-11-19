import mongoose, { Schema } from 'mongoose';
import { IPrivacyPolicy } from './privacyPolicy.interface';

const PrivacyPolicySchema: Schema = new Schema<IPrivacyPolicy>(
  {
    privacyPolicy: {
      type: String,
      required: [true, 'privacy Policy is required'],
    },
  },
  {
    timestamps: true, 
  },
);

const PrivacyPolicy = mongoose.model<IPrivacyPolicy>('PrivacyPolicy', PrivacyPolicySchema);
export default PrivacyPolicy;
