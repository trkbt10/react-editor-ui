/**
 * @file DataTableViewer demo page
 */

import { useState, useMemo, useCallback } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoMutedText,
} from "../../components";
import {
  DataTableViewer,
  type DataTableViewerProps,
} from "../../../viewers/DataTableViewer/DataTableViewer";
import type {
  TableColumnDef,
  SortDirection,
} from "../../../components/Table/types";
import { Button } from "../../../components/Button/Button";

// ============================================================================
// Sample data generation
// ============================================================================

type Person = {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  startDate: string;
  status: "active" | "inactive" | "pending";
};

function generatePeople(count: number): Person[] {
  const firstNames = [
    "Alice", "Bob", "Charlie", "Diana", "Edward",
    "Fiona", "George", "Hannah", "Ivan", "Julia",
    "Kevin", "Laura", "Michael", "Nancy", "Oscar",
  ];
  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones",
    "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  ];
  const departments = [
    "Engineering", "Marketing", "Sales", "HR", "Finance",
    "Operations", "Legal", "Product", "Design", "Support",
  ];
  const roles = [
    "Manager", "Senior", "Junior", "Lead", "Director",
    "Specialist", "Analyst", "Coordinator", "Associate",
  ];
  const statuses: Person["status"][] = ["active", "inactive", "pending"];

  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    return {
      id: i + 1,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      department: departments[i % departments.length],
      role: roles[i % roles.length],
      salary: 50000 + Math.floor(Math.random() * 100000),
      startDate: new Date(2020, i % 12, (i % 28) + 1).toISOString().split("T")[0],
      status: statuses[i % statuses.length],
    };
  });
}

// ============================================================================
// Column definitions
// ============================================================================

const columns: TableColumnDef<Person>[] = [
  { key: "id", label: "ID", width: 60, sortable: true, align: "right" },
  { key: "name", label: "Name", sortable: true, draggable: true },
  { key: "email", label: "Email", sortable: true, draggable: true },
  { key: "department", label: "Department", sortable: true, draggable: true },
  { key: "role", label: "Role", sortable: true, draggable: true },
  {
    key: "salary",
    label: "Salary",
    width: 100,
    sortable: true,
    align: "right",
    render: (value) => `$${(value as number).toLocaleString()}`,
  },
  { key: "startDate", label: "Start Date", width: 100, sortable: true },
  {
    key: "status",
    label: "Status",
    width: 80,
    sortable: true,
    render: (value) => {
      const status = value as Person["status"];
      const colors = {
        active: "#22c55e",
        inactive: "#ef4444",
        pending: "#f59e0b",
      };
      return (
        <span style={{ color: colors[status], textTransform: "capitalize" }}>
          {status}
        </span>
      );
    },
  },
];

// ============================================================================
// Demo component
// ============================================================================

export function DataTableViewerDemo() {
  // Data
  const [allData] = useState(() => generatePeople(10000));

  // Sort state
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Selection
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // Column order
  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map((c) => c.key));

  // Ordered columns based on current order
  const orderedColumns = useMemo(() => {
    return columnOrder
      .map((key) => columns.find((c) => c.key === key))
      .filter((c): c is TableColumnDef<Person> => c !== undefined);
  }, [columnOrder]);

  // Filter data
  const filteredData = useMemo(() => {
    return allData.filter((person) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          person.name.toLowerCase().includes(query) ||
          person.email.toLowerCase().includes(query) ||
          person.department.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Department filter
      if (departmentFilter && person.department !== departmentFilter) {
        return false;
      }

      // Status filter
      if (statusFilter && person.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [allData, searchQuery, departmentFilter, statusFilter]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey as keyof Person];
      const bVal = b[sortKey as keyof Person];

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Handlers
  const handleSort = useCallback((key: string, direction: SortDirection) => {
    setSortKey(direction ? key : null);
    setSortDirection(direction);
  }, []);

  const handleRowClick = useCallback((index: number) => {
    setSelectedRowIndex(index);
  }, []);

  const handleColumnsReorder = useCallback((newOrder: string[]) => {
    setColumnOrder(newOrder);
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    if (key === "department") {
      setDepartmentFilter(value);
    } else if (key === "status") {
      setStatusFilter(value);
    }
  }, []);

  // Department options
  const departmentOptions = useMemo(() => {
    const depts = [...new Set(allData.map((p) => p.department))].sort();
    return [
      { value: "", label: "All Departments" },
      ...depts.map((d) => ({ value: d, label: d })),
    ];
  }, [allData]);

  // Status options
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
  ];

  return (
    <DemoContainer title="DataTableViewer">
      <DemoMutedText size={12}>
        High-performance virtualized data table with 2D scrolling.
        Displaying 10,000 rows with sortable and draggable columns.
      </DemoMutedText>

      <DemoSection label="Full Featured Table (10,000 rows)">
        <DataTableViewer
          rows={sortedData}
          columns={orderedColumns}
          height={500}
          fillWidth
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          onColumnsReorder={handleColumnsReorder}
          selectedRowIndex={selectedRowIndex}
          onRowClick={handleRowClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search name, email, or department..."
          filters={[
            {
              key: "department",
              label: "Department",
              value: departmentFilter,
              options: departmentOptions,
            },
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              options: statusOptions,
            },
          ]}
          onFilterChange={handleFilterChange}
          showRowCount
          totalRowCount={allData.length}
        />
      </DemoSection>

      <DemoSection label="Basic Table (No Toolbar, fillWidth)">
        <DataTableViewer
          rows={sortedData.slice(0, 100)}
          columns={columns.slice(0, 4)}
          height={300}
          fillWidth
          showToolbar={false}
          selectedRowIndex={selectedRowIndex}
          onRowClick={handleRowClick}
        />
      </DemoSection>

      <DemoSection label="Fixed Width Mode (no fillWidth)">
        <DataTableViewer
          rows={sortedData.slice(0, 100)}
          columns={columns.slice(0, 4)}
          height={300}
          showToolbar={false}
          selectedRowIndex={selectedRowIndex}
          onRowClick={handleRowClick}
        />
      </DemoSection>

      <DemoSection label="With Custom Query Slot (fillWidth)">
        <DataTableViewer
          rows={sortedData.slice(0, 50)}
          columns={columns.slice(0, 5)}
          height={300}
          fillWidth
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          querySlot={
            <Button size="sm" variant="secondary">
              Run Query
            </Button>
          }
          showRowCount
        />
      </DemoSection>
    </DemoContainer>
  );
}
