import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper"; // Import PaperProvider
import MainNavigator from "./navigation/Navigator"; // Import MainNavigator

const App = () => {
  return (
    <PaperProvider> 
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
