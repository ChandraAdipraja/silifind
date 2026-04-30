import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { ImageInput } from '@/components/sili/ImageInput';
import { ScrollScreen } from '@/components/sili/Screen';
import { Coordinates, useCurrentLocation } from '@/hooks/use-current-location';
import { api, getErrorMessage, uploadImage } from '@/lib/api';

type ReportType = 'lost' | 'found';

export default function ReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: ReportType }>();
  const [type, setType] = useState<ReportType>('lost');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [detectedLocationName, setDetectedLocationName] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { detectCurrentLocation, isDetectingLocation, locationError } = useCurrentLocation();

  useEffect(() => {
    if (params.type === 'lost' || params.type === 'found') {
      setType(params.type);
    }
  }, [params.type]);

  useEffect(() => {
    if (type === 'lost') {
      setCoordinates(null);
      setDetectedLocationName('');
    }
  }, [type]);

  async function handleUseCurrentLocation() {
    const currentLocation = await detectCurrentLocation();

    if (!currentLocation) {
      return;
    }

    setLocation(currentLocation.address);
    setDetectedLocationName(currentLocation.placeName);
    setCoordinates(currentLocation.coordinates);
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);

    try {
      const imageUrl = image ? await uploadImage(image) : null;

      await api.post('/reports', {
        type,
        title,
        category,
        description,
        location,
        coordinates,
        image: imageUrl,
      });

      setTitle('');
      setCategory('');
      setDescription('');
      setLocation('');
      setCoordinates(null);
      setDetectedLocationName('');
      setImage(null);
      router.push('/(tabs)/explore');
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal membuat laporan'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollScreen>
      <Text className="text-3xl font-extrabold text-ink">Buat Laporan</Text>
      <Text className="mt-2 text-base text-slate-500">Lengkapi detail barang agar mudah ditemukan.</Text>

      <View className="my-5 flex-row gap-3">
        <TypeButton label="Lost" active={type === 'lost'} onPress={() => setType('lost')} />
        <TypeButton label="Found" active={type === 'found'} onPress={() => setType('found')} />
      </View>

      <View className="gap-4 rounded-3xl bg-white p-5 shadow-sm">
        <Field placeholder="Judul laporan" value={title} onChangeText={setTitle} />
        <Field placeholder="Kategori" value={category} onChangeText={setCategory} />
        <View className="gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <TextInput
            multiline
            onChangeText={(value) => {
              setLocation(value);
              setCoordinates(null);
              setDetectedLocationName('');
            }}
            placeholder="Lokasi"
            placeholderTextColor="#94a3b8"
            textAlignVertical="top"
            value={location}
            className="min-h-14 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base text-ink"
          />

          {type === 'found' ? (
            <>
              <Pressable
                disabled={isDetectingLocation}
                onPress={handleUseCurrentLocation}
                className="h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-primary-700 active:opacity-80">
                {isDetectingLocation ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <MaterialIcons name="my-location" size={20} color="#ffffff" />
                    <Text className="font-bold text-white">Gunakan Lokasi Saat Ini</Text>
                  </>
                )}
              </Pressable>

              {coordinates ? (
                <View className="gap-2 rounded-2xl bg-emerald-50 px-4 py-3">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="check-circle" size={18} color="#047857" />
                    <Text className="flex-1 text-sm font-extrabold text-emerald-700">
                      Lokasi berhasil terdeteksi
                    </Text>
                  </View>
                  <Text className="text-base font-extrabold text-emerald-900">
                    {detectedLocationName || 'Lokasi saat ini'}
                  </Text>
                  <Text className="text-sm font-semibold leading-5 text-emerald-800">
                    {location}
                  </Text>
                  <Text className="text-xs font-semibold text-emerald-600">
                    Koordinat: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                  </Text>
                </View>
              ) : null}

              {locationError ? <Text className="text-sm font-semibold text-rose-600">{locationError}</Text> : null}
            </>
          ) : null}
        </View>
        <TextInput
          multiline
          onChangeText={setDescription}
          placeholder="Deskripsi"
          placeholderTextColor="#94a3b8"
          textAlignVertical="top"
          value={description}
          className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-ink"
        />

        <ImageInput label="Tambahkan foto barang" value={image} onChange={setImage} />

        {error ? <Text className="font-semibold text-rose-600">{error}</Text> : null}

        <Pressable
          disabled={loading}
          onPress={handleSubmit}
          className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-primary-700 active:opacity-80">
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <MaterialIcons name="send" size={20} color="#ffffff" />
              <Text className="text-base font-bold text-white">Submit Laporan</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollScreen>
  );
}

function TypeButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`flex-1 rounded-2xl px-4 py-4 ${active ? 'bg-primary-700' : 'bg-white'}`}>
      <Text className={`text-center font-extrabold ${active ? 'text-white' : 'text-slate-500'}`}>{label}</Text>
    </Pressable>
  );
}

function Field({ placeholder, value, onChangeText }: { placeholder: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <TextInput
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      value={value}
      className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-ink"
    />
  );
}
