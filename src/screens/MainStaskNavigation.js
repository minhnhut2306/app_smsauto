import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SmsSrceens from './main/tabs/SmsSrceens'; 
import ContentSettingsScreen from './main/stacks/contentsettingsScreen';
import ShowlistScreen from './main/stacks/showlistScreen';
import EnterbyhandScreen from './main/stacks/enterbyhandScreen';
import SelectTemplateScreen from './main/stacks/SelectTemplateScreen';
const Stack = createStackNavigator();

const MainStaskNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={SmsSrceens} />
      <Stack.Screen name="ContentSettings" component={ContentSettingsScreen} />
      <Stack.Screen name="ShowList" component={ShowlistScreen} />
      <Stack.Screen name="SelectTemplate" component={SelectTemplateScreen} />
      <Stack.Screen name="EnterByhand" component={EnterbyhandScreen} />
    </Stack.Navigator>
  );
};

export default MainStaskNavigation;
