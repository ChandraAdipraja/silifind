import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Pressable, Text, View } from 'react-native';

type ToastType = 'error' | 'success' | 'info';

type Toast = {
  id: number;
  message: string;
  title?: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (toast: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles = {
  error: {
    icon: 'error-outline',
    iconBg: 'bg-rose-50',
    iconColor: '#e11d48',
    titleColor: 'text-rose-700',
  },
  success: {
    icon: 'check-circle',
    iconBg: 'bg-emerald-50',
    iconColor: '#059669',
    titleColor: 'text-emerald-700',
  },
  info: {
    icon: 'info-outline',
    iconBg: 'bg-slate-100',
    iconColor: '#334155',
    titleColor: 'text-slate-900',
  },
} satisfies Record<
  ToastType,
  {
    icon: keyof typeof MaterialIcons.glyphMap;
    iconBg: string;
    iconColor: string;
    titleColor: string;
  }
>;

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((nextToast: Omit<Toast, 'id'>) => {
    setToast({
      ...nextToast,
      id: Date.now(),
    });
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timeout = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [toast]);

  const value = useMemo(() => ({ showToast }), [showToast]);
  const style = toast ? toastStyles[toast.type] : null;

  return (
    <ToastContext.Provider value={value}>
      <View className="flex-1">
        {children}
        <ToastOverlay toast={toast} onClose={() => setToast(null)} />
      </View>
    </ToastContext.Provider>
  );
}

export function ToastOverlay({
  onClose,
  toast,
}: {
  onClose: () => void;
  toast: Toast | null;
}) {
  const style = toast ? toastStyles[toast.type] : null;

  if (!toast || !style) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        elevation: 20,
        position: 'absolute',
        right: 16,
        top: 48,
        zIndex: 999,
      }}
    >
      <Pressable
        pointerEvents="auto"
        onPress={onClose}
        className="rounded-3xl bg-white px-4 py-4 shadow-sm"
        style={{ width: 320, elevation: 10 }}
      >
        <View className="flex-row items-center gap-3">
          <View className={`h-11 w-11 items-center justify-center rounded-2xl ${style.iconBg}`}>
            <MaterialIcons name={style.icon} size={22} color={style.iconColor} />
          </View>
          <View className="flex-1 justify-center">
            {toast.title ? (
              <Text className={`font-extrabold ${style.titleColor}`}>
                {toast.title}
              </Text>
            ) : null}
            <Text className="text-sm font-semibold leading-5 text-slate-700">
              {toast.message}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export function useToast() {
  const value = useContext(ToastContext);

  if (!value) {
    throw new Error('useToast harus dipakai di dalam ToastProvider');
  }

  return value;
}
