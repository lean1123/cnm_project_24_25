import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Loading_start from "./screens/onboarding/Loading_start";
import Loading_Middle from "./screens/onboarding/Loading_Middle";
import Loading_done from "./screens/onboarding/Loading_done";
import Introduce from "./screens/onboarding/Introduce";
import Home_Chat from "./screens/chat/home_chat";
import AddFriendScreen from "./screens/chat/addFriend";
import AddGroupScreen from "./screens/chat/addGroup";
import GroupCallScreen from "./screens/chat/callGroup";
import LoginScreen from "./screens/account/loginAccount";
import RegisterScreen from "./screens/account/registerAccount";
import chatDetailScreen from "./screens/chat/ChatDetailScreen";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Loading_start">
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
