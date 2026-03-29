import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { createStyles } from "./styles";

export interface SingleSelectOption<T extends string> {
  value: T;
  label: string;
}

interface SingleSelectProps<T extends string, OptionT extends SingleSelectOption<T>> {
  options: OptionT[];
  value: T;
  onChange: (value: T) => void;
  renderIcon?: (option: OptionT, selected: boolean) => ReactNode;
  layout?: "segmented" | "grid";
}

export default function SingleSelect<T extends string, OptionT extends SingleSelectOption<T>>({
  options,
  value,
  onChange,
  renderIcon,
  layout = "segmented",
}: SingleSelectProps<T, OptionT>) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const isGrid = layout === "grid";

  return (
    <View style={[styles.row, isGrid && styles.rowGrid]}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, isGrid && styles.optionGrid, selected && styles.optionActive]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            {renderIcon ? renderIcon(option, selected) : null}
            <AppText variant="caption" style={[styles.label, selected && styles.labelActive]}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
