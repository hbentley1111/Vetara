import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackToDashboard() {
  return (
    <Link href="/">
      <Button variant="outline" className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>
    </Link>
  );
}