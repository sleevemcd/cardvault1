import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { api } from '../services/api'

export function CardDetailScreen() {
  const route = useRoute<any>()
  const navigation = useNavigation()
  const [card, setCard] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [gradeAnalysis, setGradeAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshingEbay, setRefreshingEbay] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'pricing' | 'grading'>('info')

  useEffect(() => {
    loadCard()
  }, [route.params?.cardId])

  const loadCard = async () => {
    setLoading(true)
    try {
      const [cardData, listingsData, analysisData] = await Promise.all([
        api.getCard(route.params.cardId),
        api.getCardEbayListings(route.params.cardId).catch(() => []),
        api.getGradeAnalysis(route.params.cardId).catch(() => null),
      ])
      setCard(cardData)
      setListings(listingsData)
      setGradeAnalysis(analysisData)
    } catch (e) {
      console.error('Failed to load card', e)
    }
    setLoading(false)
  }

  const refreshEbay = useCallback(async () => {
    if (!route.params?.cardId) return
    setRefreshingEbay(true)
    try {
      const data = await api.refreshEbayListings(route.params.cardId)
      setListings(data)
    } catch (e) {
      console.error('Failed to refresh eBay listings', e)
    }
    setRefreshingEbay(false)
  }, [route.params?.cardId])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    )
  }

  if (!card) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Card not found</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.header}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🃏</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.playerName}>{card.playerName}</Text>
            <Text style={styles.setName}>{card.set?.name}</Text>
            <Text style={styles.meta}>
              {card.year} · {card.manufacturer} · #{card.cardNumber}
            </Text>
            {card.parallel && <Text style={styles.parallel}>Parallel: {card.parallel}</Text>}
            <View style={styles.badges}>
              {card.isRookie && <Text style={styles.badge}>RC</Text>}
              {card.isAutographed && <Text style={styles.badge}>Auto</Text>}
              {card.isMemorabilia && <Text style={styles.badge}>Mem</Text>}
            </View>
          </View>
        </View>

        <View style={styles.quickValues}>
          <View style={styles.quickValue}>
            <Text style={styles.quickLabel}>Raw Value</Text>
            <Text style={styles.quickAmount}>${(card.rawMarketValue ?? 0).toFixed(2)}</Text>
          </View>
          {card.lastSalePrice && (
            <View style={styles.quickValue}>
              <Text style={styles.quickLabel}>Last Sale</Text>
              <Text style={styles.quickAmount}>${card.lastSalePrice.toFixed(2)}</Text>
            </View>
          )}
          {gradeAnalysis?.recommended !== undefined && (
            <View style={styles.quickValue}>
              <Text style={styles.quickLabel}>Grade?</Text>
              <Text style={[styles.quickAmount, gradeAnalysis.recommended ? styles.positive : styles.neutral]}>
                {gradeAnalysis.recommended ? 'Yes' : 'No'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.tabs}>
          {(['info', 'pricing', 'grading'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'info' ? 'Set Info' : tab === 'pricing' ? 'Pricing' : 'Grading'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'info' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Set Details</Text>
            {card.set && (
              <>
                <DetailRow label="Set Name" value={card.set.name} />
                <DetailRow label="Year" value={String(card.set.year)} />
                <DetailRow label="Sport" value={card.set.sport} />
                <DetailRow label="Manufacturer" value={card.set.manufacturer} />
                {card.set.totalCards && <DetailRow label="Total Cards" value={String(card.set.totalCards)} />}
                {card.set.description && <DetailRow label="Description" value={card.set.description} />}
              </>
            )}
            {card.serialNumbered && (
              <DetailRow label="Serial #" value={`${card.serialNumbered}/${card.serialTotal}`} />
            )}
          </View>
        )}

        {activeTab === 'pricing' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>eBay Listings</Text>
            {listings.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No eBay listings loaded</Text>
                <TouchableOpacity
                  style={[styles.refreshButton, refreshingEbay && styles.buttonDisabled]}
                  onPress={refreshEbay}
                  disabled={refreshingEbay}
                >
                  <Text style={styles.refreshText}>
                    {refreshingEbay ? 'Loading...' : 'Refresh Listings'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              listings.map((listing, i) => (
                <View key={i} style={styles.listingItem}>
                  <Text style={styles.listingTitle} numberOfLines={2}>{listing.title}</Text>
                  <View style={styles.listingMeta}>
                    <Text style={styles.listingPrice}>${listing.price.toFixed(2)}</Text>
                    <Text style={styles.listingCondition}>{listing.condition}</Text>
                    {listing.isSold && <Text style={styles.soldBadge}>Sold</Text>}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'grading' && gradeAnalysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Grade Analysis</Text>
            <View style={styles.recommendCard}>
              <Text style={styles.recLabel}>
                {gradeAnalysis.recommended ? '✅ Recommended to Grade' : '⚠️ Grading Not Recommended'}
              </Text>
              <Text style={styles.recReason}>{gradeAnalysis.reason}</Text>
            </View>

            <Text style={styles.subSectionTitle}>Estimated Values by Grade</Text>
            {Object.entries(gradeAnalysis.estimatedGradedValues ?? {}).map(([grade, value]) => (
              <View key={grade} style={styles.gradeRow}>
                <Text style={styles.gradeLabel}>Grade {grade}</Text>
                <View style={styles.gradeBarContainer}>
                  <View style={[styles.gradeBar, { width: `${Math.min((value as number) / 100, 100)}%` }]} />
                </View>
                <Text style={styles.gradeValue}>${(value as number).toFixed(2)}</Text>
              </View>
            ))}

            <View style={styles.recMeta}>
              <DetailRow label="Optimal Grade" value={String(gradeAnalysis.optimalGrade)} />
              <DetailRow label="Break-Even Grade" value={String(gradeAnalysis.breakEvenGrade)} />
              <DetailRow label="Raw Value" value={`$${gradeAnalysis.estimatedRawValue.toFixed(2)}`} />
              <DetailRow label="Confidence" value={`${(gradeAnalysis.confidence * 100).toFixed(0)}%`} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  loadingContainer: { flex: 1, backgroundColor: '#0f0f23', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#e94560', fontSize: 18 },
  backButton: { padding: 16, paddingTop: 60 },
  backText: { color: '#e94560', fontSize: 18 },
  header: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 16 },
  imagePlaceholder: {
    width: 130, height: 180, backgroundColor: '#1a1a2e', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#16213e',
  },
  imagePlaceholderText: { fontSize: 48 },
  headerInfo: { flex: 1 },
  playerName: { color: '#e0e0e0', fontSize: 24, fontWeight: 'bold' },
  setName: { color: '#aaa', fontSize: 16, marginTop: 4 },
  meta: { color: '#888', fontSize: 14, marginTop: 4 },
  parallel: { color: '#e94560', fontSize: 14, marginTop: 4, fontStyle: 'italic' },
  badges: { flexDirection: 'row', gap: 6, marginTop: 8 },
  badge: {
    backgroundColor: '#e94560', color: '#fff', fontSize: 11, fontWeight: '700',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden',
  },
  quickValues: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  quickValue: {
    flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#16213e',
  },
  quickLabel: { color: '#888', fontSize: 12 },
  quickAmount: { color: '#e0e0e0', fontSize: 20, fontWeight: '700', marginTop: 4 },
  positive: { color: '#4ecca3' },
  neutral: { color: '#e0e0e0' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  tab: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, backgroundColor: '#1a1a2e' },
  activeTab: { backgroundColor: '#e94560' },
  tabText: { color: '#888', fontSize: 14, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  section: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionTitle: { color: '#e0e0e0', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  subSectionTitle: { color: '#e0e0e0', fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 12 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
  },
  detailLabel: { color: '#888', fontSize: 14 },
  detailValue: { color: '#e0e0e0', fontSize: 14, fontWeight: '500' },
  emptySection: { alignItems: 'center', paddingVertical: 30, gap: 12 },
  emptyText: { color: '#888', fontSize: 16 },
  refreshButton: { backgroundColor: '#e94560', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  refreshText: { color: '#fff', fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  listingItem: {
    backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#16213e',
  },
  listingTitle: { color: '#e0e0e0', fontSize: 14, marginBottom: 8 },
  listingMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listingPrice: { color: '#4ecca3', fontSize: 18, fontWeight: '700' },
  listingCondition: { color: '#888', fontSize: 13 },
  soldBadge: { color: '#e94560', fontSize: 12, fontWeight: '700' },
  recommendCard: {
    backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#16213e',
  },
  recLabel: { color: '#e0e0e0', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  recReason: { color: '#aaa', fontSize: 14, lineHeight: 20 },
  gradeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
  },
  gradeLabel: { color: '#e0e0e0', fontSize: 14, width: 70 },
  gradeBarContainer: { flex: 1, height: 8, backgroundColor: '#16213e', borderRadius: 4, overflow: 'hidden' },
  gradeBar: { height: '100%', backgroundColor: '#4ecca3', borderRadius: 4 },
  gradeValue: { color: '#4ecca3', fontSize: 14, fontWeight: '600', width: 70, textAlign: 'right' },
  recMeta: { marginTop: 20 },
})
