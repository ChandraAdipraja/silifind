import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { ReportCard } from '@/components/sili/ReportCard';
import { ScrollScreen } from '@/components/sili/Screen';
import { useAuth } from '@/contexts/auth-context';
import { api, Claim, getErrorMessage, Report } from '@/lib/api';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
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
          const [reportsResponse, claimsResponse] = await Promise.all([
            api.get('/reports'),
            api.get('/claims/my-claims'),
          ]);

          if (active) {
            setReports(reportsResponse.data);
            setClaims(claimsResponse.data);
          }
        } catch (err) {
          if (active) {
            setError(getErrorMessage(err, 'Gagal memuat ringkasan'));
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

  const summary = useMemo(() => {
    const mine = reports.filter((report) => {
      const owner = typeof report.reportedBy === 'string' ? report.reportedBy : report.reportedBy?._id;
      return owner === user?._id || owner === user?.id;
    });

    return {
      reports: mine.length,
      pending: claims.filter((claim) => claim.status === 'pending').length,
      approved: claims.filter((claim) => claim.status === 'approved').length,
      rejected: claims.filter((claim) => claim.status === 'rejected').length,
    };
  }, [claims, reports, user]);

  const latestFound = reports.filter((report) => report.type === 'found').slice(0, 3);

  return (
    <ScrollScreen>
      <View className="mb-6">
        <Text className="text-sm font-bold uppercase tracking-wider text-primary-700">SiliFind</Text>
        <Text className="mt-2 text-3xl font-extrabold text-ink">Halo, {user?.name ?? 'User'}</Text>
        <Text className="mt-2 text-base leading-6 text-slate-500">
          Temukan kembali barang kampus dengan laporan yang rapi dan klaim yang jelas.
        </Text>
      </View>

      <View className="mb-6 flex-row gap-3">
        <SummaryCard label="Laporan" value={summary.reports} />
        <SummaryCard label="Pending" value={summary.pending} />
        <SummaryCard label="Approved" value={summary.approved} />
        <SummaryCard label="Rejected" value={summary.rejected} />
      </View>

      <View className="mb-6 gap-3">
        <Shortcut title="Lapor Barang Hilang" icon="search-off" onPress={() => router.push('/(tabs)/report?type=lost')} />
        <Shortcut title="Lapor Barang Ditemukan" icon="add-location-alt" onPress={() => router.push('/(tabs)/report?type=found')} />
        <Shortcut title="Cari Barang Temuan" icon="travel-explore" onPress={() => router.push('/(tabs)/explore?filter=found')} />
      </View>

      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xl font-extrabold text-ink">Barang temuan terbaru</Text>
        <Pressable onPress={() => router.push('/(tabs)/explore?filter=found')}>
          <Text className="font-bold text-primary-700">Lihat semua</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#0f766e" />
      ) : error ? (
        <Text className="rounded-2xl bg-rose-50 p-4 font-semibold text-rose-600">{error}</Text>
      ) : (
        latestFound.map((report) => (
          <ReportCard
            key={report._id}
            report={report}
            onPress={() => router.push({ pathname: '/reports/[id]', params: { id: report._id } })}
          />
        ))
      )}
    </ScrollScreen>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 rounded-2xl bg-white p-3 shadow-sm">
      <Text className="text-2xl font-extrabold text-ink">{value}</Text>
      <Text className="mt-1 text-xs font-semibold text-slate-500">{label}</Text>
    </View>
  );
}

function Shortcut({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-4 rounded-2xl bg-white p-4 shadow-sm active:opacity-80">
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
        <MaterialIcons name={icon} size={24} color="#0f766e" />
      </View>
      <Text className="flex-1 text-base font-bold text-ink">{title}</Text>
      <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
    </Pressable>
  );
}
