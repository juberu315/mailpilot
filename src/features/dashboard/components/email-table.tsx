"use client";

import { useEffect, useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet?: string;
  read: boolean;
  receivedAt: string;
  summary?: string;
  category?: string;
  priority?: string;
}

export function EmailTable() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const pageSize = 20;

  const fetchEmails = async (pageNum: number, append = false) => {
    setIsFetching(true);
    try {
      const res = await fetch(`/api/emails/db?page=${pageNum}&pageSize=${pageSize}`);
      const data = await res.json();
      setEmails(prev => append ? [...prev, ...data.emails] : data.emails);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch emails:", err);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchEmails(1);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages && !isFetching) {
          fetchEmails(page + 1, true);
        }
      },
      { threshold: 1 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [page, totalPages, isFetching]);

  return (
    <div className="p-8">
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-semibold">Inbox</h2>
        <Button variant="outline" onClick={() => fetchEmails(1)}>Refresh</Button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        {loading && emails.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-500">
            Loading emails...
          </div>
        ) : (
          <table className="table-auto w-full divide-y">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">From</th>
                <th className="px-4 py-2 text-left">Snippet</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Received At</th>
                <th className="px-4 py-2 text-left">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {emails.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-2 truncate max-w-xs">{email.subject}</td>
                  <td className="px-4 py-2 truncate max-w-xs">{email.sender}</td>
                  <td className="px-4 py-2 truncate max-w-xs">{email.snippet}</td>
                  <td className="px-4 py-2">{email.read ? "Read" : "Unread"}</td>
                  <td className="px-4 py-2">{new Date(email.receivedAt).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline">View</Button>
                      </SheetTrigger>
                      <SheetContent className="p-6">
                        <SheetHeader>
                          <SheetTitle>
                            {email.subject}
                          </SheetTitle>
                        </SheetHeader>
                        <p><strong>From:</strong> {email.sender}</p>
                        <p><strong>Status:</strong> {email.read ? "Read" : "Unread"}</p>
                        <p><strong>Received At:</strong> {new Date(email.receivedAt).toLocaleString()}</p>
                        <p className="mt-2"><strong>Snippet:</strong> {email.snippet}</p>
                        <p className="mt-2"><strong>Summary:</strong> {email.summary ?? "Loading AI analysis..."}</p>
                        <p><strong>Category:</strong> {email.category ?? "Loading..."}</p>
                        <p><strong>Priority:</strong> {email.priority ?? "Loading..."}</p>
                        <Button
                          variant="ghost"
                          className="mt-4"
                          onClick={() => window.location.href = `/emails/${email.id}`}
                        >
                          Open Detail Page
                        </Button>
                      </SheetContent>
                    </Sheet>
                  </td>
                </tr>
              ))}
              {isFetching && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    Loading more emails...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Sentinel div for infinite scroll */}
      <div ref={observerRef} className="h-8" />
    </div>
  );
}