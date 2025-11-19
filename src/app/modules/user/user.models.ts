import bcrypt from 'bcrypt';
import { Error, model, Schema } from 'mongoose';
import config from '../../config';
import { TUser, UserModel } from './user.interface';
import { USER_ROLE, USER_ROLE_ENUM } from './user.constants';
import { LOGIN_WITH, LOGIN_WITH_ENUM } from '../auth/auth.constant';


const userSchema = new Schema<TUser>(
  {
    fullName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: [true, 'Email already exists'],
    },

    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLE_ENUM,
      required: true,
      default: USER_ROLE.USER,
    },

    bio: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    loginWth: {
      type: String,
      enum: LOGIN_WITH_ENUM,
      default: LOGIN_WITH.CREDENTIALS,
    },

  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);






userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, Number(config.bcrypt_salt_rounds));
    // Update passwordChangedAt when password is modified
    user.passwordChangedAt = new Date();
  }
  next();
});

// set '' after saving password
userSchema.post(
  'save',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function (error: Error, doc: any, next: (error?: Error) => void): void {
    doc.password = '';
    next();
  },
);

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password; // Remove password field
  return user;
};

// filter out deleted documents
userSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

userSchema.statics.isUserExist = async function (email: string) {
  console.log({ email });
  return await User.findOne({ email: email }).select('+password');
};

userSchema.statics.isUserActive = async function (email: string) {
  return await User.findOne({
    email: email,
    isBlocked: false,
    isDeleted: false,
  }).select('+password');
};

userSchema.statics.IsUserExistById = async function (id: string) {
  return await User.findById(id).select('+password');
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const User = model<TUser, UserModel>('User', userSchema);
