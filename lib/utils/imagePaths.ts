import type { FaceShapeType } from '@/lib/detection/types';

function slugify(name: string): string {
  return name.toLowerCase().replace(/'/g, '').replace(/ /g, '-');
}

export function getShapeImage(shape: FaceShapeType): string {
  return `/images/shapes/${shape}.jpg`;
}

export function getHairstyleImage(
  shape: FaceShapeType,
  gender: 'female' | 'male',
  name: string,
): string {
  return `/images/hairstyles/${gender}/${shape}-${slugify(name)}.jpg`;
}

export function getGlassesImage(shape: FaceShapeType, name: string): string {
  return `/images/glasses/${shape}-${slugify(name)}.jpg`;
}
