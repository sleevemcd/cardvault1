import { useState, useCallback } from 'react'
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { api } from '../services/api'

export function SearchScreen() {
  const navigation = useNavigation<any>()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const search = useCallback(async (q: string) => {
    setQuery(q)
    if (q.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const data = await api.searchCards(q)
      setResults(data)
    } catch (e) {
      console.error('Search failed', e)
    }
    setSearching(false)
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Cards</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by player, set, or card #..."
        placeholderTextColor="#666"
        value={query}
        onChangeText={search}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => navigation.navigate('CardDetail', { cardId: item.id })}
          >
            <View>
              <Text style={styles.playerName}>{item.playerName}</Text>
              <Text style={styles.cardMeta}>
                {item.set?.name} · #{item.cardNumber}
              </Text>
              <Text style={styles.cardMeta}>
                {item.year} {item.manufacturer}
              </Text>
            </View>
            <Text style={styles.price}>${(item.rawMarketValue ?? 0).toFixed(2)}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.results}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23', paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#e0e0e0', paddingHorizontal: 20, marginBottom: 16 },
  searchInput: {
    backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, fontSize: 16,
    color: '#e0e0e0', marginHorizontal: 20, marginBottom: 16, borderWidth: 1, borderColor: '#16213e',
  },
  results: { paddingHorizontal: 16 },
  resultItem: {
    backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#16213e',
  },
  playerName: { color: '#e0e0e0', fontSize: 16, fontWeight: '700' },
  cardMeta: { color: '#888', fontSize: 13, marginTop: 2 },
  price: { color: '#4ecca3', fontSize: 16, fontWeight: '700' },
})
