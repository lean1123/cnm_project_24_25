import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";

type Props = {
  search: string;
  setSearch: (value: string) => void;
  sortOption: string;
  setSortOption: (value: string) => void;
};

function Filter({
  search,
  setSearch,
  sortOption,
  setSortOption,
}: Props) {
  // const [searchTerm, setSearchTerm] = useState("");
  // const [sortOption, setSortOption] = useState("a-z");

  return (
    <div className="flex flex-row gap-2">
      {/* Search input */}
      <div className="relative w-full lg:max-w-[400px]">
        <Search className="absolute left-2 top-3 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-2 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      {/* Sort select */}
      <Select value={sortOption} onValueChange={(value) => setSortOption(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="a-z">Tên (A-Z)</SelectItem>
            <SelectItem value="z-a">Tên (Z-A)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default Filter;
