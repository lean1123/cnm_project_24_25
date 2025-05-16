import React, { use, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { createNavigationContainerRef } from '@react-navigation/native';
import { getSocket, reconnectSocket, initSocket, emitLogin } from "../services/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Export navigation reference and helper functions
export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function reset(name, params = {}) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name, params }],
    });
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

// Import screens
import Loading_start from "../screens/onboarding/Loading_start";
import Loading_Middle from "../screens/onboarding/Loading_Middle";
import Loading_done from "../screens/onboarding/Loading_done";
import Introduce from "../screens/onboarding/Introduce";
import Home_Chat from "../screens/chat/home_chat";
import AddFriendScreen from "../screens/chat/addFriend";
import AddGroupScreen from "../screens/chat/addGroup";
import GroupCallScreen from "../screens/chat/callGroup";
import LoginScreen from "../screens/account/loginAccount";
import RegisterScreen from "../screens/account/registerAccount";
import chatDetailScreen from "../screens/chat/ChatDetailScreen";
import ProfileScreen from "../screens/chat/ProfileScreen";
import FriendsListScreen from "../screens/chat/FriendsListScreen";
import LocationScreen from "../screens/othersScreen/location";
import SettingsScreen from "../screens/othersScreen/more";
import UserInfoScreen from "../screens/chat/info/infoChat";
import ContactRequestsScreen from "../screens/chat/ContactRequests";
import ImageViewerScreen from "../components/ImageViewerScreen";
import VideoPlayer from "../screens/chat/components/VideoPlayer";
import FileViewer from "../screens/chat/components/FileViewer";
// call
import CallScreen from "../screens/chat/call/call";
import CallingScreen from "../screens/chat/call/calling";
import IncomingCall from "../screens/chat/call/IncomingCall";
import TestCall from "../screens/chat/call/testCall";
// Login/Register without API
import SignUpScreen from "../screens/auth/register";
import SignInScreen from "../screens/auth/login";
import VerifyOTPScreen from "../screens/auth/verifyOTP";
import ForgotPasswordScreen from "../screens/account/forgotPassword";
import { useNavigation } from "@react-navigation/native";

const Stack = createStackNavigator();

const MainNavigator = () => {
  const { user, loading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      // Navigate to Home_Chat instead of SignInScreen when user is logged in
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home_Chat' }],
      });
    }
  }, [user, navigation]);

  // Initialize socket and maintain connection
  useEffect(() => {
    const setupSocket = async () => {
      try {
        console.log("[Navigator] Setting up socket connection");
        
        // Initialize socket if not already initialized
        await initSocket();
        
        // Get current user data
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          if (user && user._id) {
            console.log(`[Navigator] Found user ${user._id}, emitting login event`);
            
            // Emit login event
            emitLogin(user._id);
            
            // Setup periodic reconnection check
            const intervalId = setInterval(async () => {
              const socket = getSocket();
              if (socket && !socket.connected) {
                console.log("[Navigator] Socket disconnected, attempting to reconnect");
                await reconnectSocket();
                emitLogin(user._id);
              }
            }, 10000);
            
            return () => {
              clearInterval(intervalId);
            };
          }
        }
      } catch (error) {
        console.error('[Navigator] Error setting up socket:', error);
      }
    };
    
    setupSocket();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0099ff" />
      </View>
    );
  }

  // Determine initial route based on authentication state
  const initialRoute = user ? "Home_Chat" : "SignInScreen";

  return (
    <Stack.Navigator 
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      {/* Auth Screens */}
      <Stack.Screen
        name="SignUpScreen"
        component={SignUpScreen}
      />
      <Stack.Screen
        name="SignInScreen"
        component={SignInScreen}
      />
      <Stack.Screen
        name="VerifyOTPScreen"
        component={VerifyOTPScreen}
      />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />

      {/* Onboarding Screens */}
      <Stack.Screen
        name="Loading_start"
        component={Loading_start}
      />
      <Stack.Screen
        name="Loading_Middle"
        component={Loading_Middle}
      />
      <Stack.Screen
        name="Loading_done"
        component={Loading_done}
      />
      <Stack.Screen
        name="Introduce"
        component={Introduce}
      />

      {/* Screens that should be accessible regardless of login state */}
      <Stack.Screen
        name="IncomingCall"
        component={IncomingCall}
        options={{
          gestureEnabled: false
        }}
      />
      <Stack.Screen
        name="TestCall"
        component={TestCall}
        options={{
          gestureEnabled: false
        }}
      />

      {/* Main App Screens */}
      <Stack.Screen
        name="Home_Chat"
        component={Home_Chat}
      />
      <Stack.Screen
        name="AddFriend"
        component={AddFriendScreen}
      />
      <Stack.Screen
        name="AddGroupScreen"
        component={AddGroupScreen}
      />
      <Stack.Screen
        name="GroupCallScreen"
        component={GroupCallScreen}
      />
      <Stack.Screen
        name="ChatDetail"
        component={chatDetailScreen}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />
      <Stack.Screen
        name="FriendsList"
        component={FriendsListScreen}
      />
      <Stack.Screen
        name="Location"
        component={LocationScreen}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />
      <Stack.Screen
        name="UserInfo"
        component={UserInfoScreen}
      />
      <Stack.Screen
        name="ContactRequests"
        component={ContactRequestsScreen}
      />
      <Stack.Screen
        name="Call"
        component={CallScreen}
      />
      <Stack.Screen
        name="Calling"
        component={CallingScreen}
      />
      <Stack.Screen
        name="ImageViewer"
        component={ImageViewerScreen}
      />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayer}
      />
      <Stack.Screen
        name="FileViewer"
        component={FileViewer}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
