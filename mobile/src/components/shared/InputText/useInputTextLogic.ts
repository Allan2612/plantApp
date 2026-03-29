import { useState } from "react";

export function useInputTextLogic() {
  const [isFocused, setIsFocused] = useState(false);

  return {
    isFocused,
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  };
}
