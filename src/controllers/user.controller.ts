import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UserLoginType, UserRolesEnum } from '../constant';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { getLocalPath, getStaticFilePath, removeLocalFile } from '../utils/helper';
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from '../utils/mail';
import { Request } from 'express';

const generateAccessAndRefreshTokens = async (userId: string) => {
  try {
    // return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating the access token');
  }
};

const registerUser = asyncHandler(async (req: any, res: any) => {
  console.log(req.body);

  const { email, username, password, role } = req.body;
  return { email, username, password, role };
});

const loginUser = asyncHandler(async (req: any, res: any) => { });

const logoutUser = asyncHandler(async (req: any, res: any) => { });

const verifyEmail = asyncHandler(async (req: any, res: any) => { });

// This controller is called when user is logged in and he has snackbar that your email is not verified
// In case he did not get the email or the email verification token is expired
// he will be able to resend the token while he is logged in
const resendEmailVerification = asyncHandler(async (req: any, res: any) => { });

const refreshAccessToken = asyncHandler(async (req: any, res: any) => { });

const forgotPasswordRequest = asyncHandler(async (req: any, res: any) => { });

const resetForgottenPassword = asyncHandler(async (req: any, res: any) => { });

const assignRole = asyncHandler(async (req: any, res: any) => { });

const updateUserAvatar = asyncHandler(async (req: any, res: any) => { });

const changeCurrentPassword = asyncHandler(async (req: any, res: any) => { });

const getCurrentUser = asyncHandler(async (req: any, res: any) => { });

const handleSocialLogin = asyncHandler(async (req: any, res: any) => { });

export {
  assignRole,
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  handleSocialLogin,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  updateUserAvatar,
  verifyEmail,
};
