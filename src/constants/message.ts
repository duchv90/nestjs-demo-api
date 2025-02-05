export const RESPONSE_MESSAGES = {
  INTERNAL_SERVER_ERROR:
    'An unexpected error occurred. Please try again later.',
  ACCESS_DENIED: 'Access denied',
  RESOUCE_NOT_FOUND: '{0} not found.',
  GET_SUCCESS: '{0} retrieved successfully.',
  GET_LIST_SUCCESS: '{0} retrieved successfully.',
  GET_SINGLE_SUCCESS: 'Get {0} completed successfully.',
  CREATE_SUCCESS: '{0} created successfully.',
  CREATE_FAIL: 'Error creating {0}.',
  CREATE_UNIQUE: '{0} already exists.',
  UPDATE_SUCCESS: '{0} updated successfully.',
  UPDATE_FAIL: 'Unable to update {0}.',
  UPDATE_NOT_FOUND: '{0} with id {1} not found.',
  DELETE_SUCCESS: '{0} with ID {1} deleted successfully.',
  DELETE_NOT_FOUND: '{0} with id {1} not found.',
  DELETE_SUPER_ADMIN: 'Cannot delete super admin role.',
  UPDATE_FOREIGN_KEY_NOT_EXIST: 'One or more {0} do not exist.',
  PASSWORD_NOT_MATCH:
    'Please enter your current password to update information.',
  UNIQUE_CONSTRAINT_FAILED: 'Unique constraint failed on the fields: ({0})',
  USERS_UPDATE_PERMISSION: 'You do not have permission to update this user',
  USER_NOT_FOUND:
    'Account does not exist. Please check your email address or username.',
  WRONG_USER_PASSWORD: 'Password is incorrect.',
  USER_NOT_ACTIVE: 'Account not activated.',
};
