import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { api } from '../services/api'

export function CameraScreen() {
  const navigation = useNavigation<any>()
  const [image, setImage] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (!result.canceled) {
      setImage(result.assets[0].uri)
      setError(null)
    }
  }

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    })
    if (!result.canceled) {
      setImage(result.assets[0].uri)
      setError(null)
    }
  }

  const identifyCard = async () => {
    if (!image) return
    setScanning(true)
    setError(null)

    try {
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      })
      const result = await api.identifyByImage(base64)

      if (result?.identified && result.card?.id) {
        navigation.navigate('CardDetail', { cardId: result.card.id })
      } else {
        setError('Could not identify this card. Try a clearer photo.')
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    }
    setScanning(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan a Card</Text>

      {image ? (
        <View style={styles.preview}>
          <Image source={{ uri: image }} style={styles.image} />
          {error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity
            style={[styles.button, scanning && styles.buttonDisabled]}
            onPress={identifyCard}
            disabled={scanning}
          >
            {scanning ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Identify Card</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => { setImage(null); setError(null) }}>
            <Text style={styles.secondaryText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.options}>
          <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
            <Text style={styles.optionIcon}>📸</Text>
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
            <Text style={styles.optionIcon}>🖼</Text>
            <Text style={styles.optionText}>Choose from Library</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#e0e0e0', marginBottom: 20 },
  options: { flex: 1, justifyContent: 'center', gap: 16 },
  optionButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16213e',
  },
  optionIcon: { fontSize: 48, marginBottom: 12 },
  optionText: { fontSize: 18, color: '#e0e0e0', fontWeight: '600' },
  preview: { flex: 1, alignItems: 'center', gap: 16 },
  image: { width: '100%', height: 400, borderRadius: 12, marginBottom: 16 },
  error: { color: '#e94560', fontSize: 14, textAlign: 'center' },
  button: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  secondaryButton: { padding: 12 },
  secondaryText: { color: '#888', fontSize: 16 },
})
