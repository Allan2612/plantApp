import { Typography } from "@/src/constants/typography";
import { useAppTheme } from "@/src/theme/designSystem";
import { Text, TextProps } from "react-native";

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
  const { colors, typography } = useAppTheme();

  return (
    <Text
      style={[
        typography[variant],
        { color: color ?? colors.textPrimary },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
