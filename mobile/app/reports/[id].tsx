import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { RemoteImage } from '@/components/sili/RemoteImage';
import { ScrollScreen } from '@/components/sili/Screen';
import { StatusBadge } from '@/components/sili/StatusBadge';
import { api, getErrorMessage, Report } from '@/lib/api';

export default function ReportDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        setError('');
        const response = await api.get(`/reports/${id}`);
        if (active) {
          setReport(response.data);
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err, 'Gagal memuat detail laporan'));
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
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#0f766e" size="large" />
      </View>
    );
  }

  if (!report) {
    return (
      <ScrollScreen>
        <Text className="text-xl font-extrabold text-ink">
          {error || 'Report tidak ditemukan'}
        </Text>
      </ScrollScreen>
    );
  }

  const reporter = typeof report.reportedBy === 'string' ? report.reportedBy : report.reportedBy?.name ?? '-';
  const canClaim = report.type === 'found' && report.status === 'open';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollScreen>
        <Pressable onPress={() => router.back()} className="mb-5 h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
          <MaterialIcons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>

        <RemoteImage uri={report.image} className="h-72 w-full rounded-3xl bg-slate-100" />

        <View className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
          <View className="mb-4 flex-row gap-2">
            <StatusBadge value={report.type} />
            <StatusBadge value={report.status} />
          </View>
          <Text className="text-3xl font-extrabold text-ink">{report.title}</Text>
          <Info label="Category" value={report.category} />
          <Info label="Location" value={report.location} />
          <Info label="Reported by" value={reporter} />
          <Info label="Created at" value={report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '-'} />
          <Text className="mt-5 text-base leading-7 text-slate-600">{report.description}</Text>
        </View>

        {canClaim ? (
          <Pressable
            onPress={() => router.push({ pathname: '/claims/create/[reportId]', params: { reportId: report._id } })}
            className="mt-5 h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-primary-700 active:opacity-80">
            <MaterialIcons name="verified" size={20} color="#ffffff" />
            <Text className="text-base font-extrabold text-white">Claim This Item</Text>
          </Pressable>
        ) : null}
      </ScrollScreen>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View className="mt-4">
      <Text className="text-xs font-bold uppercase text-slate-400">{label}</Text>
      <Text className="mt-1 text-base font-bold text-ink">{value}</Text>
    </View>
  );
}
