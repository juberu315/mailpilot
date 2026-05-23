"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

interface Email {
  id: string;
  sender: string;
  subject: string;
  body?: string;
  snippet?: string;
  summary?: string;
  read: boolean;
  receivedAt: string;
}

const PAGE_SIZE = 10;

export function EmailTable() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/emails");
      const data = await res.json();
      setEmails((prev) => [...data, ...prev]);
      setTotalPages(Math.ceil(data.length / PAGE_SIZE));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch emails from database on mount
  useEffect(() => {
    const fetchEmailsFromDB = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/emails/db"); // returns stored emails
        const data = await res.json();
        setEmails(data);
      } catch (err) {
        console.error("Failed to fetch emails from DB", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmailsFromDB();
  }, []);

  const paginatedEmails = emails.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={fetchEmails} disabled={loading}>
          {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
          {loading ? "Loading..." : "Fetch Emails"}
        </Button>
      </div>

      <div className="border rounded-lg shadow-lg overflow-hidden h-[600px] relative bg-white">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-white z-20">
            <Loader2 className="animate-spin w-10 h-10 text-gray-500" />
            <p className="text-gray-600 text-lg font-medium">Loading Emails...</p>
          </div>
        )}

        <div className="overflow-y-auto h-full">
          <table className="min-w-full table-fixed">
            <tbody>
              {paginatedEmails.map((email, idx) => (
                <Sheet key={email.id}>
                    <SheetTrigger asChild>
                    <tr  className={clsx("hover:bg-gray-50 cursor-pointer", idx % 2 === 0 ? "bg-white" : "bg-gray-50")} style={{ height: "60px" }}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 truncate max-w-[150px]">{email.sender}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-[500px]">
                            <span className="font-medium">{email.subject}</span> - {email.snippet ?? ""}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600 text-right truncate">{new Date(email.receivedAt).toLocaleDateString()}</td>
                    </tr>
                    </SheetTrigger>
                    <SheetContent className="bg-white rounded-0 shadow-xl p-6">
                    <SheetHeader className="border-b pb-4 mb-4">
                        <SheetTitle className="text-2xl font-semibold text-gray-900">{email.subject}</SheetTitle>
                        <SheetDescription className="text-gray-600 text-sm mt-1">
                        From {email.sender} | {email.read ? "Read" : "Unread"} | {new Date(email.receivedAt).toLocaleString()}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 font-sans text-gray-800 text-sm">
                        <p><strong>Body:</strong> {email.body}</p>
                        <Link href={`/emails/${email.id}`} className="text-blue-600 hover:underline font-medium mt-2 inline-block">
                        Open Full Detail Page
                        </Link>
                    </div>
                    </SheetContent>
                </Sheet>
              ))}
              {paginatedEmails.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500 font-medium">
                    No emails to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Prev
          </Button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <Button key={idx} variant={currentPage === idx + 1 ? "default" : "outline"} onClick={() => setCurrentPage(idx + 1)}>
              {idx + 1}
            </Button>
          ))}
          <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}