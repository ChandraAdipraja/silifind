import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Platform, Pressable, Text, View } from 'react-native';

type ImageInputProps = {
  label: string;
  value: ImagePicker.ImagePickerAsset | null;
  onChange: (asset: ImagePicker.ImagePickerAsset | null) => void;
};

export function ImageInput({ label, value, onChange }: ImageInputProps) {
  async function openCamera() {
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Izin kamera dibutuhkan', 'Aktifkan izin kamera untuk mengambil foto barang.');
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      base64: Platform.OS !== 'web',
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.55,
    });

    if (!result.canceled) {
      onChange(result.assets[0]);
    }
  }

  async function openGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Izin galeri dibutuhkan', 'Aktifkan izin galeri untuk memilih foto barang.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      base64: Platform.OS !== 'web',
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.55,
    });

    if (!result.canceled) {
      onChange(result.assets[0]);
    }
  }

  return (
    <View className="gap-3 rounded-2xl border border-dashed border-primary-500 bg-primary-50 p-4">
      {value ? (
        <View className="gap-3">
          <Image source={{ uri: value.uri }} resizeMode="cover" className="h-44 w-full rounded-2xl bg-slate-100" />
          <Pressable onPress={() => onChange(null)} className="self-end rounded-full bg-white px-4 py-2">
            <Text className="text-sm font-bold text-rose-600">Hapus foto</Text>
          </Pressable>
        </View>
      ) : (
        <View className="items-center py-5">
          <MaterialIcons name="add-a-photo" size={34} color="#0f766e" />
          <Text className="mt-2 text-center font-bold text-primary-700">{label}</Text>
          <Text className="mt-1 text-center text-sm text-slate-500">Ambil foto langsung atau pilih dari galeri.</Text>
        </View>
      )}

      <View className="flex-row gap-3">
        <Pressable
          onPress={openCamera}
          className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-primary-700 active:opacity-80">
          <MaterialIcons name="photo-camera" size={20} color="#ffffff" />
          <Text className="font-bold text-white">Kamera</Text>
        </Pressable>
        <Pressable
          onPress={openGallery}
          className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-white active:opacity-80">
          <MaterialIcons name="photo-library" size={20} color="#0f766e" />
          <Text className="font-bold text-primary-700">Galeri</Text>
        </Pressable>
      </View>
    </View>
  );
}
