import * as SecureStore from "expo-secure-store";

const PROFILE_NAME_KEY = "profile_name";

export async function getProfileName(): Promise<string | null> {
  return await SecureStore.getItemAsync(PROFILE_NAME_KEY);
}

export async function saveProfileName(name: string): Promise<void> {
  await SecureStore.setItemAsync(PROFILE_NAME_KEY, name.trim());
}