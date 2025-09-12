import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PublicTicketsScreen from '../screens/tickets/PublicTicketsScreen';
import AddTicketScreen from '../screens/tickets/AddTicketScreen';
import MyTicketsScreen from '../screens/tickets/MyTicketsScreen';
import TicketDetailsScreen from '../screens/tickets/TicketDetailsScreen';
import ExchangesScreen from '../screens/exchange/ExchangesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import TermsScreen from '../screens/TermsScreen';
import FirebaseTestScreen from '../screens/FirebaseTestScreen';
import SignupTestScreen from '../screens/SignupTestScreen';
import AddTicketTestScreen from '../screens/AddTicketTestScreen';
import NavigationTestScreen from '../screens/NavigationTestScreen';
import AppStatusScreen from '../screens/AppStatusScreen';

import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  FirebaseTest: undefined;
  SignupTest: undefined;
  AddTicketTest: undefined;
  NavigationTest: undefined;
  Home: undefined;
  Search: undefined;
  AddTicket: undefined;
  MyTickets: undefined;
  Exchanges?: undefined; // Ajout pour cohérence avec l'onglet Exchanges
  TicketDetails: { ticketId: string };
  // Legacy Exchange routes removed
  Profile: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  Terms: undefined;
  AppStatus: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="FirebaseTest" component={FirebaseTestScreen} />
      <Stack.Screen name="SignupTest" component={SignupTestScreen} />
      <Stack.Screen name="AddTicketTest" component={AddTicketTestScreen} />
      <Stack.Screen name="NavigationTest" component={NavigationTestScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'albums' : 'albums-outline';
          } else if (route.name === 'MyTickets') {
            iconName = focused ? 'ticket' : 'ticket-outline';
          } else if (route.name === 'Exchanges') {
            iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerTitle: () => <Text style={{fontSize:16,fontWeight:'600'}}>{t('common.appName')}</Text> }}
      />
      <Tab.Screen 
        name="Search" 
        component={PublicTicketsScreen}
        options={{ headerTitle: () => <Text style={{fontSize:16,fontWeight:'600'}}>Billets</Text> }}
      />
      <Tab.Screen 
        name="MyTickets" 
        component={MyTicketsScreen}
        options={{ headerTitle: () => <Text style={{fontSize:16,fontWeight:'600'}}>{t('tickets.title')}</Text> }}
      />
      <Tab.Screen
        name="Exchanges"
        component={ExchangesScreen}
        options={{ headerTitle: () => <Text style={{fontSize:16,fontWeight:'600'}}>Échanges</Text> }}
      />
      {/* <Tab.Screen 
        name="Exchange" 
        component={ExchangeScreen}
        options={{ title: t('exchange.myExchanges') }}
      /> */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: t('profile.myProfile') }}
      />
      <Tab.Screen 
        name="AppStatus" 
        component={AppStatusScreen}
        options={{ title: '📊 Stats' }}
      />
    </Tab.Navigator>
  );
};

const MainStack = () => {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Main" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddTicket" 
        component={AddTicketScreen}
        options={{ headerTitle: () => <Text style={{fontSize:16,fontWeight:'600'}}>{t('tickets.addTicket')}</Text> }}
      />
      <Stack.Screen 
        name="TicketDetails" 
        component={TicketDetailsScreen}
        options={{ headerTitle: () => <Text style={{fontSize:16,fontWeight:'600'}}>{t('tickets.ticketDetails')}</Text> }}
      />
      {/* <Stack.Screen 
        name="ExchangeDetails" 
        component={ExchangeDetailsScreen}
        options={{ title: t('exchange.exchangeRequest') }}
      /> */}
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ headerTitle: () => <Text style={{fontSize:16,fontWeight:'600'}}>{t('profile.editProfile')}</Text> }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ headerTitle: () => <Text style={{fontSize:16,fontWeight:'600'}}>{t('notifications.title')}</Text> }}
      />
      <Stack.Screen 
        name="Terms" 
        component={TermsScreen}
        options={{ headerTitle: () => <Text style={{fontSize:16,fontWeight:'600'}}>{t('terms.title')}</Text> }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Ou un écran de chargement
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
