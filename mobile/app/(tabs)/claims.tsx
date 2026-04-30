import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { EmptyState } from '@/components/sili/EmptyState';
import { RemoteImage } from '@/components/sili/RemoteImage';
import { ScrollScreen } from '@/components/sili/Screen';
import { StatusBadge } from '@/components/sili/StatusBadge';
import { api, Claim, getErrorMessage } from '@/lib/api';

export default function ClaimsScreen() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        setLoading(true);
        try {
          setError('');
          const response = await api.get('/claims/my-claims');
          if (active) {
            setClaims(response.data);
          }
        } catch (err) {
          if (active) {
            setError(getErrorMessage(err, 'Gagal memuat klaim'));
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      load();

      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <ScrollScreen>
      <Text className="text-3xl font-extrabold text-ink">Claims</Text>
      <Text className="mt-2 text-base text-slate-500">Pantau status klaim barang yang kamu ajukan.</Text>

      <View className="mt-6">
        {loading ? (
          <ActivityIndicator color="#0f766e" />
        ) : error ? (
          <Text className="rounded-2xl bg-rose-50 p-4 font-semibold text-rose-600">{error}</Text>
        ) : claims.length ? (
          claims.map((claim) => (
            <View key={claim._id} className="mb-4 overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-lg font-extrabold text-ink">{claim.report?.title ?? 'Report'}</Text>
                  <Text className="mt-1 text-sm text-slate-500">{claim.report?.location ?? '-'}</Text>
                </View>
                <StatusBadge value={claim.status} />
              </View>
              <Text className="mt-4 text-sm leading-5 text-slate-600">{claim.proofDescription}</Text>
              {claim.proofImage ? (
                <RemoteImage uri={claim.proofImage} className="mt-4 h-40 rounded-2xl bg-slate-100" />
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState title="Belum ada klaim" message="Klaim barang temuan akan tampil di sini." />
        )}
      </View>
    </ScrollScreen>
  );
}
