import { Alert } from "react-native";
import { useEffect, useState, useCallback } from "react";

// Define the options for the useAppwrite hook
interface UseAppwriteOptions<T, P extends Record<string, string | number>> {
  fn: (params: P) => Promise<T>; // Async function to fetch data
  params?: P; // Optional parameters for the fetch function
  skip?: boolean; // Whether to skip the initial fetch
}

// Define the return type of the useAppwrite hook
interface UseAppwriteReturn<T, P> {
  data: T | null; // Data from the API call
  loading: boolean; // Loading state
  error: string | null; // Error message, if any
  refetch: (newParams: P) => Promise<void>; // Function to refetch data with new parameters
}

// Custom React hook for managing Appwrite API calls with state handling
export const useAppwrite = <T, P extends Record<string, string | number>>({
  fn, // Async function to fetch data
  params = {} as P, // Default fetch parameters (empty object)
  skip = false, // Skip the initial fetch if true
}: UseAppwriteOptions<T, P>): UseAppwriteReturn<T, P> => {
  // State hooks to manage data, loading, and error
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data
  const fetchData = useCallback(
    async (fetchParams: P) => {
      setLoading(true); // Set loading to true before the request
      setError(null); // Clear any previous errors

      try {
        const result = await fn(fetchParams); // Call the async function with parameters
        setData(result); // Set the data state with the result
      } catch (err: unknown) {
        // Handle errors
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage); // Set the error state
        Alert.alert("Error", errorMessage); // Show an alert with the error message
      } finally {
        setLoading(false); // Set loading to false after the request
      }
    },
    [fn]
  );

  // useEffect to automatically fetch data when the hook is used (unless skipped)
  useEffect(() => {
    if (!skip) {
      fetchData(params);
    }
  }, []);

  // Function to refetch data with new parameters
  const refetch = async (newParams: P) => await fetchData(newParams);

  // Return the hook state and refetch function
  return { data, loading, error, refetch };
};