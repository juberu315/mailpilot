"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Sidebar, Topbar } from "@/features/dashboard/components";
import { Button } from "@/components/ui/button";

interface Email {
  id: string;
  emailId: string;
  sender: string;
  subject: string;
  body: string;
  image?: string;
  read: boolean;
  receivedAt: string;
  summary?: string;
  category?: string;
  priority?: string;
  sentiment?: string;
  intent?: string;
  suggestedReply?: string;
}

export default function EmailDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [aloading, asetLoading] = useState(false);
  const [reply, setReply] = useState("");

  // Fetch email + AI analysis
  useEffect(() => {
    if (!id) return;

    const fetchEmail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/emails/analyze/${id}`);
        const data = await res.json();
        setEmail(data);
        setReply(data.suggestedReply ?? "");
      } catch (err) {
        console.error("Failed to fetch email:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [id]);

  const handleApproveReply = async () => {
    // Placeholder: integrate Gmail draft/send later
    asetLoading(true);
    try {
      if(!email?.emailId) throw new Error("Email ID is missing");
      const res = await fetch("/api/emails/create-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId: email?.emailId, draftBody: reply }),
      });
      const data = await res.json();
      if (data.success) alert("Draft created successfully!");
      else alert("Failed to create draft: " + data.error);
    } catch (err) {
      console.error(err);
      alert("Failed to create draft");
    } finally {
      asetLoading(false);
    }
  };

  return (
    <DashboardLayout
      sidebar={<Sidebar activeItem="Dashboard" />}
      header={<Topbar activeItem="Dashboard" />}
      mainClassName="relative"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="relative space-y-6 p-8">
        {loading ? (
          <p className="text-gray-500 font-medium">Loading email details...</p>
        ) : email ? (
          <div className="space-y-4 max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900">{email.subject}</h1>
            <p className="text-gray-700"><strong>From:</strong> {email.sender}</p>
            {email.image && (
              <img
                src={email.image}
                alt="Sender"
                className="w-16 h-16 rounded-full my-2"
              />
            )}
            <p className="text-gray-700"><strong>Status:</strong> {email.read ? "Read" : "Unread"}</p>
            <p className="text-gray-700">
              <strong>Received At:</strong> {new Date(email.receivedAt).toLocaleString()}
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-gray-700"><strong>Body:</strong> {email.body}</p>
              <p className="text-gray-700"><strong>Summary:</strong> {email.summary ?? "Not summarized"}</p>
              <p className="text-gray-700"><strong>Category:</strong> {email.category ?? "N/A"}</p>
              <p className="text-gray-700"><strong>Priority:</strong> {email.priority ?? "N/A"}</p>
              {email.sentiment && <p className="text-gray-700"><strong>Sentiment:</strong> {email.sentiment}</p>}
              {email.intent && <p className="text-gray-700"><strong>Intent:</strong> {email.intent}</p>}

              {/* Suggested Reply Editor */}
              <div className="mt-4">
                <p className="text-gray-700 font-semibold mb-1">Suggested Reply:</p>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={6}
                  className="w-full border rounded p-2 text-sm font-sans"
                />
                <Button
                  className="mt-2"
                  onClick={handleApproveReply}
                  disabled={aloading}
                >
                  Approve / Send
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-500 font-medium">Email not found.</p>
        )}
      </div>
    </DashboardLayout>
  );
}