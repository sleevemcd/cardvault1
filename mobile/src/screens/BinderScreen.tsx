import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { api } from '../services/api'

export function BinderScreen() {
  const navigation = useNavigation<any>()
  const [binders, setBinders] = useState<any[]>([])
  const [selectedBinder, setSelectedBinder] = useState<string | null>(null)
  const [binderData, setBinderData] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadBinders = useCallback(async () => {
    try {
      const data = await api.getBinders()
      setBinders(data)
    } catch (e) {
      console.error('Failed to load binders', e)
    }
  }, [])

  const loadBinder = useCallback(async (id: string) => {
    try {
      const data = await api.getBinder(id)
      setBinderData(data)
    } catch (e) {
      console.error('Failed to load binder', e)
    }
  }, [])

  useEffect(() => { loadBinders() }, [loadBinders])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadBinders()
    if (selectedBinder) await loadBinder(selectedBinder)
    setRefreshing(false)
  }, [loadBinders, loadBinder, selectedBinder])

  const selectBinder = (id: string) => {
    setSelectedBinder(id)
    loadBinder(id)
  }

  const renderCardItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => navigation.navigate('CardDetail', { cardId: item.card.id })}
    >
      <View style={styles.cardInfo}>
        <Text style={styles.playerName}>{item.card.playerName}</Text>
        <Text style={styles.cardMeta}>
          {item.card.set?.name} #{item.card.cardNumber}
        </Text>
        <Text style={styles.cardMeta}>
          {item.card.year} {item.card.manufacturer}
        </Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>
          ${(item.card.rawMarketValue ?? 0).toFixed(2)}
        </Text>
        {item.card.grades?.[0] && (
          <Text style={styles.grade}>{item.card.grades[0].grade}</Text>
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Binder</Text>

      <FlatList
        horizontal
        data={binders}
        keyExtractor={(item) => item.id}
        style={styles.binderList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.binderTab, selectedBinder === item.id && styles.activeBinder]}
            onPress={() => selectBinder(item.id)}
          >
            <Text style={[styles.binderName, selectedBinder === item.id && styles.activeText]}>
              {item.name}
            </Text>
            <Text style={styles.binderCount}>{item.items?.length ?? 0} cards</Text>
          </TouchableOpacity>
        )}
      />

      {binderData ? (
        <FlatList
          data={binderData.items}
          keyExtractor={(item) => item.id}
          renderItem={renderCardItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e94560" />}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {binders.length === 0
              ? 'No binders yet. Create one to start your collection!'
              : 'Select a binder to view its cards'}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23', paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#e0e0e0', paddingHorizontal: 20, marginBottom: 16 },
  binderList: { paddingHorizontal: 16, marginBottom: 16, maxHeight: 80 },
  binderTab: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#16213e',
  },
  activeBinder: { borderColor: '#e94560', backgroundColor: '#1e1e3a' },
  binderName: { color: '#e0e0e0', fontSize: 16, fontWeight: '600' },
  activeText: { color: '#e94560' },
  binderCount: { color: '#888', fontSize: 12, marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  cardItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16213e',
  },
  cardInfo: { flex: 1 },
  playerName: { color: '#e0e0e0', fontSize: 16, fontWeight: '700' },
  cardMeta: { color: '#888', fontSize: 13, marginTop: 2 },
  valueContainer: { alignItems: 'flex-end' },
  value: { color: '#4ecca3', fontSize: 16, fontWeight: '700' },
  grade: { color: '#e94560', fontSize: 14, fontWeight: '600', marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { color: '#888', fontSize: 16, textAlign: 'center', lineHeight: 24 },
})
