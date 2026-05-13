import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { EmptyState } from "@/components/sili/EmptyState";
import { ReportCard } from "@/components/sili/ReportCard";
import { ScrollScreen } from "@/components/sili/Screen";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { api, getErrorMessage, Report } from "@/lib/api";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const initial = user?.name?.charAt(0).toUpperCase() ?? "U";
  const email = user?.email?.toLowerCase() ?? "-";

  useEffect(() => {
    setName(user?.name ?? "");
    setPhoneNumber(user?.phoneNumber ?? "");
  }, [user?.name, user?.phoneNumber]);

  const loadReports = useCallback(async () => {
    try {
      const response = await api.get("/reports/my-reports");
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      showToast({
        type: "error",
        title: "Gagal memuat laporan",
        message: getErrorMessage(err, "Gagal memuat laporan saya"),
      });
    } finally {
      setReportsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  async function handleLogout() {
    await logout();
    router.replace("/auth/login");
  }

  async function handleRefresh() {
    setRefreshing(true);

    try {
      await Promise.all([refreshProfile(), loadReports()]);
    } catch (err) {
      showToast({
        type: "error",
        title: "Refresh gagal",
        message: getErrorMessage(err, "Gagal memuat ulang profile"),
      });
    } finally {
      setRefreshing(false);
    }
  }

  async function handleUpdateProfile() {
    const trimmedName = name.trim();
    const sanitizedPhone = phoneNumber.trim();

    if (!trimmedName) {
      showToast({
        type: "error",
        title: "Data belum lengkap",
        message: "Nama lengkap wajib diisi.",
      });
      return;
    }

    if (!/^[0-9]{10,15}$/.test(sanitizedPhone)) {
      showToast({
        type: "error",
        title: "Nomor telepon tidak valid",
        message: "Nomor telepon harus berisi 10-15 digit angka.",
      });
      return;
    }

    setProfileLoading(true);

    try {
      await api.put("/auth/profile", {
        name: trimmedName,
        phoneNumber: sanitizedPhone,
      });
      await refreshProfile();
      setEditOpen(false);
      showToast({
        type: "success",
        message: "Profile berhasil diperbarui.",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Gagal memperbarui profile",
        message: getErrorMessage(err, "Gagal memperbarui profile"),
      });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleResetPassword() {
    setPasswordLoading(true);

    try {
      await api.put("/auth/reset-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordOpen(false);
      showToast({
        type: "success",
        message: "Password berhasil diperbarui.",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Gagal memperbarui password",
        message: getErrorMessage(err, "Gagal memperbarui password"),
      });
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <ScrollScreen refreshing={refreshing} onRefresh={handleRefresh}>
      <View className="items-center rounded-3xl bg-white p-6 shadow-sm">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary-100">
          <Text className="text-4xl font-extrabold text-primary-700">
            {initial}
          </Text>
        </View>
        <Text className="mt-4 text-2xl font-extrabold text-ink">
          {user?.name ?? "-"}
        </Text>
        <Text className="mt-1 text-slate-500">{email}</Text>

        <View className="mt-5 flex-row gap-3">
          <IconAction
            icon="edit"
            label="Edit Profile"
            onPress={() => setEditOpen(true)}
          />
          <IconAction
            icon="lock-reset"
            label="Password"
            onPress={() => setPasswordOpen(true)}
          />
          <IconAction
            icon="logout"
            label="Logout"
            danger
            onPress={handleLogout}
          />
        </View>
      </View>

      <View className="mt-6 gap-3">
        <Info icon="phone" label="Phone" value={user?.phoneNumber ?? "-"} />
        <Info icon="mail" label="Email" value={email} />
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
                    pathname: "/reports/[id]",
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

      <ProfileModal
        open={editOpen}
        title="Edit Profile"
        description="Perbarui nama lengkap dan nomor telepon akun kamu."
        onClose={() => setEditOpen(false)}
      >
        <Field
          label="Nama Lengkap"
          placeholder="Nama lengkap"
          value={name}
          onChangeText={setName}
        />
        <Field
          label="Nomor Telepon"
          placeholder="Contoh: 081234567890"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <ModalButton
          icon="save"
          label="Simpan Profile"
          loading={profileLoading}
          onPress={handleUpdateProfile}
        />
      </ProfileModal>

      <ProfileModal
        open={passwordOpen}
        title="Reset Password"
        description="Masukkan password saat ini untuk mengganti password akun."
        onClose={() => setPasswordOpen(false)}
      >
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
        <ModalButton
          icon="lock-reset"
          label="Update Password"
          loading={passwordLoading}
          onPress={handleResetPassword}
        />
      </ProfileModal>
    </ScrollScreen>
  );
}

function IconAction({
  danger = false,
  icon,
  label,
  onPress,
}: {
  danger?: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-12 flex-row items-center gap-2 rounded-2xl px-4 active:opacity-80 ${
        danger ? "bg-rose-50" : "bg-primary-50"
      }`}
    >
      <MaterialIcons
        name={icon}
        size={20}
        color={danger ? "#e11d48" : "#0f766e"}
      />
      <Text
        className={`text-sm font-extrabold ${danger ? "text-rose-600" : "text-primary-700"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ProfileModal({
  children,
  description,
  onClose,
  open,
  title,
}: {
  children: React.ReactNode;
  description: string;
  onClose: () => void;
  open: boolean;
  title: string;
}) {
  return (
    <Modal
      visible={open}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center bg-slate-950/40 px-5">
        <View className="gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xl font-extrabold text-ink">{title}</Text>
              <Text className="mt-1 text-sm leading-5 text-slate-500">
                {description}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-2xl bg-slate-100"
            >
              <MaterialIcons name="close" size={20} color="#475569" />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function ModalButton({
  icon,
  label,
  loading,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-primary-700 active:opacity-80 disabled:opacity-60"
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <>
          <MaterialIcons name={icon} size={20} color="#ffffff" />
          <Text className="font-extrabold text-white">{label}</Text>
        </>
      )}
    </Pressable>
  );
}

function Field({
  keyboardType = "default",
  label,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  value,
}: {
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
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
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        secureTextEntry={secureTextEntry}
        value={value}
        className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-ink"
      />
    </View>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary-50">
        <MaterialIcons name={icon} size={22} color="#0f766e" />
      </View>
      <View>
        <Text className="text-xs font-bold uppercase text-slate-400">
          {label}
        </Text>
        <Text className="mt-1 text-base font-bold text-ink">{value}</Text>
      </View>
    </View>
  );
}
