import { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar } from 'expo-status-bar'
import { LoginScreen } from './src/screens/LoginScreen'
import { HomeScreen } from './src/screens/HomeScreen'
import { CameraScreen } from './src/screens/CameraScreen'
import { BinderScreen } from './src/screens/BinderScreen'
import { CardDetailScreen } from './src/screens/CardDetailScreen'
import { SearchScreen } from './src/screens/SearchScreen'
import { authStorage } from './src/services/auth'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function HomeTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#16213e' } }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={CameraScreen} />
      <Tab.Screen name="Binder" component={BinderScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
    </Tab.Navigator>
  )
}

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    authStorage.getToken().then((t) => setAuthenticated(!!t))
  }, [])

  if (authenticated === null) {
    return null
  }

  if (!authenticated) {
    return (
      <>
        <StatusBar style="light" />
        <LoginScreen onAuth={() => setAuthenticated(true)} />
      </>
    )
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={HomeTabs} />
        <Stack.Screen name="CardDetail" component={CardDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
