import { useAuthSession } from "@/src/features/auth/hooks/useAuthSession";
import { useLogout } from "@/src/features/auth/hooks/useLogout";
import { useToast } from "@/src/providers/ToastProvider";
import { useAuthStore } from "@/src/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  onPress: () => void | Promise<void>;
}

function getAvatarUri(avatarId?: string | null): string | null {
  if (!avatarId?.trim()) return null;
  const normalized = avatarId.trim();
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }
  return null;
}

export function useProfileMenu() {
  const router = useRouter();
  const { showToast } = useToast();
  const { logout, loading } = useLogout();
  const { user } = useAuthSession();
  const [visible, setVisible] = useState(false);
  const profile = useAuthStore((state) => state.profile);

  const avatarUri =
    getAvatarUri(profile?.user?.avatarId) ??
    getAvatarUri(user?.photoURL ?? null);

  const menuItems = useMemo<MenuItem[]>(
    () => [
      {
        label: "Ver mi perfil",
        icon: "person-outline",
        onPress: () => {
          setVisible(false);
          router.push("/profile" as never);
        },
      },
      {
        label: "Mensajería",
        icon: "chatbubble-outline",
        onPress: () => {
          setVisible(false);
          router.push("/mensajeria" as never);
        },
      },
      {
        label: "Configuración",
        icon: "settings-outline",
        onPress: () => {
          setVisible(false);
          router.push("/settings" as never);
        },
      },
      {
        label: "Cerrar sesión",
        icon: "log-out-outline",
        danger: true,
        onPress: async () => {
          setVisible(false);
          const result = await logout();

          if (!result.ok) {
            showToast(result.message, "error");
            return;
          }

          showToast("Sesión cerrada correctamente.", "success");
        },
      },
    ],
    [logout, router, showToast],
  );

  return {
    visible,
    setVisible,
    avatarUri,
    loading,
    menuItems,
  };
}
