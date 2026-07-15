import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { api } from '../services/api'
import { authStorage } from '../services/auth'

interface Props {
  onAuth: () => void
}

export function LoginScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const result = mode === 'login'
        ? await api.auth.login(email, password)
        : await api.auth.signup(email, password, name || undefined)
      await authStorage.save(result.token, result.user)
      onAuth()
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🃏</Text>
        <Text style={styles.title}>CardVault</Text>
        <Text style={styles.subtitle}>
          {mode === 'login' ? 'Sign in to your collection' : 'Create your account'}
        </Text>
      </View>

      {mode === 'signup' && (
        <TextInput
          style={styles.input}
          placeholder="Name (optional)"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>
        <Text style={styles.switchText}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </Text>
      </TouchableOpacity>

      {mode === 'login' && (
        <Text style={styles.demo}>Demo: demo@cardvault.app / demo123</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    justifyContent: 'center',
    padding: 24,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#e0e0e0' },
  subtitle: { color: '#888', fontSize: 14, marginTop: 4 },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#16213e',
  },
  error: { color: '#e94560', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  button: {
    backgroundColor: '#e94560',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchText: { color: '#e94560', textAlign: 'center', fontSize: 14 },
  demo: { color: '#666', textAlign: 'center', fontSize: 13, marginTop: 24 },
})
