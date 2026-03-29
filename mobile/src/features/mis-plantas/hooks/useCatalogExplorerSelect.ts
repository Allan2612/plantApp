import { PlantCatalogItem } from "@/src/types/plant.types";
import { useMemo, useState } from "react";

export function useCatalogExplorerSelect(
  items: PlantCatalogItem[],
  selectedId: string,
  onSelect: (catalogId: string) => void,
) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;

    return items.filter((item) => {
      const name = item.name.toLowerCase();
      const scientificName = item.scientificName.toLowerCase();
      return name.includes(normalizedQuery) || scientificName.includes(normalizedQuery);
    });
  }, [items, query]);

  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);
  const selectAndClose = (id: string) => {
    onSelect(id);
    close();
  };

  return {
    query,
    setQuery,
    isOpen,
    selectedItem,
    filteredItems,
    close,
    toggle,
    selectAndClose,
  };
}
