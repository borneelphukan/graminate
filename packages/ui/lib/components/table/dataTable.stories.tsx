import type { Meta, StoryObj } from "@storybook/react";

import { useEffect, useState } from "react";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";
import { Input } from "../input/input";
import {
  DataTable,
  type DataTableColumnDef,
  type SortState,
} from "./dataTable";

const meta = {
  title: "Components/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Types & Helpers ---

interface FilterState<TData> {
  id: keyof TData;
  type: "equals" | "contains";
  value: string;
}

const statusToBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "valid":
    case "gültig":
      return "success";
    case "expired":
    case "abgelaufen":
      return "error";
    case "pending":
      return "warning";
    default:
      return "default";
  }
};

type Data = {
  bg: string;
  status: string;
  validity: string;
  documents: string;
};

const columns: DataTableColumnDef<Data>[] = [
  {
    header: "Berufsgenossenschaft",
    accessorKey: "bg",
    id: "bg",
  },
  {
    header: "Dokumenten Status",
    accessorKey: "status",
    id: "status",
    cell: ({ row }) => {
      return (
        <Badge
          className="w-fit"
          label={row.original.status}
          type={statusToBadgeVariant(row.original.status)}
        />
      );
    },
    enableSorting: false,
  },
  {
    header: "Gültigkeitsdauer",
    accessorKey: "validity",
    id: "validity",
  },
  {
    header: "Dokumente",
    accessorKey: "documents",
    id: "documents",
    cell: ({ row }) => {
      return (
        <Button className="text-sm font-normal" variant="link">
          {row.original.documents}
        </Button>
      );
    },
    enableSorting: false,
  },
  {
    header: "",
    accessorKey: "actions",
    id: "actions",
    cell: () => {
      return (
        <Button
          variant="primary"
          icon={{ right: "arrow_circle_right" }}
          onClick={() => {
            alert("Details clicked");
          }}
        >
          Details
        </Button>
      );
    },
    enableSorting: false,
  },
];

const data: Data[] = [
  {
    bg: "BG Bau",
    status: "Gültig",
    validity: "2025-12-31",
    documents: "Certificate.pdf",
  },
  {
    bg: "BG Gesundheit",
    status: "Gültig",
    validity: "2023-06-15",
    documents: "Report.docx",
  },
  {
    bg: "BG Handel",
    status: "Gültig",
    validity: "2024-09-01",
    documents: "Manual.pdf",
  },
  {
    bg: "BG Verkehr",
    status: "Abgelaufen",
    validity: "2022-11-30",
    documents: "Invoice.pdf",
  },
];

