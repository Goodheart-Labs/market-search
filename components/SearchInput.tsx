import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search prediction markets...",
  isLoading = false,
}: SearchInputProps) {
  return (
    <form
      className="relative w-full max-w-2xl mx-auto"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value);
      }}
    >
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Search className="h-4 w-4" />
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 py-6 text-lg bg-background"
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </form>
  );
}
