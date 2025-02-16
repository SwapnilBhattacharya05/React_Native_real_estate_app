import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
import { Account, Avatars, Client, OAuthProvider } from "react-native-appwrite";

export const config = {
  platform: "com.zel.restate",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
};

export const client = new Client();

client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

/*
 * Avatars => GENERATE AVATARS BASED ON USER'S FIST AND LAST NAME
 * Account => AUTHENTICATE USER AND CREATE NEW USER ACCOUNTS
 */
export const avatar = new Avatars(client);
export const account = new Account(client);

export async function login() {
  try {
    // GENERATE REDIRECT URI TO HANDLE OAuth RESPONSE
    const redirectUri = Linking.createURL("/");

    // REQUEST OAuth TOKEN FROM APPWRITE USING GOOGLE PROVIDER
    const response = await account.createOAuth2Token(
      OAuthProvider.Google, // PROVIDER
      redirectUri
    );
    // IF NO RESPONSE EXISTS
    if (!response) throw new Error("Failed to login");

    // IF SUCCESSFULLY CREATED OAuth2TOKEN THEN OPEN UP WEB BROWSER SESSION FOR OAUTH PROCESS TO CONTINUE
    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );

    // CHECK IF BROWESER RESULT WAS A SUCCESS OR NOT
    if (browserResult.type !== "success") throw new Error("Failed to login");

    // IF EVERYTHING WENT WRITE THEN PARSE NEWLY RETURNED URL TO EXTRACT THE QUERY PARAMETERS
    const url = new URL(browserResult.url);

    // WE CAN EXTRACT SECRET AND USERID
    const secret = url.searchParams.get("secret")?.toString(); // toString SINCE WE WANT STRING
    const userId = url.searchParams.get("userId")?.toString(); // toString SINCE WE WANT STRING

    // IF NO USER ID OR SECRET EXISTS THEN NEW ERROR
    if (!secret || !userId) throw new Error("Failed to login");

    // IF THAT CHECK PASSED THEN WE CAN CREATE A NEW ACCOUNT SESSION
    const session = await account.createSession(userId, secret);

    // IF NO SESSION EXISTS
    if (!session) throw new Error("Failed to create a session");

    // SUCCESSFULLY CREATED SESSION CAN RETURN SESSION OR RETURN true
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function logout() {
  try {
    // DELETE THE SESSION IF USER LOGOUTS
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    // FETCH INFORMATION ABOUT CURRENTLY LOGGED IN USER
    const response = await account.get();

    // IF USER EXISTS
    if (response.$id) {
      // FORM NEW USER AVATAR USING THEIR INITIALS
      const userAvatar = avatar.getInitials(response.name);
      return {
        // SPREADING ENTIRE RESPONSE
        ...response,
        // SETTING THE AVATAR AS A STRING SO THAT IT CAN BE USED ON FRONTEND
        avatar: userAvatar.toString(),
      };
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}
