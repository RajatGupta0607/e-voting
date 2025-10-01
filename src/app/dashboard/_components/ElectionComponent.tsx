"use client";

import { useState } from "react";
import { useDebounce } from "~/hooks/useDebounce";

import { api } from "~/trpc/react";

import { Loader2 } from "lucide-react";
import Filter from "./Filter";
import ElectionTableList from "./ElectionTableList";
import CreateElectionSheet from "./CreateElectionSheet";

export type Year = "All" | "1" | "2" | "3";
export type StatusType =
  | "All"
  | "PENDING"
  | "CANDIDATURE_OPEN"
  | "VOTING_OPEN"
  | "CLOSED";
const ALL_DATA = {
  course: "All",
  year: "All" as Year,
  division: "All",
  status: "All" as StatusType,
};

function ElectionComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedData, setSelectedData] = useState<typeof ALL_DATA>(ALL_DATA);
  const debouncedSearch = useDebounce(searchQuery.toLowerCase(), 300);

  const data = api.election.list.useQuery({
    searchQuery: debouncedSearch,
    filterData: selectedData,
  });

  return (
    <div>
      <Filter
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="mt-4 flex justify-end">
        <CreateElectionSheet />
      </div>
      <div className="mt-8 h-[70vh] w-full overflow-auto rounded-lg border">
        {data.isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="text-primary mr-2 h-9 w-9 animate-spin" />
          </div>
        ) : !data.data?.length ? (
          <p className="mt-8 w-full text-center">No Election Data Found</p>
        ) : (
          <ElectionTableList data={data.data} />
        )}
      </div>
    </div>
  );
}

export default ElectionComponent;
