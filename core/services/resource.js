export const RESOURCE_SEPARATOR = '/';

export function canonicalResource(extension, resource) {
  return `${extension}${RESOURCE_SEPARATOR}${resource}`;
}

export function canonicalRenderResource(extension, resource) {
  const renderResource = `render${RESOURCE_SEPARATOR}${resource}`;
  return canonicalResource(extension, renderResource);
}
