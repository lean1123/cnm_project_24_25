import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

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
import LocationScreen from "../screens/location";
import SettingsScreen from "../screens/othersScreen/more";
import UserInfoScreen from "../screens/chat/info/infoChat";
// call
import CallScreen from "../screens/chat/call/call";
import CallingScreen from "../screens/chat/call/calling";
const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="LoginScreen">
      <Stack.Screen
        name="Loading_start"
        component={Loading_start}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Loading_Middle"
        component={Loading_Middle}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Loading_done"
        component={Loading_done}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Introduce"
        component={Introduce}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home_Chat"
        component={Home_Chat}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddFriend"
        component={AddFriendScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddGroupScreen"
        component={AddGroupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupCallScreen"
        component={GroupCallScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterScreen"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatDetail"
        component={chatDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LocationScreen"
        component={LocationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FriendsListScreen"
        component={FriendsListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserInfoScreen"
        component={UserInfoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CallScreen"
        component={CallScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CallingScreen"
        component={CallingScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
