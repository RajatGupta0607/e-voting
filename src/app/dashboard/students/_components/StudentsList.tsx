"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { useDebounce } from "~/hooks/useDebounce";
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
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Loader2 } from "lucide-react";

const Courses = ["All", "BCA", "BBA-IT", "MBA-IT", "MSc-CA"];
const Years = ["All", "1", "2", "3"];
type Year = "All" | "1" | "2" | "3";
const Divisions = ["All", "A", "B", "C", "D"];
const ALL_DATA = {
  course: "All",
  year: "All" as Year,
  division: "All",
};

function StudentsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedData, setSelectedData] = useState<typeof ALL_DATA>(ALL_DATA);
  const debouncedSearch = useDebounce(searchQuery.toLowerCase(), 300);

  const data = api.user.getStudentsList.useQuery({
    searchQuery: debouncedSearch,
    filterData: selectedData,
  });

  return (
    <div>
      <div className="flex items-end justify-between">
        <h1 className="text-5xl font-bold">Students</h1>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-8 h-[70vh] w-full overflow-auto rounded-lg border">
        {data.isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="text-primary mr-2 h-9 w-9 animate-spin" />
          </div>
        ) : !data.data?.length ? (
          <p className="mt-8 w-full text-center">No Student Found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>PRN</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Division</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((student, i) => (
                <TableRow key={i}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.prn}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell>{student.year}</TableCell>
                  <TableCell>{student.division}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default StudentsList;
