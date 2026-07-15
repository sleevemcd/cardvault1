import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export function HomeScreen() {
  const navigation = useNavigation<any>()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CardVault</Text>
        <Text style={styles.subtitle}>Identify, Track, Value</Text>
      </View>

      <ScrollView style={styles.grid}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Scan')}>
            <Text style={styles.cardIcon}>📷</Text>
            <Text style={styles.cardTitle}>Scan Card</Text>
            <Text style={styles.cardDesc}>Identify a card using your camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Search')}>
            <Text style={styles.cardIcon}>🔍</Text>
            <Text style={styles.cardTitle}>Search</Text>
            <Text style={styles.cardDesc}>Find cards by player, set, or number</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Binder')}>
            <Text style={styles.cardIcon}>📒</Text>
            <Text style={styles.cardTitle}>My Binder</Text>
            <Text style={styles.cardDesc}>View your collection and total value</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={styles.cardTitle}>Portfolio</Text>
            <Text style={styles.cardDesc}>Collection analytics and trends</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23', paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#e0e0e0' },
  subtitle: { fontSize: 16, color: '#888', marginTop: 4 },
  grid: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#16213e',
  },
  cardIcon: { fontSize: 32, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#888', lineHeight: 18 },
})
