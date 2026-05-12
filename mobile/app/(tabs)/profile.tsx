import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/sili/EmptyState';
import { ReportCard } from '@/components/sili/ReportCard';
import { ScrollScreen } from '@/components/sili/Screen';
import { useAuth } from '@/contexts/auth-context';
import { api, getErrorMessage, Report } from '@/lib/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const initial = user?.name?.charAt(0).toUpperCase() ?? 'U';
  const email = user?.email?.toLowerCase() ?? '-';

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        const response = await api.get('/reports/my-reports');

        if (active) {
          setReports(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err, 'Gagal memuat laporan saya'));
        }
      } finally {
        if (active) {
          setReportsLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    await logout();
    router.replace('/auth/login');
  }

  async function handleUpdateProfile() {
    setMessage('');
    setError('');
    setProfileLoading(true);

    try {
      await api.put('/auth/profile', {
        name: name.trim(),
      });
      await refreshProfile();
      setMessage('Profile berhasil diperbarui.');
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memperbarui profile'));
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleResetPassword() {
    setMessage('');
    setError('');
    setPasswordLoading(true);

    try {
      await api.put('/auth/reset-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Password berhasil diperbarui.');
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memperbarui password'));
    } finally {
      setPasswordLoading(false);
    }
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

      {message ? (
        <Text className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-700">
          {message}
        </Text>
      ) : null}

      {error ? (
        <Text className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 font-semibold text-rose-600">
          {error}
        </Text>
      ) : null}

      <View className="mt-6 gap-4 rounded-3xl bg-white p-5 shadow-sm">
        <View>
          <Text className="text-lg font-extrabold text-ink">Edit Profile</Text>
          <Text className="mt-1 text-sm text-slate-500">
            Perbarui nama lengkap yang tampil di akun kamu.
          </Text>
        </View>
        <Field
          label="Nama Lengkap"
          placeholder="Nama lengkap"
          value={name}
          onChangeText={setName}
        />
        <Pressable
          disabled={profileLoading}
          onPress={handleUpdateProfile}
          className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-primary-700 active:opacity-80 disabled:opacity-60"
        >
          {profileLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="#ffffff" />
              <Text className="font-extrabold text-white">Simpan Profile</Text>
            </>
          )}
        </Pressable>
      </View>

      <View className="mt-6 gap-4 rounded-3xl bg-white p-5 shadow-sm">
        <View>
          <Text className="text-lg font-extrabold text-ink">Reset Password</Text>
          <Text className="mt-1 text-sm text-slate-500">
            Masukkan password saat ini untuk mengganti password akun.
          </Text>
        </View>
        <Field
          label="Password Saat Ini"
          placeholder="Password saat ini"
          value={currentPassword}
          secureTextEntry
          onChangeText={setCurrentPassword}
        />
        <Field
          label="Password Baru"
          placeholder="Password baru"
          value={newPassword}
          secureTextEntry
          onChangeText={setNewPassword}
        />
        <Field
          label="Konfirmasi Password Baru"
          placeholder="Konfirmasi password baru"
          value={confirmPassword}
          secureTextEntry
          onChangeText={setConfirmPassword}
        />
        <Pressable
          disabled={passwordLoading}
          onPress={handleResetPassword}
          className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-slate-900 active:opacity-80 disabled:opacity-60"
        >
          {passwordLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <MaterialIcons name="lock-reset" size={20} color="#ffffff" />
              <Text className="font-extrabold text-white">Update Password</Text>
            </>
          )}
        </Pressable>
      </View>

      <View className="mt-8">
        <Text className="text-xl font-extrabold text-ink">Laporan Saya</Text>
        <Text className="mt-1 text-sm text-slate-500">
          Semua laporan lost/found yang pernah kamu buat.
        </Text>

        <View className="mt-4">
          {reportsLoading ? (
            <View className="items-center rounded-2xl bg-white p-8 shadow-sm">
              <ActivityIndicator color="#0f766e" />
              <Text className="mt-3 text-sm font-bold text-slate-500">
                Memuat laporan...
              </Text>
            </View>
          ) : reports.length ? (
            reports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                onPress={() =>
                  router.push({
                    pathname: '/reports/[id]',
                    params: { id: report._id },
                  })
                }
              />
            ))
          ) : (
            <EmptyState
              title="Belum ada laporan"
              message="Laporan yang kamu buat akan muncul di sini."
            />
          )}
        </View>
      </View>

      <Pressable onPress={handleLogout} className="mt-6 h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white active:opacity-80">
        <MaterialIcons name="logout" size={20} color="#e11d48" />
        <Text className="font-extrabold text-rose-600">Logout</Text>
      </Pressable>
    </ScrollScreen>
  );
}

function Field({
  label,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
}) {
  return (
    <View>
      <Text className="mb-2 text-sm font-bold text-slate-700">{label}</Text>
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        secureTextEntry={secureTextEntry}
        value={value}
        className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-ink"
      />
    </View>
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
