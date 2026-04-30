import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View } from 'react-native';

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View className="items-center rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
      <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
        <MaterialIcons name="inbox" size={28} color="#0f766e" />
      </View>
      <Text className="text-center text-base font-bold text-ink">{title}</Text>
      <Text className="mt-1 text-center text-sm leading-5 text-slate-500">{message}</Text>
    </View>
  );
}
