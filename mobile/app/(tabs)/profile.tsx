import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { ScrollScreen } from '@/components/sili/Screen';
import { useAuth } from '@/contexts/auth-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const initial = user?.name?.charAt(0).toUpperCase() ?? 'U';
  const email = user?.email?.toLowerCase() ?? '-';

  async function handleLogout() {
    await logout();
    router.replace('/auth/login');
  }

  return (
    <ScrollScreen>
      <View className="items-center rounded-3xl bg-white p-6 shadow-sm">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary-100">
          <Text className="text-4xl font-extrabold text-primary-700">{initial}</Text>
        </View>
        <Text className="mt-4 text-2xl font-extrabold text-ink">{user?.name ?? '-'}</Text>
        <Text className="mt-1 text-slate-500">{email}</Text>
      </View>

      <View className="mt-6 gap-3">
        <Info icon="phone" label="Phone" value={user?.phoneNumber ?? '-'} />
        <Info icon="badge" label="Role" value={user?.role ?? '-'} />
        <Info icon="mail" label="Email" value={email} />
      </View>

      <Pressable onPress={handleLogout} className="mt-6 h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white active:opacity-80">
        <MaterialIcons name="logout" size={20} color="#e11d48" />
        <Text className="font-extrabold text-rose-600">Logout</Text>
      </Pressable>
    </ScrollScreen>
  );
}

function Info({ icon, label, value }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary-50">
        <MaterialIcons name={icon} size={22} color="#0f766e" />
      </View>
      <View>
        <Text className="text-xs font-bold uppercase text-slate-400">{label}</Text>
        <Text className="mt-1 text-base font-bold text-ink">{value}</Text>
      </View>
    </View>
  );
}
