import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Upload a profile photo for a user.
 * Returns the public download URL.
 */
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  const ext      = file.name.split('.').pop() ?? 'jpg';
  const filePath = `profile_photos/${userId}/avatar.${ext}`;
  const storageRef = ref(storage, filePath);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

/**
 * Delete a user's profile photo from storage.
 * Silently ignores errors (e.g. file already deleted).
 */
export async function deleteProfilePhoto(userId: string): Promise<void> {
  try {
    const storageRef = ref(storage, `profile_photos/${userId}/avatar`);
    await deleteObject(storageRef);
  } catch {
    // not critical
  }
}
