import { AppTheme } from "@/src/theme/designSystem";
import { StyleSheet } from "react-native";

export function createStyles({ colors, spacing, radius }: AppTheme) {
	return StyleSheet.create({
		container: {
			flex: 1,
			paddingHorizontal: spacing.md,
			paddingBottom: spacing.lg,
			gap: spacing.sm,
		},
		permissionContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			gap: spacing.md,
			paddingHorizontal: spacing.lg,
		},
		centerText: {
			textAlign: "center",
		},
		cameraCard: {
			borderRadius: radius.lg,
			overflow: "hidden",
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: colors.surfaceDivider,
			backgroundColor: colors.surfaceAlt,
		},
		camera: {
			width: "100%",
			aspectRatio: 3 / 4,
		},
		controlsRow: {
			flexDirection: "row",
			gap: spacing.sm,
		},
		controlButton: {
			flex: 1,
		},
		previewContainer: {
			gap: spacing.xs,
		},
		detectionsContainer: {
			gap: spacing.xs,
			padding: spacing.sm,
			borderRadius: radius.md,
			backgroundColor: colors.surfaceAlt,
		},
		previewImage: {
			width: "100%",
			aspectRatio: 3 / 4,
			borderRadius: radius.md,
			backgroundColor: colors.surfaceAlt,
		},
	});
}
