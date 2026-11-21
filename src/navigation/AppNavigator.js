import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/ui';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ClassListScreen from '../screens/ClassListScreen';
import ClassDetailScreen from '../screens/ClassDetailScreen';
import LessonScreen from '../screens/LessonScreen';
import QuizScreen from '../screens/QuizScreen';
import MyClassesScreen from '../screens/MyClassesScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritScreen from '../screens/FavoritScreen';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.card, text: colors.text, primary: colors.primary, border: colors.border },
};
const headerStyle = {
  headerStyle: { backgroundColor: colors.card },
  headerTintColor: colors.primary,
  headerTitleStyle: { fontFamily: fonts.title, color: colors.text },
};
const ICONS = { Kelas: 'book', Favorit: 'heart', 'Kelas Saya': 'school', Jelajah: 'compass', Profil: 'person' };
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => <Ionicons name={ICONS[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Kelas" component={ClassListScreen} />
      <Tab.Screen name="Favorit" component={FavoritScreen} />
      <Tab.Screen name="Kelas Saya" component={MyClassesScreen} />
      <Tab.Screen name="Jelajah" component={ExploreScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, booting } = useAuth();
  if (booting) return <Loading />;
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={headerStyle}>
        {session ? (
          <>
            <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="ClassDetail" component={ClassDetailScreen} options={{ title: 'Detail Kelas' }} />
            <Stack.Screen name="Lesson" component={LessonScreen} options={{ title: 'Materi' }} />
            <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Kuis' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Daftar' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
