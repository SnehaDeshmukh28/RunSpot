import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const CARD_COLORS = [
  { bg: '#D1FAE5', text: '#065F46', badge: '#A7F3D0' },
  { bg: '#DBEAFE', text: '#1E40AF', badge: '#BFDBFE' },
  { bg: '#FEF9C3', text: '#854D0E', badge: '#FDE68A' },
  { bg: '#F3E8FF', text: '#6B21A8', badge: '#E9D5FF' },
  { bg: '#FFE4E6', text: '#9F1239', badge: '#FECDD3' },
  { bg: '#ECFEFF', text: '#155E75', badge: '#A5F3FC' },
];

export default function HistoryScreen() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { fetchRuns(); }, []));

  const fetchRuns = async () => {
    setLoading(true);
    const { data } = await supabase.from('runs').select('*').order('visited_on', { ascending: false });
    setRuns(data || []);
    setLoading(false);
  };

  const totalKm = runs.reduce((s, r) => s + (r.distance_km || 0), 0).toFixed(1);
  const avgRating = runs.length ? (runs.reduce((s, r) => s + (r.rating || 0), 0) / runs.length).toFixed(1) : '—';
  const bestRun = runs.length ? runs.reduce((b, r) => r.distance_km > b.distance_km ? r : b, runs[0]) : null;

  if (loading) return (
    <View style={styles.center}><ActivityIndicator color="#16A34A" size="large" /></View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Hero Stats */}
      <View style={styles.hero}>
        <Text style={styles.heroNum}>{totalKm}</Text>
        <Text style={styles.heroLabel}>total kilometres</Text>
        <View style={styles.heroSubRow}>
          <View style={styles.heroSub}>
            <Text style={styles.heroSubVal}>{runs.length}</Text>
            <Text style={styles.heroSubLabel}>runs</Text>
          </View>
          <View style={[styles.heroSub, styles.heroSubMid]}>
            <Text style={styles.heroSubVal}>{avgRating}⭐</Text>
            <Text style={styles.heroSubLabel}>avg rating</Text>
          </View>
          <View style={styles.heroSub}>
            <Text style={styles.heroSubVal}>{runs.length > 0 ? Math.max(...runs.map(r => r.distance_km || 0)) : 0}</Text>
            <Text style={styles.heroSubLabel}>best km</Text>
          </View>
        </View>
      </View>

      {/* Best Run */}
      {bestRun && (
        <View style={styles.bestCard}>
          <Text style={styles.bestEmoji}>🏆</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bestLabel}>Personal Best</Text>
            <Text style={styles.bestName}>{bestRun.location_name}</Text>
          </View>
          <Text style={styles.bestKm}>{bestRun.distance_km} km</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>All Runs</Text>

      {runs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 52 }}>🏃</Text>
          <Text style={styles.emptyTitle}>No runs yet!</Text>
          <Text style={styles.emptySub}>Find your first spot and go run</Text>
        </View>
      ) : runs.map((run, i) => {
        const c = CARD_COLORS[i % CARD_COLORS.length];
        return (
          <View key={run.id} style={[styles.runCard, { backgroundColor: c.bg }]}>
            <View style={styles.runTop}>
              <View style={[styles.runBadge, { backgroundColor: c.badge }]}>
                <Text style={[styles.runBadgeText, { color: c.text }]}>Run #{runs.length - i}</Text>
              </View>
              <Text style={styles.runStars}>{'⭐'.repeat(run.rating || 0)}</Text>
            </View>
            <Text style={[styles.runName, { color: c.text }]}>{run.location_name}</Text>
            <Text style={styles.runArea}>📍 {run.area}</Text>
            <View style={styles.runFooter}>
              <Text style={[styles.runKm, { color: c.text }]}>🏃 {run.distance_km} km</Text>
              <Text style={styles.runDate}>{new Date(run.visited_on).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  hero: { backgroundColor: '#fff', borderRadius: 22, padding: 24, marginBottom: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  heroNum: { color: '#16A34A', fontSize: 56, fontWeight: 'bold', lineHeight: 62 },
  heroLabel: { color: '#9CA3AF', fontSize: 13, marginBottom: 20 },
  heroSubRow: { flexDirection: 'row', width: '100%' },
  heroSub: { flex: 1, alignItems: 'center' },
  heroSubMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#E5E7EB' },
  heroSubVal: { color: '#111827', fontSize: 22, fontWeight: 'bold' },
  heroSubLabel: { color: '#9CA3AF', fontSize: 11, marginTop: 3 },
  bestCard: { backgroundColor: '#FEF9C3', borderRadius: 16, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#FDE68A' },
  bestEmoji: { fontSize: 28 },
  bestLabel: { color: '#92400E', fontSize: 11, fontWeight: 'bold' },
  bestName: { color: '#111827', fontWeight: 'bold', fontSize: 14, marginTop: 2 },
  bestKm: { color: '#16A34A', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { color: '#111827', fontSize: 16, fontWeight: 'bold', marginBottom: 14 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: '#111827', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  emptySub: { color: '#9CA3AF', marginTop: 6 },
  runCard: { borderRadius: 20, padding: 18, marginBottom: 12 },
  runTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  runBadge: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  runBadgeText: { fontSize: 11, fontWeight: 'bold' },
  runStars: { fontSize: 13 },
  runName: { fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  runArea: { color: '#6B7280', fontSize: 12, marginBottom: 14 },
  runFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  runKm: { fontWeight: 'bold', fontSize: 13 },
  runDate: { color: '#9CA3AF', fontSize: 12 },
});