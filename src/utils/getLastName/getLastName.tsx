export function getLastName(fullName: string) {
  const names = fullName.trim().split(' ')
  return names.length > 1 ? names[names.length - 1] : fullName
}
