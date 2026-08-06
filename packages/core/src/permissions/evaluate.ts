import {
  DEFAULT_CAPABILITIES,
  type Capability,
  type UserType,
} from '@supercampus/contracts';

export function getDefaultCapabilities(userType: UserType): readonly Capability[] {
  return DEFAULT_CAPABILITIES[userType] ?? DEFAULT_CAPABILITIES.hosteller;
}

export function hasCapability(
  capabilities: readonly string[],
  required: Capability,
): boolean {
  return capabilities.includes(required);
}

export function canAccessRoute(
  capabilities: readonly string[],
  required: Capability | Capability[],
): boolean {
  const list = Array.isArray(required) ? required : [required];
  return list.some((cap) => hasCapability(capabilities, cap));
}
