import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getProfileName,
  saveProfileName,
} from "../storage/profile";

type ProfileContextType = {
  profileName: string | null;
  loadingProfile: boolean;
  createProfile: (name: string) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined,
);

export function ProfileProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [profileName, setProfileName] =
    useState<string | null>(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const name = await getProfileName();

        if (name && name.trim()) {
          setProfileName(name);
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const createProfile = async (name: string) => {
    const cleanName = name.trim();

    if (!cleanName) {
      throw new Error("Name is required");
    }

    await saveProfileName(cleanName);

    setProfileName(cleanName);
  };

  return (
    <ProfileContext.Provider
      value={{
        profileName,
        loadingProfile,
        createProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error(
      "useProfile must be used inside ProfileProvider",
    );
  }

  return context;
}