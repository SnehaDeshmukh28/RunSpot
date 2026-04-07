import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './src/screens/HomeScreen';
import SuggestScreen from './src/screens/SuggestScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                else if (route.name === 'Discover') iconName = focused ? 'compass' : 'compass-outline';
                else if (route.name === 'History') iconName = focused ? 'trophy' : 'trophy-outline';
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#16A34A',
              tabBarInactiveTintColor: '#9CA3AF',
              tabBarStyle: {
                backgroundColor: '#FFFFFF',
                borderTopColor: '#E5E7EB',
                height: 94,
                paddingBottom: 28,
                paddingTop: 6,
              },
              tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
              headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0 },
              headerTintColor: '#16A34A',
              headerTitleStyle: { fontWeight: 'bold', fontSize: 18, color: '#111827' },
              tabBarHideOnKeyboard: true,
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Discover" component={SuggestScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}