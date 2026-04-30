import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { getErrorMessage } from '@/lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(getErrorMessage(err, 'Login gagal'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-slate-50 px-6">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-center">
        <View className="mb-8">
          <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 shadow-sm">
            <MaterialIcons name="manage-search" size={36} color="#0f766e" />
          </View>
          <Text className="text-4xl font-extrabold text-ink">SiliFind</Text>
          <Text className="mt-2 text-base leading-6 text-slate-500">
            Masuk untuk melaporkan, mencari, dan mengklaim barang kampus.
          </Text>
        </View>

        <View className="gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            value={email}
            className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-ink"
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-ink"
          />
          {error ? <Text className="text-sm font-semibold text-rose-600">{error}</Text> : null}
          <Pressable
            disabled={loading}
            onPress={handleSubmit}
            className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-primary-700 active:opacity-80">
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <MaterialIcons name="login" size={20} color="#ffffff" />
                <Text className="text-base font-bold text-white">Masuk</Text>
              </>
            )}
          </Pressable>
        </View>

        <View className="mt-6 flex-row justify-center gap-1">
          <Text className="text-slate-500">Belum punya akun?</Text>
          <Link href="/auth/register" asChild>
            <Pressable>
              <Text className="font-bold text-primary-700">Daftar</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
