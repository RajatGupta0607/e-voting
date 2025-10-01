"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import type { StatusType, Year } from "./ElectionComponent";

interface FilterProps {
  selectedData: {
    course: string;
    year: Year;
    division: string;
    status: StatusType;
  };
  setSelectedData: React.Dispatch<
    React.SetStateAction<{
      course: string;
      year: Year;
      division: string;
      status: StatusType;
    }>
  >;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const Courses = ["All", "BCA", "BBA-IT", "MBA-IT", "MSc-CA"];
const Years = ["All", "1", "2", "3"];
const Divisions = ["All", "A", "B", "C", "D"];
const Status = [
  { label: "All", value: "All" },
  { label: "Pending", value: "PENDING" },
  { label: "Candidature Open", value: "CANDIDATURE_OPEN" },
  { label: "Voting Open", value: "VOTING_OPEN" },
  { label: "Closed", value: "CLOSED" },
];

function Filter({
  selectedData,
  setSelectedData,
  searchQuery,
  setSearchQuery,
}: FilterProps) {
  return (
    <div className="flex items-end justify-between">
      <h1 className="text-5xl font-bold">Elections</h1>
      <div className="flex w-fit items-center gap-4">
        <Input
          placeholder="Search"
          className="h-[40px] w-[300px] border border-[#181818]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Filter</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex flex-col gap-1"
            >
              <Label htmlFor="course">Course</Label>
              <Select
                defaultValue={selectedData.course}
                onValueChange={(val) =>
                  setSelectedData((prev) => ({ ...prev, course: val }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                  {Courses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex flex-col gap-1"
            >
              <Label htmlFor="year">Year</Label>
              <Select
                defaultValue={selectedData.year}
                onValueChange={(val: Year) =>
                  setSelectedData((prev) => ({ ...prev, year: val }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {Years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex flex-col gap-1"
            >
              <Label htmlFor="division">Division</Label>
              <Select
                defaultValue={selectedData.division}
                onValueChange={(val) =>
                  setSelectedData((prev) => ({ ...prev, division: val }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Division" />
                </SelectTrigger>
                <SelectContent>
                  {Divisions.map((division) => (
                    <SelectItem key={division} value={division}>
                      {division}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex flex-col gap-1"
            >
              <Label htmlFor="division">Election Status</Label>
              <Select
                defaultValue={selectedData.status}
                onValueChange={(val: StatusType) =>
                  setSelectedData((prev) => ({ ...prev, status: val }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Election Status" />
                </SelectTrigger>
                <SelectContent>
                  {Status.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default Filter;
