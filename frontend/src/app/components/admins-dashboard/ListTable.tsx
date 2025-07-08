"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./ListTable.module.scss";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import Link from "next/link";
import RedirectButton from "../elements/buttons/redirectButton/RedirectButton";

type ListTableProps = {
  listType: string;
  fetchedData: any[];
  omitItems: string[];
  linkItems: string[];
  linkUrls: string[];
  replaceItems: string[];
  addUserLink?: string[];
};

function ListTable({
  listType,
  fetchedData,
  omitItems,
  linkItems,
  linkUrls,
  replaceItems,
  addUserLink,
}: ListTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filterColumn, setFilterColumn] = useState<string>("0");
  const [filterValue, setFilterValue] = useState<string>("");
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);

  useEffect(() => {
    const listData = async () => {
      try {
        let listData = fetchedData;

        switch (listType) {
          case "Instructor List":
            // Set the active tab to the instructor calendar tab.
            localStorage.setItem("activeInstructorTab", "0");
            break;
          case "Customer List":
            // Set the active tab to the customer calendar tab.
            localStorage.setItem("activeCustomerTab", "0");
            // Set the previous list page to customer list.
            localStorage.setItem("previousListPage", "customer-list");
            break;
          case "Child List":
            // Set the active tab to the children profiles tab.
            localStorage.setItem("activeCustomerTab", "2");
            // Set the previous list page to child list.
            localStorage.setItem("previousListPage", "child-list");
            break;
          default:
            break;
        }
        setData(listData);
      } catch (error) {
        console.error(error);
      }
    };

    listData();
  }, [fetchedData, listType]);

  useEffect(() => {
    // Handle the click event on the table cell
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLTableCellElement;
      if (target && target.tagName === "TD") {
        const cellId = target.dataset.cellId || "";
        handleCellClick(cellId);
      }
    };

    // Add event listener when clicking on the table cell
    document.addEventListener("click", handleClick);

    // Cleanup event listener when clicking on the same table cell again
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [data]);

  // Define the displays of the table
  const columns = useMemo<ColumnDef<any>[]>(
    () =>
      data.length > 0
        ? Object.keys(data[0])
            // Omit the item from the table
            .filter((key) => !omitItems.includes(key))
            // Set the item to be a link
            .map((key) => ({
              accessorKey: key,
              header: key,
              cell: (data) => {
                const value = data.getValue() as any;
                // If the item is a color code, display it as a colored box
                if (key === "Color Code" && typeof value === "string") {
                  return (
                    <div className={styles.eventColor}>
                      <div
                        className={styles.eventColor__colorBox}
                        style={{
                          backgroundColor: value,
                        }}
                      />
                      <span>{value.toUpperCase().replace(/,\s*/g, ", ")}</span>
                    </div>
                  );
                }
                // If the item is not a link item, return the value
                if (!linkItems.includes(key)) {
                  return value;
                }
                // Set the link URL
                let linkUrl = linkUrls[linkItems.indexOf(key)];
                // Replace the item with the value (e.g., [ID] -> 1, 2, 3...)
                replaceItems.forEach((replaceItem) => {
                  linkUrl = linkUrl.replace(
                    `[${replaceItem}]`,
                    data.row.original[replaceItem],
                  );
                });
                return <Link href={linkUrl}>{value}</Link>;
              },
            }))
        : [],
    [data, omitItems, linkItems, linkUrls, replaceItems],
  );

  // Handle cell click to toggle the expanded state
  const handleCellClick = (cellId: string) => {
    setSelectedCellId((prevId) => (prevId === cellId ? null : cellId));
  };

  // Configure the filter
  const filteredData = useMemo(
    () =>
      data.filter((eachData) =>
        filterColumn && filterValue
          ? String(eachData[filterColumn])
              .toLowerCase()
              .includes(filterValue.toLowerCase())
          : true,
      ),
    [data, filterColumn, filterValue],
  );

  // Define the table configuration
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), // provide a core row model
    getSortedRowModel: getSortedRowModel(), // provide a sorting row model
  });

  // Change the option color when selected
  const changeOptionColor = (optionTag: HTMLSelectElement) => {
    if (parseInt(optionTag.value) !== 0) {
      optionTag.style.color = "#000000";
    }
  };

  // Handle the filter change
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterColumn(event.target.value);
    changeOptionColor(event.target);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.topContainer}>
          <div className={styles.filterContainer}>
            <select value={filterColumn} onChange={handleChange}>
              <option disabled value="0">
                Select a column
              </option>
              {data.length > 0 &&
                Object.keys(data[0])
                  .filter((key) => !omitItems.includes(key))
                  .map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
            </select>
            <input
              type="text"
              placeholder="Enter filter value..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
          </div>
          {addUserLink ? (
            <RedirectButton
              linkURL={addUserLink[0]}
              btnText={addUserLink[1]}
              className="addBtn"
              Icon={PlusIcon}
            />
          ) : null}
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.tableContainer}>
            <thead className={styles.tableHeader}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={
                        header.column.getIsSorted()
                          ? header.column.getIsSorted() === "asc"
                            ? "sorted-asc"
                            : "sorted-desc"
                          : ""
                      }
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: "▲",
                        desc: "▼",
                      }[header.column.getIsSorted() as string] ?? "　"}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className={styles.tableBody}>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      data-cell-id={cell.id}
                      className={
                        selectedCellId === cell.id ? styles.expanded : ""
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ListTable;
