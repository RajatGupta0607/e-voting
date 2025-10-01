"use client";

import type { $Enums } from "@prisma/client";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

const Status = {
  PENDING: "Pending",
  CANDIDATURE_OPEN: "Candidature Open",
  VOTING_OPEN: "Voting Open",
  CLOSED: "Closed",
};

function ElectionTableList({
  data,
}: {
  data: {
    name: string;
    id: string;
    course: string;
    year: number;
    division: string;
    status: $Enums.ElectionStatus;
    candidatureDeadline: Date;
    votingStartDate: Date;
    votingEndDate: Date;
  }[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Course</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Division</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Candidature Deadline</TableHead>
          <TableHead>Voting Start Date</TableHead>
          <TableHead>Voting End Date</TableHead>
          <TableHead className="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((election, i) => (
          <TableRow key={i}>
            <TableCell>{election.name}</TableCell>
            <TableCell>{election.course}</TableCell>
            <TableCell>{election.year}</TableCell>
            <TableCell>{election.division}</TableCell>
            <TableCell>{Status[election.status]}</TableCell>
            <TableCell>
              {election.candidatureDeadline.toLocaleDateString()}
            </TableCell>
            <TableCell>
              {election.votingStartDate.toLocaleDateString()}
            </TableCell>
            <TableCell>{election.votingEndDate.toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" className="cursor-pointer">
                <IconEdit className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer text-red-600"
              >
                <IconTrash className="size-3" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default ElectionTableList;
