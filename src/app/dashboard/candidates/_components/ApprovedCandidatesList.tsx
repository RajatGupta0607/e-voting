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
import { LinkPreview } from "~/components/ui/link-preview";
import Image from "next/image";

const Courses = ["All", "BCA", "BBA-IT", "MBA-IT", "MSc-CA"];
const Years = ["All", "1", "2", "3"];
type Year = "All" | "1" | "2" | "3";
const Divisions = ["All", "A", "B", "C", "D"];
const ALL_DATA = {
  course: "All",
  year: "All" as Year,
  division: "All",
};

function ApprovedCandidatesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedData, setSelectedData] = useState<typeof ALL_DATA>(ALL_DATA);
  const debouncedSearch = useDebounce(searchQuery.toLowerCase(), 300);

  const data = api.candidate.getAllApprovedCandidates.useQuery({
    searchQuery: debouncedSearch,
    filterData: selectedData,
  });

  return (
    <div>
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold">Approved Candidates</h1>
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
      <div className="mt-8 h-[20vh] w-full overflow-auto rounded-lg border">
        {data.isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="text-primary mr-2 h-9 w-9 animate-spin" />
          </div>
        ) : !data.data?.length ? (
          <p className="mt-8 w-full text-center">No Candidates Found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>PRN</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Election Name</TableHead>
                <TableHead>Manifesto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((candidate, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Image
                      src={candidate.user.image!}
                      alt={candidate.user.name ?? "User Image"}
                      width={40}
                      height={40}
                      className="aspect-square rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell>{candidate.user.name}</TableCell>
                  <TableCell>{candidate.user.prn}</TableCell>
                  <TableCell>{candidate.user.email}</TableCell>
                  <TableCell>{candidate.user.course}</TableCell>
                  <TableCell>{candidate.user.year}</TableCell>
                  <TableCell>{candidate.user.division}</TableCell>
                  <TableCell>{candidate.election.name}</TableCell>
                  <TableCell>
                    <LinkPreview
                      url={candidate.manifesto}
                      className="font-medium text-blue-600 underline"
                      isStatic
                      imageSrc={
                        candidate.manifesto
                          .replace("/upload/", "/upload/w_400/pg_1/")
                          .split(".")
                          .slice(0, -1)
                          .join(".") + ".jpg"
                      }
                    >
                      View file
                    </LinkPreview>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default ApprovedCandidatesList;
