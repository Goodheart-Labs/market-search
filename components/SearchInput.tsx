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
    <div className="grid gap-1">
      <form
        className="relative w-full max-w-2xl mx-auto"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(value);
        }}
      >
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
          <Search className="h-4 w-4" />
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 py-5 h-12 text-base bg-transparent border-zinc-200 hover:border-zinc-300 transition-colors font-light placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-zinc-400"
        />
        {isLoading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
          </div>
        )}
      </form>
    </div>
  );
}
