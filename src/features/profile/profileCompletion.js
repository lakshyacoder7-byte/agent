export function getProfileInterests(profile) {
  if (Array.isArray(profile?.preferences?.interests)) {
    return profile.preferences.interests;
  }
  return Array.isArray(profile?.interests) ? profile.interests : [];
}

export function isProfileComplete(profile) {
  const hasOccupationField = profile && Object.prototype.hasOwnProperty.call(profile, "occupation");
  const occupation = hasOccupationField ? profile.occupation : profile?.role;
  return Boolean(profile?.full_name?.trim() && occupation?.trim());
}