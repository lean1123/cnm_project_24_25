import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainNavigator from "./navigation/Navigator";

const App = () => {
  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
};

export default App;
