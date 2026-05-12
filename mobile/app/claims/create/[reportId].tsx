import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { ImageInput } from "@/components/sili/ImageInput";
import { RemoteImage } from "@/components/sili/RemoteImage";
import { ScrollScreen } from "@/components/sili/Screen";
import { useToast } from "@/contexts/toast-context";
import { api, getErrorMessage, Report, uploadImage } from "@/lib/api";

export default function CreateClaimScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [proofDescription, setProofDescription] = useState("");
  const [proofImage, setProofImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await api.get(`/reports/${reportId}`);

        if (active) {
          setReport(response.data);
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err, "Gagal memuat laporan"));
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [reportId]);

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      const proofImageUrl = proofImage ? await uploadImage(proofImage) : null;

      await api.post("/claims", {
        reportId,
        proofDescription,
        proofImage: proofImageUrl,
      });

      showToast({
        type: "success",
        message: "Klaim berhasil diajukan.",
      });
      router.replace("/(tabs)/claims");
    } catch (err) {
      setError(getErrorMessage(err, "Gagal mengirim klaim"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollScreen>
      <Pressable
        onPress={() => router.back()}
        className="mb-5 h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm"
      >
        <MaterialIcons name="arrow-back" size={22} color="#0f172a" />
      </Pressable>

      <Text className="text-3xl font-extrabold text-ink">Create Claim</Text>
      <Text className="mt-2 text-base text-slate-500">
        Berikan bukti yang jelas agar klaim mudah diverifikasi.
      </Text>

      {report ? (
        <View className="my-5 flex-row gap-4 rounded-3xl bg-white p-4 shadow-sm">
          <RemoteImage
            uri={report.image}
            className="h-20 w-20 rounded-2xl bg-slate-100"
          />
          <View className="flex-1 justify-center">
            <Text className="text-lg font-extrabold text-ink">
              {report.title}
            </Text>
            <Text className="mt-1 text-sm text-slate-500">
              {report.location}
            </Text>
          </View>
        </View>
      ) : null}

      <View className="gap-4 rounded-3xl bg-white p-5 shadow-sm">
        <TextInput
          multiline
          onChangeText={setProofDescription}
          placeholder="Jelaskan bukti kepemilikan"
          placeholderTextColor="#94a3b8"
          textAlignVertical="top"
          value={proofDescription}
          className="min-h-32 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-ink"
        />

        <ImageInput
          label="Tambahkan proof image opsional"
          value={proofImage}
          onChange={setProofImage}
        />

        {error ? (
          <Text className="font-semibold text-rose-600">{error}</Text>
        ) : null}

        <Pressable
          disabled={loading}
          onPress={handleSubmit}
          className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-primary-700 active:opacity-80"
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <MaterialIcons name="send" size={20} color="#ffffff" />
              <Text className="text-base font-extrabold text-white">
                Submit Claim
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollScreen>
  );
}
