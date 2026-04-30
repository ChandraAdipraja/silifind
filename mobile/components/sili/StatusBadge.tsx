import { Text, View } from 'react-native';

const styles = {
  open: 'bg-emerald-50 text-emerald-700',
  claimed: 'bg-amber-50 text-amber-700',
  returned: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
  lost: 'bg-rose-50 text-rose-700',
  found: 'bg-primary-50 text-primary-700',
};

export function StatusBadge({ value }: { value: keyof typeof styles | string }) {
  const className = styles[value as keyof typeof styles] ?? 'bg-slate-100 text-slate-700';

  return (
    <View className="self-start rounded-full">
      <Text className={`overflow-hidden rounded-full px-3 py-1 text-xs font-bold capitalize ${className}`}>
        {value}
      </Text>
    </View>
  );
}
