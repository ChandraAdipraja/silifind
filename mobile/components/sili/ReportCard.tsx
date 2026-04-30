import { Pressable, Text, View } from 'react-native';

import { Report } from '@/lib/api';

import { RemoteImage } from './RemoteImage';
import { StatusBadge } from './StatusBadge';

export function ReportCard({ report, onPress }: { report: Report; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm active:opacity-80">
      <RemoteImage uri={report.image} className="h-40 w-full bg-slate-100" />
      <View className="gap-3 p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-ink">{report.title}</Text>
            <Text className="mt-1 text-sm text-slate-500">{report.category}</Text>
          </View>
          <StatusBadge value={report.type} />
        </View>
        <Text className="text-sm text-slate-600">{report.location}</Text>
        <StatusBadge value={report.status} />
      </View>
    </Pressable>
  );
}
