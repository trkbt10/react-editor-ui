/**
 * @file Pagination demo page
 */

import { useState } from "react";
import { DemoContainer, DemoSection, DemoMutedText } from "../../components";
import { Pagination } from "../../../components/Pagination/Pagination";
import { usePagination } from "../../../components/Pagination/usePagination";

// Sample data for usePagination demo
const sampleItems = Array.from({ length: 95 }, (_, i) => `Item ${i + 1}`);

export function PaginationDemo() {
  // Controlled pagination
  const [page1, setPage1] = useState(0);
  const [page2, setPage2] = useState(0);

  // usePagination hook demo
  const pagination = usePagination({
    totalItems: sampleItems.length,
    pageSize: 10,
  });

  const displayItems = pagination.getPageItems(sampleItems);

  return (
    <DemoContainer title="Pagination">
      <DemoMutedText size={12}>
        Reusable pagination controls with First/Prev/Next/Last buttons.
      </DemoMutedText>

      <DemoSection label="Basic (sm size)">
        <Pagination
          currentPage={page1}
          totalPages={10}
          onPageChange={setPage1}
          size="sm"
        />
      </DemoSection>

      <DemoSection label="Medium size">
        <Pagination
          currentPage={page2}
          totalPages={5}
          onPageChange={setPage2}
          size="md"
        />
      </DemoSection>

      <DemoSection label="Without First/Last buttons">
        <Pagination
          currentPage={page1}
          totalPages={10}
          onPageChange={setPage1}
          showFirstLast={false}
        />
      </DemoSection>

      <DemoSection label="Disabled">
        <Pagination
          currentPage={3}
          totalPages={10}
          onPageChange={() => {}}
          disabled
        />
      </DemoSection>

      <DemoSection label="Single page (hidden)">
        <DemoMutedText size={11}>
          Pagination is hidden when totalPages is 1
        </DemoMutedText>
        <Pagination currentPage={0} totalPages={1} onPageChange={() => {}} />
      </DemoSection>

      <DemoSection label="usePagination Hook">
        <DemoMutedText size={11}>
          Page {pagination.page + 1} of {pagination.totalPages} | Showing{" "}
          {pagination.startIndex}-{pagination.endIndex} of {sampleItems.length}
        </DemoMutedText>
        <div
          style={{
            padding: "8px",
            border: "1px solid var(--rei-color-border)",
            borderRadius: "4px",
            marginBottom: "8px",
            minHeight: "120px",
          }}
        >
          {displayItems.map((item) => (
            <div key={item} style={{ padding: "2px 0", fontSize: "12px" }}>
              {item}
            </div>
          ))}
        </div>
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={pagination.setPage}
        />
      </DemoSection>
    </DemoContainer>
  );
}
