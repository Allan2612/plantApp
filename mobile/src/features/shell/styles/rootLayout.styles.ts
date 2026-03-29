type RootStackColors = {
  background: string;
};

export function createRootStackScreenOptions(colors: RootStackColors) {
  return {
    headerShown: false,
    contentStyle: { backgroundColor: colors.background },
    headerStyle: { backgroundColor: colors.background },
    headerTitleStyle: { fontWeight: "600" as const },
    headerShadowVisible: false,
  };
}