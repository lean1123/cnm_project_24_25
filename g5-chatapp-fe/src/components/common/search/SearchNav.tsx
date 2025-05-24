import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { AddFriendDialog } from '../dialog/AddFriendDialog';
import { CreateGroupDialog } from '../dialog/CreateGroupDialog';

type Props = {
    isOpenSearchResult: boolean;
    setIsOpenSearchResult: (value: boolean) => void;
}

const SearchNav = ({isOpenSearchResult, setIsOpenSearchResult}: Props) => {
  const [search, setSearch] = useState<string>("");
  return (
    <Card className="w-full p-1 flex gap-2 flex-row">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Tìm kiếm"
          className="w-full p-2 rounded-md outline-none pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClick={() => setIsOpenSearchResult(true)}
        />
        <Search className="absolute size-5 top-1/2 transform -translate-y-1/2 left-2 text-gray-400" />
      </div>
      {isOpenSearchResult ? (
        <div
          className="flex items-center justify-center bg-primary-500 text-base-content rounded-md p-2 cursor-pointer hover:bg-primary/5"
          onClick={() => setIsOpenSearchResult(false)}
        >
          Close
        </div>
      ) : (
        <>
          {/* <div
            className="flex items-center justify-center bg-primary-500 text-base-content rounded-md p-2 cursor-pointer hover:bg-primary/5"
            // onClick={() => setShowAddFriend(true)}
          >
            <UserPlus className="size-4" />
          </div> */}
          <AddFriendDialog />
          {/* <div className="flex items-center justify-center bg-primary-500 text-base-content rounded-md p-2 cursor-pointer hover:bg-primary/5">
            <Users className="size-4" />
          </div> */}
          <CreateGroupDialog />
        </>
      )}
    </Card>
  )
}

export default SearchNav