import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/sili/EmptyState';
import { ReportCard } from '@/components/sili/ReportCard';
import { ScrollScreen } from '@/components/sili/Screen';
import { api, Report } from '@/lib/api';

const filters = ['all', 'lost', 'found'] as const;

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('all');

  useFocusEffect(
    useCallback(() => {
      if (params.filter === 'lost' || params.filter === 'found') {
        setFilter(params.filter);
      }

      let active = true;

      async function load() {
        setLoading(true);
        try {
          const response = await api.get('/reports');
          if (active) {
            setReports(response.data);
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
    }, [params.filter]),
  );

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchFilter = filter === 'all' || report.type === filter;
      const matchQuery = `${report.title} ${report.category} ${report.location}`
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchFilter && matchQuery;
    });
  }, [filter, query, reports]);

  return (
    <ScrollScreen>
      <Text className="text-3xl font-extrabold text-ink">Explore</Text>
      <Text className="mt-2 text-base text-slate-500">Cari barang hilang atau temuan di kampus.</Text>

      <View className="my-5 flex-row items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 shadow-sm">
        <MaterialIcons name="search" size={22} color="#64748b" />
        <TextInput
          onChangeText={setQuery}
          placeholder="Cari judul, kategori, lokasi"
          placeholderTextColor="#94a3b8"
          value={query}
          className="h-14 flex-1 text-base text-ink"
        />
      </View>

      <View className="mb-5 flex-row gap-2">
        {filters.map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            className={`rounded-full px-5 py-3 ${filter === item ? 'bg-primary-700' : 'bg-white'}`}>
            <Text className={`font-bold capitalize ${filter === item ? 'text-white' : 'text-slate-500'}`}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#0f766e" />
      ) : filteredReports.length ? (
        filteredReports.map((report) => (
          <ReportCard
            key={report._id}
            report={report}
            onPress={() => router.push({ pathname: '/reports/[id]', params: { id: report._id } })}
          />
        ))
      ) : (
        <EmptyState title="Belum ada laporan" message="Coba kata kunci atau filter lain." />
      )}
    </ScrollScreen>
  );
}
