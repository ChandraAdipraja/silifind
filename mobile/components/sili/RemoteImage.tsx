import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Image, ImageProps, Text, View } from 'react-native';

type RemoteImageProps = {
  uri?: string | null;
  className?: string;
  resizeMode?: ImageProps['resizeMode'];
};

export function RemoteImage({ uri, className, resizeMode = 'cover' }: RemoteImageProps) {
  const [hasError, setHasError] = useState(false);
  const source = uri && !hasError ? { uri } : null;

  if (!source) {
    return (
      <View className={`items-center justify-center bg-slate-100 ${className ?? ''}`}>
        <MaterialIcons name="image-not-supported" size={28} color="#94a3b8" />
        <Text className="mt-1 text-xs font-semibold text-slate-400">No image</Text>
      </View>
    );
  }

  return (
    <Image
      source={source}
      resizeMode={resizeMode}
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
