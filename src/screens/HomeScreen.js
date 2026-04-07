import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const SPOT_CARDS = [
  { id: '1', emoji: '🌊', name: 'Marine Drive', area: 'South Mumbai', type: 'Scenic', bg: '#D1FAE5', accent: '#065F46' },
  { id: '2', emoji: '🌳', name: 'Sanjay Gandhi Park', area: 'Borivali', type: 'Nature', bg: '#DCFCE7', accent: '#166534' },
  { id: '3', emoji: '🏖️', name: 'Juhu Beach', area: 'Andheri West', type: 'Beach', bg: '#FEF9C3', accent: '#854D0E' },
  { id: '4', emoji: '🏔️', name: 'Yeoor Hills', area: 'Thane', type: 'Trail', bg: '#F3E8FF', accent: '#6B21A8' },
  { id: '5', emoji: '🌅', name: 'Powai Lake', area: 'Powai', type: 'Lakeside', bg: '#DBEAFE', accent: '#1E40AF' },
];

const TIPS = [
  { id: '1', emoji: '⏰', title: 'Best Time', tip: 'Run between 5:30–7:30 AM in Mumbai. Beat the heat and enjoy cooler air.' },
  { id: '2', emoji: '💧', title: 'Hydration', tip: "Carry water. Most Mumbai spots don't have fountains on route." },
  { id: '3', emoji: '👟', title: 'Footwear', tip: 'Trail shoes for SGNP & hills. Regular sneakers for Marine Drive.' },
  { id: '4', emoji: '🌦️', title: 'Monsoon', tip: 'June–Sept runs are magical but slippery. Stick to paved routes.' },
  { id: '5', emoji: '🚆', title: 'Transit Hack', tip: 'Western Line locals run every 3–5 mins on weekends. Skip the cab.' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState({ totalRuns: 0, totalKm: '0', avgRating: 0 });

  useFocusEffect(useCallback(() => { fetchStats(); }, []));

  const fetchStats = async () => {
    const { data } = await supabase.from('runs').select('*');
    if (data && data.length > 0) {
      const totalKm = data.reduce((s, r) => s + (r.distance_km || 0), 0);
      const avgRating = data.reduce((s, r) => s + (r.rating || 0), 0) / data.length;
      setStats({ totalRuns: data.length, totalKm: totalKm.toFixed(1), avgRating: avgRating.toFixed(1) });
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>
          <Text style={styles.name}>Sneha</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>S</Text></View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { val: stats.totalRuns, label: 'Total Runs', icon: '🏃' },
          { val: `${stats.totalKm}`, label: 'Kilometres', icon: '📍' },
          { val: stats.avgRating > 0 ? `${stats.avgRating}` : '—', label: 'Avg Rating', icon: '⭐' },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, i === 1 && styles.statCardMid]}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statVal}>{s.val}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Discover')}>
        <View style={styles.ctaLeft}>
          <Text style={styles.ctaTitle}>Find My Weekend Spot</Text>
          <Text style={styles.ctaSub}>AI-powered · Real transit directions</Text>
        </View>
        <View style={styles.ctaArrow}>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Popular Spots */}
      <Text style={styles.sectionTitle}>Popular Spots 🗺️</Text>
      <FlatList
        data={SPOT_CARDS}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
        snapToInterval={156}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <View style={[styles.spotCard, { backgroundColor: item.bg }]}>
            <Text style={styles.spotEmoji}>{item.emoji}</Text>
            <Text style={[styles.spotName, { color: item.accent }]}>{item.name}</Text>
            <Text style={styles.spotArea}>{item.area}</Text>
            <View style={[styles.spotBadge, { backgroundColor: item.accent }]}>
              <Text style={styles.spotBadgeText}>{item.type}</Text>
            </View>
          </View>
        )}
      />

      {/* Tips */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Running Tips 💡</Text>
      <FlatList
        data={TIPS}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
        snapToInterval={218}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>{item.emoji}</Text>
            <Text style={styles.tipTitle}>{item.title}</Text>
            <Text style={styles.tipText}>{item.tip}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  greeting: { color: '#6B7280', fontSize: 13 },
  name: { color: '#111827', fontSize: 28, fontWeight: 'bold', marginTop: 2 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#16A34A', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, borderRadius: 18, overflow: 'hidden', backgroundColor: '#fff', marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  statCard: { flex: 1, padding: 14, alignItems: 'center' },
  statCardMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#E5E7EB' },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statVal: { color: '#16A34A', fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: '#9CA3AF', fontSize: 10, marginTop: 2, textAlign: 'center' },
  cta: { marginHorizontal: 20, backgroundColor: '#16A34A', borderRadius: 18, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  ctaLeft: { flex: 1 },
  ctaTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  ctaSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 3 },
  ctaArrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  sectionTitle: { color: '#111827', fontSize: 16, fontWeight: 'bold', marginLeft: 20, marginBottom: 14 },
  spotCard: { width: 144, borderRadius: 18, padding: 16, marginRight: 10, height: 160, justifyContent: 'space-between' },
  spotEmoji: { fontSize: 32 },
  spotName: { fontWeight: 'bold', fontSize: 13 },
  spotArea: { color: '#6B7280', fontSize: 11 },
  spotBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, alignSelf: 'flex-start' },
  spotBadgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  tipCard: { width: 206, backgroundColor: '#fff', borderRadius: 18, padding: 16, marginRight: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  tipEmoji: { fontSize: 26, marginBottom: 8 },
  tipTitle: { color: '#16A34A', fontWeight: 'bold', fontSize: 13, marginBottom: 5 },
  tipText: { color: '#6B7280', fontSize: 12, lineHeight: 18 },
});