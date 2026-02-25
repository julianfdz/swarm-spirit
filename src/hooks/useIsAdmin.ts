import { useAuth } from "./useAuth";

const ADMIN_ID = "8dbad350-5257-4b0a-8b95-1758e8615d0e";

export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.id === ADMIN_ID;
};