const fetch = (
  sort?: SortState<string>,
  filter?: FilterState<(typeof data)[number]>
): typeof data => {
  const augmentedData = [...data];

  if (sort) {
    augmentedData.sort((a, b) => {
      const aValue = a[sort.id as keyof typeof a];
      const bValue = b[sort.id as keyof typeof b];

      if (aValue < bValue) return sort.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  if (filter) {
    return augmentedData.filter((item) => {
      switch (filter.type) {
        case "equals":
          return item[filter.id].toLowerCase() === filter.value.toLowerCase();
        case "contains":
          return item[filter.id]
            .toString()
            .toLowerCase()
            .includes(filter.value.toLowerCase());
        default:
          return true;
      }
    });
  }

  return augmentedData;
};

export const Basic: Story = {
  args: {
    columns: columns as unknown as DataTableColumnDef<unknown, unknown>[],
    data,
  },
};

export const Loading: Story = {
  args: {
    columns: columns as unknown as DataTableColumnDef<unknown, unknown>[],
    data: [],
    isLoading: true,
  },
};

export const WithBorders: Story = {
  args: {
    columns: columns as unknown as DataTableColumnDef<unknown, unknown>[],
    data,
    showCellBorders: true,
  },
};

export const FixedLayout: Story = {
  args: {
    columns: columns as unknown as DataTableColumnDef<unknown, unknown>[],
    data,
    isFixed: true,
  },
  render: (args) => (
    <div className="w-[800px]">
      <DataTable {...args} />
    </div>
  ),
};

export const WithPagination: Story = {
  args: {
    columns: columns as unknown as DataTableColumnDef<unknown, unknown>[],
    data,
  },
  render: () => {
    const [pageIndex, setPageIndex] = useState(0);
    const pageSize = 2;
    const currentData = data.slice(
      pageIndex * pageSize,
      (pageIndex + 1) * pageSize
    );

    return (
      <DataTable
        columns={columns}
        data={currentData}
        pagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        rowCount={data.length}
        onPageChange={setPageIndex}
      />
    );
  },
};

export const WithColumnVisibility: Story = {
  args: {
    columns: columns as unknown as DataTableColumnDef<unknown, unknown>[],
    data,
  },
  render: () => {
    const [columnVisibility, setColumnVisibility] = useState({ actions: true });
    const [sort, setSort] = useState<SortState<string>>();
    const [tableData, setTableData] = useState(data);

    const onClick = () => {
      setColumnVisibility({ actions: !columnVisibility.actions });
    };

    useEffect(() => {
      setTableData(fetch(sort));
    }, [sort]);

    return (
      <>
        <Button variant="destructive" onClick={onClick} className="mb-2">
          Toggle Action Visibility
        </Button>
        <DataTable
          columns={columns}
          data={tableData}
          columnVisibility={columnVisibility}
          sort={sort}
          onHeaderSortClick={(sort) => setSort(sort)}
        />
      </>
    );
  },
};

export const WithFiltering: Story = {
  args: {
    columns: columns as unknown as DataTableColumnDef<unknown, unknown>[],
    data,
  },
  render: () => {
    const [tableData, setTableData] = useState(data);
    const [filter, setFilter] = useState<string>();

    useEffect(() => {
      setTableData(
        fetch(
          undefined,
          filter ? { id: "bg", type: "contains", value: filter } : undefined
        )
      );
    }, [filter]);

    return (
      <div>
        <Input
          id="filtering-input"
          label="Filter Berufsgenossenschaft"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-2"
        />
        <DataTable columns={columns} data={tableData} />
      </div>
    );
  },
};

export const CustomRowStyling: Story = {
  args: {
    columns: columns as unknown as DataTableColumnDef<unknown, unknown>[],
    data,
    rowClassName: (row) =>
      (row as Data).status === "Abgelaufen" ||
      (row as Data).status === "Expired"
        ? "bg-red-50 hover:bg-red-100"
        : undefined,
  },
};

// --- Nested Table Helpers ---

type ChildData = {
  name: string;
  plz: string;
  city: string;
};

type DataWithChildren = Data & {
  children?: ChildData[];
};

const childColumns: DataTableColumnDef<ChildData>[] = [
  {
    header: "Name",
    accessorKey: "name",
    id: "name",
  },
  {
    header: "PLZ",
    accessorKey: "plz",
    id: "plz",
  },
  {
    header: "Stadt",
    accessorKey: "city",
    id: "city",
  },
];

const columnsWithChildren: DataTableColumnDef<DataWithChildren>[] = [
  {
    header: "Berufsgenossenschaft",
    accessorKey: "bg",
    id: "bg",
    cell: ({ row }) => (
      <span className="flex flex-row items-center">
        {row.getCanExpand() && (
          <Button onClick={row.getToggleExpandedHandler()} variant="ghost">
            {row.getIsExpanded() ? (
              <Icon type="keyboard_arrow_down" />
            ) : (
              <Icon type="keyboard_arrow_right" />
            )}
          </Button>
        )}
        <span>{row.original.bg}</span>
      </span>
    ),
  },
  {
    header: "Dokumenten Status",
    accessorKey: "status",
    id: "status",
    cell: ({ row }) => (
      <Badge
        className="w-fit"
        label={row.original.status}
        type={statusToBadgeVariant(row.original.status)}
      />
    ),
    enableSorting: false,
  },
  {
    header: "Gültigkeitsdauer",
    accessorKey: "validity",
    id: "validity",
  },
  {
    header: "Dokumente",
    accessorKey: "documents",
    id: "documents",
    cell: ({ row }) => (
      <Button className="text-sm font-normal" variant="link">
        {row.original.documents}
      </Button>
    ),
    enableSorting: false,
  },
  {
    header: "",
    accessorKey: "actions",
    id: "actions",
    cell: () => {
      return (
        <Button
          variant="primary"
          icon={{ right: "arrow_circle_right" }}
          onClick={() => {
            alert("Details clicked");
          }}
        >
          Details
        </Button>
      );
    },
    enableSorting: false,
  },
];

const extendedData: DataWithChildren[] = [
  {
    bg: "Parent BG",
    status: "Pending",
    validity: "2025-12-31",
    documents: "Many",
    children: [
      {
        name: "Hauptsitz Berlin",
        plz: "10115",
        city: "Berlin",
      },
      {
        name: "Niederlassung München",
        plz: "80331",
        city: "München",
      },
      {
        name: "Zweigstelle Hamburg",
        plz: "20095",
        city: "Hamburg",
      },
      {
        name: "Büro Frankfurt",
        plz: "60311",
        city: "Frankfurt am Main",
      },
    ],
  },
  {
    bg: "Parent BG 2",
    status: "Valid",
    validity: "2026-03-20",
    documents: "Multiple",
    children: [
      {
        name: "Zentrale Köln",
        plz: "50667",
        city: "Köln",
      },
      {
        name: "Filiale Stuttgart",
        plz: "70173",
        city: "Stuttgart",
      },
    ],
  },
  {
    bg: "Parent BG 3",
    status: "Expired",
    validity: "2023-01-01",
    documents: "Various",
    children: [
      {
        name: "Geschäftsstelle Dresden",
        plz: "01067",
        city: "Dresden",
      },
      {
        name: "Außenstelle Leipzig",
        plz: "04109",
        city: "Leipzig",
      },
      {
        name: "Vertretung Hannover",
        plz: "30159",
        city: "Hannover",
      },
    ],
  },
];

const fetchNested = (
  originalData: DataWithChildren[] | ChildData[],
  sort?: SortState<string>
) => {
  const augmentedData = [...originalData];

  if (sort) {
    augmentedData.sort((a, b) => {
      const aValue = a[sort.id as keyof typeof a];
      const bValue = b[sort.id as keyof typeof b];

      // Only sorting for string values for simplicity
      if (typeof aValue !== "string" || typeof bValue !== "string") return 0;

      if (aValue < bValue) return sort.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  return augmentedData;
};

export const Nested: Story = {
  args: {
    columns: columnsWithChildren as unknown as DataTableColumnDef<
      unknown,
      unknown
    >[],
    data: extendedData,
  },
  render: () => {
    const [outerSort, setOuterSort] = useState<SortState<string>>();
    const [innerSort, setInnerSort] = useState<SortState<string>>();
    const [tableData, setTableData] =
      useState<DataWithChildren[]>(extendedData);

    useEffect(() => {
      let sortedData = fetchNested(
        extendedData,
        outerSort
      ) as DataWithChildren[];

      // If there's an innerSort, sort the children arrays of each parent row
      if (innerSort) {
        sortedData = sortedData.map((parentRow) => ({
          ...parentRow,
          children: parentRow.children
            ? (fetchNested(parentRow.children, innerSort) as ChildData[])
            : undefined,
        }));
      }

      setTableData(sortedData);
    }, [outerSort, innerSort]);

    return (
      <DataTable
        columns={columnsWithChildren}
        data={tableData}
        sort={outerSort}
        onHeaderSortClick={(sort) => setOuterSort(sort)}
        renderChild={({ row }: { row: DataWithChildren }) =>
          row.children ? (
            <DataTable
              columns={childColumns}
              data={row.children}
              sort={innerSort}
              onHeaderSortClick={(s) => setInnerSort(s)}
              inline
            />
          ) : null
        }
      />
    );
  },
};

export const NestedWithBulletLines: Story = {
  args: {
    columns: columnsWithChildren as unknown as DataTableColumnDef<
      unknown,
      unknown
    >[],
    data: extendedData,
  },
  render: () => {
    const [outerSort, setOuterSort] = useState<SortState<string>>();
    const [innerSort, setInnerSort] = useState<SortState<string>>();
    const [tableData, setTableData] =
      useState<DataWithChildren[]>(extendedData);

    useEffect(() => {
      let sortedData = fetchNested(
        extendedData,
        outerSort
      ) as DataWithChildren[];

      // If there's an innerSort, sort the children arrays of each parent row
      if (innerSort) {
        sortedData = sortedData.map((parentRow) => ({
          ...parentRow,
          children: parentRow.children
            ? (fetchNested(parentRow.children, innerSort) as ChildData[])
            : undefined,
        }));
      }

      setTableData(sortedData);
    }, [outerSort, innerSort]);

    return (
      <DataTable
        columns={columnsWithChildren}
        data={tableData}
        sort={outerSort}
        onHeaderSortClick={(sort) => setOuterSort(sort)}
        renderChild={({ row }: { row: DataWithChildren }) =>
          row.children ? (
            <DataTable
              columns={childColumns}
              data={row.children}
              sort={innerSort}
              onHeaderSortClick={(s) => setInnerSort(s)}
              inline
              bulletLines
            />
          ) : null
        }
      />
    );
  },
};
