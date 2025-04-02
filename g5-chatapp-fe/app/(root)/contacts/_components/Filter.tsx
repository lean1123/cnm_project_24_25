import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import React from "react";

type Props = {};

function Filter({}: Props) {
  return (
    <div className="flex flex-row gap-2">
      {/* search */}
      <div className="relative w-full lg:max-w-[400px]">
        <Search className="absolute left-2 top-3 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search..."
          // value={searchTerm}
          // onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-2 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>
      {/* sort */}
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort" defaultChecked />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="a-z">Name (A-Z)</SelectItem>
            <SelectItem value="z-a">Name (Z-A)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default Filter;
