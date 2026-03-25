import { Typography } from "@/src/constants/typography";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Text, TextProps } from "react-native";
import { createStyles, textColor } from "./styles";

type TextVariant = keyof typeof Typography;

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

export default function AppText({
  variant = "body",
  color,
  style,
  children,
  ...rest
}: AppTextProps) {
  const theme = useAppTheme();
  const { typography } = theme;
  const styles = createStyles(theme);

  return (
    <Text
      style={[
        typography[variant],
        color ? textColor(color) : styles.defaultColor,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
