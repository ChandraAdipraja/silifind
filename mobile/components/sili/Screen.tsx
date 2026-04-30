import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';

export function Screen({ children }: PropsWithChildren) {
  return <View className="flex-1 bg-slate-50">{children}</View>;
}

export function ScrollScreen({ children }: PropsWithChildren) {
  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20, paddingTop: 56 }}>
        {children}
      </ScrollView>
    </View>
  );
}
