import { AvailableUserRoles } from '../constant';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandler(async (req: any, res: any, next: any) => {});

/**
 *
 * @description Middleware to check logged in users for unprotected routes. The function will set the logged in user to the request object and, if no user is logged in, it will silently fail.
 *
 * `NOTE: THIS MIDDLEWARE IS ONLY TO BE USED FOR UNPROTECTED ROUTES IN WHICH THE LOGGED IN USER'S INFORMATION IS NEEDED`
 */
export const getLoggedInUserOrIgnore = asyncHandler(async (req: any, res: any, next: any) => {});

/**
 * @param {AvailableUserRoles} roles
 * @description
 * * This middleware is responsible for validating multiple user role permissions at a time.
 * * So, in future if we have a route which can be accessible by multiple roles, we can achieve that with this middleware
 */
export const verifyPermission = (roles: any) => asyncHandler(async (req: any, res: any, next: any) => {});

export const avoidInProduction = asyncHandler(async (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development') {
    next();
  } else {
    throw new ApiError(403, 'This service is only available in the local environment. ');
  }
});
