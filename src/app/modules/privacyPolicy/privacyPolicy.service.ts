import AppError from '../../error/AppError';
import { IPrivacyPolicy } from './privacyPolicy.interface';
import PrivacyPolicy from './privacyPolicy.model';


import httpStatus from 'http-status';

const setPrivacyPolicy = async (payload: IPrivacyPolicy) => {

  const existingPrivacyPolicy = await PrivacyPolicy.findOne({});
  let newPrivacyPolicy;
  if (existingPrivacyPolicy) {
    // 2. Update existing document with only the relevant section
    newPrivacyPolicy = await PrivacyPolicy.findByIdAndUpdate(
      existingPrivacyPolicy._id,
      { $set: payload },
      { new: true },
    );
  } else {
    // 3. Create new document
    newPrivacyPolicy = await PrivacyPolicy.create(payload);
  }
  return newPrivacyPolicy;
};

const getPrivacyPolicy = async () => {
  const existingPrivacyPolicy = await PrivacyPolicy.findOne({});
  if(!existingPrivacyPolicy){
    throw new  AppError(httpStatus.NOT_FOUND,"privacy policy not found")
  }
  return existingPrivacyPolicy;
};

const FaqService = {
  setPrivacyPolicy,
  getPrivacyPolicy
};

export default FaqService;
