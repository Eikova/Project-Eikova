const userRoles = ['download', 'search'];
const contributorRoles = [...userRoles, 'managePhotos'];
const adminRoles = [
  ...contributorRoles,
  'getUsers',
  'manageUsers',
  'manageContributors',
  'manageMeetings',
  'managePeople',
  'grantAccess',
  'revokeAccess',
  'fullPhotoAccess',
];
const superAdminRoles = [...adminRoles, 'manageAdmin'];

const allRoles = {
  user: userRoles,
  contributor: contributorRoles,
  admin: adminRoles,
  superadmin: superAdminRoles,
};

// const allRoles = {
//   user: userRoles,
//   contributor: contributorRoles,
//   admin: adminRoles,
//   superadmin: superAdminRoles,
// };
const ROLE = {
  USER: 'user',
  CONTRIBUTOR: 'contributor',
  ADMIN: 'admin',
  SUPERADMIN: 'super-admin'
}

const roleRights = new Map();
roleRights.set(ROLE.USER, ['manageUsers']);
roleRights.set(ROLE.CONTRIBUTOR, [
  'manageUsers',

]);
roleRights.set(ROLE.ADMIN, [
  'invite',
  'manageUsers',
  'inviteUser'
]);
roleRights.set(ROLE.SUPERADMIN, [
'invite',
'manageUsers',
'inviteUser'

]);



// const roles = Object.keys(allRoles);
// const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  ROLE,
  roleRights,
};
