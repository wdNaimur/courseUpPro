import { canAccessUri } from "../../services/file-access";

export async function validateCourseAccess(sourceUri: string) {
  return canAccessUri(sourceUri);
}
