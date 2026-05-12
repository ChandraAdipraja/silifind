import { PropsWithChildren } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

export function Screen({ children }: PropsWithChildren) {
  return <View className="flex-1 bg-slate-50">{children}</View>;
}

type ScrollScreenProps = PropsWithChildren<{
  onRefresh?: () => void;
  refreshing?: boolean;
}>;

export function ScrollScreen({ children, onRefresh, refreshing = false }: ScrollScreenProps) {
  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20, paddingTop: 56 }}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              colors={['#0f766e']}
              refreshing={refreshing}
              tintColor="#0f766e"
              onRefresh={onRefresh}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </View>
  );
}
