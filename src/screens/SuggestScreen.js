import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export default function SuggestScreen() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ time: '', vibe: '', distance: '', travel: '' });
  const [suggestion, setSuggestion] = useState(null);
  const [directions, setDirections] = useState(null);
  const [logMode, setLogMode] = useState(false);
  const [logData, setLogData] = useState({ km: '', rating: 3 });
  const [saved, setSaved] = useState(false);

  const questions = [
    { key: 'time', icon: '🕐', label: 'When are you running?', options: ['Early Morning (5:30-7am)', 'Morning (7-9am)', 'Evening (5-7pm)'] },
    { key: 'vibe', icon: '✨', label: 'What vibe are you feeling?', options: ['Peaceful & Calm', 'Energetic & Motivating', 'Scenic & Beautiful', 'New Discovery'] },
    { key: 'distance', icon: '📏', label: 'How far do you want to run?', options: ['2-3 km easy', '4-6 km moderate', '7-10 km long run'] },
    { key: 'travel', icon: '🚆', label: 'How far to travel from home?', options: ['Very close (within area)', 'Okay to travel 30 min', 'Happy to travel 1 hour'] },
  ];

  const currentQ = questions[step];

  const selectAnswer = async (val) => {
    const newAnswers = { ...answers, [currentQ.key]: val };
    setAnswers(newAnswers);
    if (step < questions.length - 1) setStep(step + 1);
    else await getSuggestion(newAnswers);
  };

  const getSuggestion = async (ans) => {
    setStep('loading');
    try {
      const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=19.0760&longitude=72.8777&daily=temperature_2m_max,precipitation_sum&forecast_days=7&timezone=Asia%2FKolkata');
      const w = (await weatherRes.json()).daily;
      const prompt = `You are a local Mumbai running expert. Suggest ONE perfect running spot for this weekend based on:
- Preferred time: ${ans.time}
- Vibe wanted: ${ans.vibe}
- Run distance: ${ans.distance}
- Travel tolerance: ${ans.travel}
- Saturday weather: ${w.temperature_2m_max[5]}°C, rain: ${w.precipitation_sum[5]}mm
- Sunday weather: ${w.temperature_2m_max[6]}°C, rain: ${w.precipitation_sum[6]}mm
Choose from Mumbai, Thane, or Navi Mumbai.
Reply ONLY in this exact JSON format:
{
  "name": "Spot name",
  "area": "Area name",
  "why": "2 sentence reason",
  "bestDay": "Saturday or Sunday",
  "bestTime": "6:00 AM",
  "runRoute": "brief route description",
  "distance": "X km",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "nearestStation": "station name",
  "transitTip": "train line and last mile tip"
}`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
      );
      const geminiData = await geminiRes.json();
      if (!geminiData.candidates?.[0]) { setStep('error'); return; }
      const parsed = JSON.parse(geminiData.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)[0]);
      setSuggestion(parsed);

      const dirRes = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=Mumbai&destination=${parsed.latitude},${parsed.longitude}&mode=transit&key=${GOOGLE_KEY}`);
      const dirData = await dirRes.json();
      if (dirData.routes?.length > 0) {
        const leg = dirData.routes[0].legs[0];
        setDirections({
          steps: leg.steps.map(s => ({ instruction: s.html_instructions.replace(/<[^>]*>/g, ''), distance: s.distance.text, mode: s.travel_mode })),
          duration: leg.duration.text, totalDist: leg.distance.text,
        });
      }
      setStep('result');
    } catch (e) { console.error(e); setStep('error'); }
  };

  const saveRun = async () => {
    await supabase.from('runs').insert({
      location_name: suggestion.name, area: suggestion.area,
      latitude: suggestion.latitude, longitude: suggestion.longitude,
      distance_km: parseFloat(logData.km) || 0, rating: logData.rating,
      visited_on: new Date().toISOString().split('T')[0],
    });
    setSaved(true); setLogMode(false);
  };

  const reset = () => {
    setStep(0); setAnswers({ time: '', vibe: '', distance: '', travel: '' });
    setSuggestion(null); setDirections(null); setLogMode(false); setSaved(false);
  };

  if (step === 'loading') return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#16A34A" />
      <Text style={styles.loadingTitle}>Finding your perfect spot...</Text>
      <Text style={styles.loadingSub}>Checking weekend weather & routes 🌤️</Text>
    </View>
  );

  if (step === 'error') return (
    <View style={styles.center}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>😕</Text>
      <Text style={styles.errorText}>Something went wrong. Check your connection.</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={reset}><Text style={styles.retryText}>Try Again</Text></TouchableOpacity>
    </View>
  );

  if (step === 'result' && suggestion) return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Hero */}
      <View style={styles.resultHero}>
        <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>✨ Your Weekend Spot</Text></View>
        <Text style={styles.resultName}>{suggestion.name}</Text>
        <Text style={styles.resultArea}>📍 {suggestion.area}</Text>
        <Text style={styles.resultWhy}>{suggestion.why}</Text>
        <View style={styles.pillsRow}>
          <View style={styles.pill}><Text style={styles.pillText}>📅 {suggestion.bestDay}</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>🕐 {suggestion.bestTime}</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>📏 {suggestion.distance}</Text></View>
        </View>
      </View>

      {/* Route */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏃 Running Route</Text>
        <Text style={styles.cardBody}>{suggestion.runRoute}</Text>
      </View>

      {/* Transit */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚆 How to Reach</Text>
        <Text style={styles.stationName}>{suggestion.nearestStation}</Text>
        <Text style={styles.cardBody}>{suggestion.transitTip}</Text>
        {directions && (
          <View style={styles.stepsBox}>
            <Text style={styles.stepsHeader}>{directions.duration} · {directions.totalDist}</Text>
            {directions.steps.map((s, i) => (
              <View key={i} style={styles.stepRow}>
                <Text style={styles.stepIcon}>{s.mode === 'TRANSIT' ? '🚆' : s.mode === 'WALKING' ? '🚶' : '🚌'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepText}>{s.instruction}</Text>
                  <Text style={styles.stepDist}>{s.distance}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.mapsBtn} onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${suggestion.latitude},${suggestion.longitude}`)}>
        <Ionicons name="navigate" size={18} color="#fff" />
        <Text style={styles.mapsBtnText}>Open in Google Maps</Text>
      </TouchableOpacity>

      {!saved ? (!logMode ? (
        <TouchableOpacity style={styles.logBtn} onPress={() => setLogMode(true)}>
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text style={styles.logBtnText}>I visited this spot! Log my run</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Log Your Run</Text>
          <Text style={styles.logLabel}>Distance (km)</Text>
          <View style={styles.pillsRow}>
            {['2', '3', '4', '5', '6', '8', '10'].map(k => (
              <TouchableOpacity key={k} style={[styles.selPill, logData.km === k && styles.selPillOn]} onPress={() => setLogData({ ...logData, km: k })}>
                <Text style={[styles.selPillText, logData.km === k && styles.selPillTextOn]}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.logLabel}>Rating</Text>
          <View style={styles.pillsRow}>
            {[1, 2, 3, 4, 5].map(r => (
              <TouchableOpacity key={r} style={[styles.selPill, logData.rating === r && styles.selPillOn]} onPress={() => setLogData({ ...logData, rating: r })}>
                <Text style={[styles.selPillText, logData.rating === r && styles.selPillTextOn]}>{'⭐'.repeat(r)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={saveRun}>
            <Text style={styles.saveBtnText}>Save to History</Text>
          </TouchableOpacity>
        </View>
      )) : (
        <View style={styles.savedBanner}><Text style={styles.savedText}>✅ Run saved to history!</Text></View>
      )}

      <TouchableOpacity style={styles.resetBtn} onPress={reset}>
        <Text style={styles.resetText}>Find a different spot</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        {questions.map((_, i) => <View key={i} style={[styles.progBar, i <= step && styles.progBarOn]} />)}
      </View>
      <Text style={styles.qCount}>Question {Number(step) + 1} of {questions.length}</Text>
      <Text style={styles.qIcon}>{currentQ.icon}</Text>
      <Text style={styles.qText}>{currentQ.label}</Text>
      {currentQ.options.map(opt => (
        <TouchableOpacity key={opt} style={styles.optBtn} onPress={() => selectAnswer(opt)}>
          <Text style={styles.optText}>{opt}</Text>
          <Ionicons name="chevron-forward" size={16} color="#16A34A" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 24 },
  loadingTitle: { color: '#111827', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  loadingSub: { color: '#6B7280', marginTop: 8 },
  errorText: { color: '#DC2626', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  retryBtn: { backgroundColor: '#16A34A', padding: 14, borderRadius: 14, paddingHorizontal: 32 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  progBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },
  progBarOn: { backgroundColor: '#16A34A' },
  qCount: { color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
  qIcon: { fontSize: 36, marginBottom: 10 },
  qText: { color: '#111827', fontSize: 22, fontWeight: 'bold', marginBottom: 24, lineHeight: 30 },
  optBtn: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  optText: { color: '#111827', fontSize: 15 },
  resultHero: { backgroundColor: '#fff', borderRadius: 22, padding: 22, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  heroBadge: { backgroundColor: '#DCFCE7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 12 },
  heroBadgeText: { color: '#16A34A', fontWeight: 'bold', fontSize: 12 },
  resultName: { color: '#111827', fontSize: 24, fontWeight: 'bold' },
  resultArea: { color: '#6B7280', fontSize: 14, marginTop: 4, marginBottom: 12 },
  resultWhy: { color: '#374151', lineHeight: 22, marginBottom: 16, fontSize: 14 },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { color: '#374151', fontSize: 12, fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTitle: { color: '#111827', fontWeight: 'bold', fontSize: 15, marginBottom: 10 },
  cardBody: { color: '#6B7280', lineHeight: 21, fontSize: 13 },
  stationName: { color: '#16A34A', fontWeight: 'bold', marginBottom: 6, fontSize: 13 },
  stepsBox: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginTop: 12 },
  stepsHeader: { color: '#9CA3AF', fontSize: 12, marginBottom: 10 },
  stepRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  stepIcon: { fontSize: 16, width: 24 },
  stepText: { color: '#374151', fontSize: 13, lineHeight: 19 },
  stepDist: { color: '#9CA3AF', fontSize: 11, marginTop: 2 },
  mapsBtn: { backgroundColor: '#3B82F6', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
  mapsBtnText: { color: '#fff', fontWeight: 'bold' },
  logBtn: { backgroundColor: '#16A34A', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
  logBtnText: { color: '#fff', fontWeight: 'bold' },
  logLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 8, marginTop: 8 },
  selPill: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  selPillOn: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  selPillText: { color: '#6B7280', fontWeight: 'bold', fontSize: 13 },
  selPillTextOn: { color: '#fff' },
  saveBtn: { backgroundColor: '#16A34A', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  savedBanner: { backgroundColor: '#DCFCE7', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#BBF7D0' },
  savedText: { color: '#16A34A', fontWeight: 'bold' },
  resetBtn: { padding: 16, alignItems: 'center' },
  resetText: { color: '#9CA3AF', fontSize: 13 },
});