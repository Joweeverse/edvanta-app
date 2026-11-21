import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts, bannerColor } from '../theme';
export { colors, fonts };

export function Loading({ label = 'Memuat...' }) {
  return (
    <View style={s.center} testID="loading">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={s.muted}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <View style={s.center} testID="error-state">
      <Text style={s.errTitle}>Terjadi kesalahan</Text>
      <Text style={s.muted}>{message}</Text>
      {onRetry ? <Button title="Coba lagi" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyState({ message }) {
  return (
    <View style={s.center} testID="empty-state">
      <Text style={s.muted}>{message}</Text>
    </View>
  );
}

export function Button({ title, onPress, disabled, secondary }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={[s.btn, secondary && s.btnSec, disabled && { opacity: 0.5 }]}
    >
      <Text style={[s.btnText, secondary && { color: colors.primary }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Field({ label, error, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.input, error && { borderColor: colors.error }]}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        {...props}
      />
      {error ? <Text style={s.fieldErr}>{error}</Text> : null}
    </View>
  );
}

export function ProgressBar({ value = 0 }) {
  return (
    <View style={s.barBg}>
      <View style={[s.barFill, { width: `${Math.min(100, Math.max(0, value))}%` }]} />
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  muted: { color: colors.muted, textAlign: 'center' },
  errTitle: { color: colors.error, fontWeight: '700', fontSize: 16 },
  btn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center' },
  btnSec: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
  btnText: { color: '#fff', fontWeight: '700' },
  label: { color: colors.text, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, backgroundColor: colors.card, color: colors.text },
  fieldErr: { color: colors.error, marginTop: 4, fontSize: 12 },
  barBg: { height: 8, backgroundColor: '#EADFCB', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: colors.accent },
});

export function Heading({ children, style }) {
  return <Text style={[{ fontFamily: fonts.title, fontSize: 22, fontWeight: '700', color: colors.text }, style]}>{children}</Text>;
}

// Kartu kelas: banner berwarna di atas, lalu judul, lalu keterangan di bawah (pola kartu KatalogKu).
export function ClassCard({ item, onPress, favorite, onToggleFavorite }) {
  const initials = (item.title || '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <TouchableOpacity onPress={onPress} style={c.card} accessibilityRole="button">
      <View style={[c.banner, { backgroundColor: bannerColor(item.category || item.title) }]}>
        <Text style={c.initials}>{initials}</Text>
        {onToggleFavorite ? (
          <TouchableOpacity onPress={onToggleFavorite} style={c.heart} accessibilityLabel="Favorit" hitSlop={10}>
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color="#fff" />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={{ padding: 14, gap: 4 }}>
        <Text style={c.title}>{item.title}</Text>
        {item.category ? <Text style={c.cat}>{item.category}</Text> : null}
        <Text style={{ color: colors.muted }} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const c = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  banner: { height: 96, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontSize: 34, fontWeight: '700', fontFamily: fonts.title, opacity: 0.9 },
  heart: { position: 'absolute', top: 10, right: 12 },
  title: { fontFamily: fonts.title, fontSize: 17, fontWeight: '700', color: colors.text },
  cat: { color: colors.accent, fontWeight: '600', fontSize: 12 },
});
