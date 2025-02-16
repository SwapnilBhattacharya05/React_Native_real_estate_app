import { createContext, ReactNode, useContext } from "react";
import { useAppwrite } from "./useAppwrite";
import { getCurrentUser } from "./appwrite";

// Define the User interface for TypeScript
interface User {
  $id: string; // Unique ID for the user
  name: string; // User's name
  email: string; // User's email
  avatar: string; // URL for the user's avatar
}

// Define the shape of the global context
interface GlobalContextType {
  isLoggedIn: boolean; // Indicates if the user is logged in
  user: User | null; // Holds the user data if logged in, null if not
  loading: boolean; // Indicates if the app is fetching user data
  refetch: (newParams?: Record<string, string | number>) => Promise<void>; // Function to refetch user data
}


const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// GlobalProvider component: wraps the app and provides global state
export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  // Use the custom Appwrite hook to fetch the current user
  const {
    data: user, // The user data
    loading, // Loading state while fetching
    refetch, // Function to re-fetch user data
  } = useAppwrite({
    fn: getCurrentUser, // Function to get the user info from Appwrite
  });

  // Determine if the user is logged in
  // !!user converts the user object to a boolean: true if user exists, false if null
  const isLoggedIn = !!user;

//   console.log(JSON.stringify(user, null, 2));
return (
  // Provide the global state to the entire app
  <GlobalContext.Provider
    value={{
      isLoggedIn, // Whether the user is logged in
      user, // User information
      loading, // Loading state
      refetch, // Function to refetch user info
    }}
  >
    {children}
  </GlobalContext.Provider>
);
};

// Custom hook to use the global context
export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  // If the hook is used outside of GlobalProvider, throw an error
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  } else {
    return context;
  }
};

export default GlobalProvider;
