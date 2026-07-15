import AsyncStorage from '@react-native-async-storage/async-storage'

const TOKEN_KEY = 'cardvault_token'
const USER_KEY = 'cardvault_user'

export const authStorage = {
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY)
  },

  async getUser(): Promise<any | null> {
    const u = await AsyncStorage.getItem(USER_KEY)
    return u ? JSON.parse(u) : null
  },

  async save(token: string, user: any) {
    await AsyncStorage.setItem(TOKEN_KEY, token)
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  async clear() {
    await AsyncStorage.removeItem(TOKEN_KEY)
    await AsyncStorage.removeItem(USER_KEY)
  },
}
