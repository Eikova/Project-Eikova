const userRoles = ['download', 'search'];
const contributorRoles = [...userRoles, 'managePhotos'];
const adminRoles = [
  ...contributorRoles,
  'getUsers',
  'manageUsers',
  'manageContributors',
  'manageMeeting',
  'managePeople',
  'grantAccess',
  'revokeAccess',
  'toggleStatus',
  'fullPhotoAccess',
  'resendInvite'
];
const superAdminRoles = [...adminRoles, 'manageAdmin', 'deleteUser'];

const allRoles = {
  user: userRoles,
  contributor: contributorRoles,
  admin: adminRoles,
  superadmin: superAdminRoles,
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
