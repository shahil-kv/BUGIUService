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
    ('$2a$10$.yMjB4t03DvPoDT8oUtO5.qFfZImadaevjDZKUNXwcEl4gL.GO1Le');
    ('$2a$10$GR55LEA0RSzn1l7nUaQgiugaqBJW1qcEmzW7b8M8ms5ScrVqZD22G');

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
const authenticateStudent = asyncHandler(async (req: any, res: any) => {
  const { password, loginId } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Call the stored procedure
    const result = await prisma.$queryRaw<any[]>`
     DECLARE @ResponseCode VARCHAR(10)
      EXEC [dbo].[authenticateStudent]
      @loginId = ${loginId},
      @enryptedPassword = ${hashedPassword},
      @ResponseCode = @ResponseCode OUTPUT
      SELECT @ResponseCode as ResponseCode
    `;

    const responseCode = result[0].ResponseCode;

    if (responseCode !== '200') {
      throw new ApiError(400, `Authentication failed with code: ${responseCode}`, []);
    }

    // Get user details
    const user = await prisma.student.findUnique({
      where: { loginId: loginId },
      select: {
        studentId: true,
        emailId: true,
        password: true,
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

    // Compare input password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user?.password as string);
    if (!isMatch) {
      throw new ApiError(400, 'Invalid password');
    }

    if (!user) {
      throw new ApiError(500, 'Error retrieving user details after authentication');
    }

    // Generate JWT
    const token = jwt.sign(
      {
        identifier: user.studentId,
        role: 'Student',
      },
      process.env.JWT_SECRET as string, // Ensure JWT_SECRET is in your environment variables
      { expiresIn: '3h' } // Set token expiry to 3 hours
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user,
          responseCode,
          token,
        },
        'User authenticated successfully'
      )
    );
  } catch (error) {
    throw new ApiError(500, 'Authentication failed', [error]);
  }
});

const getDetailsByLoginId = asyncHandler(async (req: any, res: any) => {
  const { loginId, role } = req.body;
  try {
    const result = await prisma.$queryRaw<any[]>`
     DECLARE @ResponseCode VARCHAR(10)
      EXEC [dbo].[getDetailsByLoginId]
      @loginId = ${loginId},
      @role = ${role}
    `;

    if (!result) {
      throw new ApiError(404, 'User not found');
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          result,
        },
        'User details retrieved successfully'
      )
    );
  } catch (error) {
    throw new ApiError(500, 'Failed to retrieve user details', [error]);
  }
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

export { signUpStudent, authenticateStudent, getDetailsByLoginId };
