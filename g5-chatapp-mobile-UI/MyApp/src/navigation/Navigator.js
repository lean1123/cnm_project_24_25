import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";

// Import màn hình
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
// call
import CallScreen from "../screens/chat/call/call";
import CallingScreen from "../screens/chat/call/calling";
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
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home_Chat' }],
    });
  }
}, [user]);


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0099ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      initialRouteName={"SignInScreen"}
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

      {/* Main App Screens - Only accessible when logged in */}
      {user && (
        <>
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
        </>
      )}
    </Stack.Navigator>
  );
};

export default MainNavigator;
