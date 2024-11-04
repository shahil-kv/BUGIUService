import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UserLoginType, UserRolesEnum } from '../constant';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { getLocalPath, getStaticFilePath, removeLocalFile } from '../utils/helper';
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from '../utils/mail';
import { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const generateAccessAndRefreshTokens = async (userId: string) => {
  try {
    // return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating the access token');
  }
};

const prisma = new PrismaClient();

interface StoredProcedureResult {
  ResponseCode: string;
  NewStudentId: number;
}

const signUpStudent = async (req: Request, res: any) => {
  try {
    const { fullName, dob, addressLine1, addressLine2, pinCode, district, state, country, email, isdCode, mobileNumber, loginId, password } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification tokens
    // const { unHashedToken, hashedToken, tokenExpiry } = generateTemporaryToken();

    // Call stored procedure using Prisma's raw query
    const result = await prisma.$queryRaw<StoredProcedureResult[]>`
      DECLARE @ResponseCode VARCHAR(10)
      DECLARE @NewStudentId int

     EXEC [dbo].[signUpStudent]
        @fullName = ${fullName},
        @dob = ${new Date(dob)},
        @addressLine1 = ${addressLine1},
        @addressLine2 = ${addressLine2},
        @pinCode = ${pinCode},
        @district = ${district},
        @state = ${state},
        @country = ${country},
        @emailId = ${email},
        @isdCode = ${isdCode},
        @mobileNumber = ${mobileNumber},
        @loginId = ${loginId},
        @enryptedPassword = ${hashedPassword},
        @createdBy = ${'SYSTEM'},
        @ResponseCode = @ResponseCode OUTPUT,
        @NewStudentId = @NewStudentId OUTPUT

      SELECT @ResponseCode as ResponseCode, @NewStudentId as NewStudentId
    `;

    // Extract output parameters
    const responseCode = result[0].ResponseCode;
    const newStudentId = result[0].NewStudentId;

    // Check if registration was successful
    if (responseCode !== '200') {
      throw new ApiError(400, `sign Up Student failed with code: ${responseCode}`, []);
    }

    // Get the created user details
    const user = await prisma.student.findUnique({
      where: { studentId: newStudentId },
      select: {
        studentId: true,
        emailId: true,
        fullName: true,
        loginId: true,
        addressLine1: true,
        addressLine2: true,
        pinCode: true,
        district: true,
        state: true,
        country: true,
        isdCode: true,
        createdBy: true,
      },
    });

    if (!user) {
      throw new ApiError(500, 'Error retrieving user details after registration');
    }

    // // Send verification email
    // await sendEmail({
    //   email: user.emailId,
    //   subject: 'Please verify your email',
    //   mailgenContent: emailVerificationMailgenContent(user.fullName, `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${'shahil'}`),
    // });

    return res.status(201).json(
      new ApiResponse(
        200,
        {
          user,
          responseCode,
          studentId: newStudentId,
        },
        'User registered successfully and verification email has been sent.'
      )
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Registration error:', error);
    throw new ApiError(500, 'Something went wrong while registering the user');
  }
};

const modifyStudent = asyncHandler(async (req: Request, res: Response) => {
  const { studentId, fullName, dob, addressLine1, addressLine2 = null, pinCode = null, district = null, state = null, country, email, isdCode, mobileNumber, loginId, password } = req.body;

  const result = await prisma.$queryRaw<any[]>`
      DECLARE @ResponseCode VARCHAR(10)
      DECLARE @NewStudentId int

     EXEC [dbo].[modifyStudent]
         @studentId = ${studentId},
        @fullName = ${fullName},
        @dob = ${new Date(dob)},
        @addressLine1 = ${addressLine1},
        @addressLine2 = ${addressLine2},
        @pinCode = ${pinCode},
        @district = ${district},
        @state = ${state},
        @country = ${country},
        @isdCode = ${isdCode},
        @mobileNumber = ${mobileNumber},
        @updatedBy = ${'shah'},
        @ResponseCode OUTPUT

      SELECT @ResponseCode as ResponseCode, @NewStudentId as NewStudentId
    `;
});

// const loginUser = asyncHandler(async (req: any, res: any) => {});

// const logoutUser = asyncHandler(async (req: any, res: any) => {});

// const verifyEmail = asyncHandler(async (req: any, res: any) => {});

// // This controller is called when user is logged in and he has snackbar that your email is not verified
// // In case he did not get the email or the email verification token is expired
// // he will be able to resend the token while he is logged in
// const resendEmailVerification = asyncHandler(async (req: any, res: any) => {});

// const refreshAccessToken = asyncHandler(async (req: any, res: any) => {});

// const forgotPasswordRequest = asyncHandler(async (req: any, res: any) => {});

// const resetForgottenPassword = asyncHandler(async (req: any, res: any) => {});

// const assignRole = asyncHandler(async (req: any, res: any) => {});

// const updateUserAvatar = asyncHandler(async (req: any, res: any) => {});

// const changeCurrentPassword = asyncHandler(async (req: any, res: any) => {});

// const getCurrentUser = asyncHandler(async (req: any, res: any) => {});

// const handleSocialLogin = asyncHandler(async (req: any, res: any) => {});

export { signUpStudent, modifyStudent };
