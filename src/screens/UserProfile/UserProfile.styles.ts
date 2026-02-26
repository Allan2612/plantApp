import { Colors } from "@/src/theme/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: 12,
    backgroundColor: Colors.avatarFallback,
  },
  nombre: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  apodo: {
    fontSize: 15,
    color: Colors.primary,
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: {
    color: Colors.primaryLight,
    fontSize: 13,
  },
  descripcion: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  stat: {
    alignItems: "center",
    minWidth: 64,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primaryLight,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.primaryMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.surfaceDivider,
    marginHorizontal: 4,
  },
  infoCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "45%",
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "600",
    width: "55%",
    textAlign: "right",
  },
});
