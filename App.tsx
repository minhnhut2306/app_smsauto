import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import MainStaskNavigation from './src/screens/MainStaskNavigation';
import store from './src/redux/store/store';
import BackgroundService from 'react-native-background-actions';
import { Platform, PermissionsAndroid, AppState } from 'react-native';


export default function App() {

  return (
    <Provider store={store}>
      <NavigationContainer>
        <MainStaskNavigation />
      </NavigationContainer>
    </Provider>
  );
}