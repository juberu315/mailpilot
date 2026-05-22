"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  image?: string;
  read: boolean;
  receivedAt: string;
  summary?: string;
  category?: string;
  priority?: string;
}

export default function EmailDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [email, setEmail] = useState<Email | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/emails/${id}`)
        .then((res) => res.json())
        .then(setEmail);
    }
  }, [id]);

  if (!email) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">{email.subject}</h1>
      <p><strong>From:</strong> {email.sender}</p>
      {email.image && <img src={email.image} className="w-12 h-12 rounded-full my-2" />}
      <p><strong>Status:</strong> {email.read ? "Read" : "Unread"}</p>
      <p><strong>Received At:</strong> {new Date(email.receivedAt).toLocaleString()}</p>
      <p className="mt-2"><strong>Body:</strong> {email.body}</p>
      <p className="mt-2"><strong>Summary:</strong> {email.summary ?? "Not summarized"}</p>
      <p><strong>Category:</strong> {email.category ?? "N/A"}</p>
      <p><strong>Priority:</strong> {email.priority ?? "N/A"}</p>
    </div>
  );
}