export enum USERS_ROLES {
  SUPER_ADMIN = 'SuperAdmin',
  ADMIN = 'Admin',
  USERS = 'Users',
}

export enum USERS_PERMISSTIONS {
  VIEW_USERS = 'view_users',
  ADD_USERS = 'add_users',
  UPDATE_USERS = 'update_users',
  DELETE_USERS = 'delete_users',

  VIEW_ROLES = 'view_roles',
  ADD_ROLES = 'add_roles',
  UPDATE_ROLES = 'update_roles',
  DELETE_ROLES = 'delete_roles',

  VIEW_PERMISSIONS = 'view_permissions',
  ADD_PERMISSIONS = 'add_permissions',
  UPDATE_PERMISSIONS = 'update_permissions',
  DELETE_PERMISSIONS = 'delete_permissions',
}

export const USERS_STATUS = {
  ACTIVE: 'active',
  IN_ACTIVE: 'inactive',
  LOCKED: 'locked',
};

export const USERS_GENDER = [
  {
    value: 0,
    name: 'Unisex',
  },
  {
    value: 1,
    name: 'Male',
  },
  {
    value: 2,
    name: 'Female',
  },
];
