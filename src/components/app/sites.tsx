"use client";
/* eslint-disable */


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import { motion, Variants } from "framer-motion";

interface Website {
  id: string;
  name: string;
  domain: string;
  phone: string;
  userId: string;
}

// Framer Motion Variants
const cardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

interface DashboardClientProps {
  initialWebsites: Website[];
}




export default function DashboardClient({ initialWebsites }: Readonly<DashboardClientProps>) {
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>(initialWebsites);
  const [editingWebsiteId, setEditingWebsiteId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedDomain, setEditedDomain] = useState("");
  const [editedPhone, setEditedPhone] = useState("");


  useEffect(() => {
    if (initialWebsites) {
      setWebsites(initialWebsites);
    }
  }, [initialWebsites]);

  const handleNewSiteClick = () => {
    router.push("/app/build");
  };

  const handleEditClick = (website: Website) => {
    setEditingWebsiteId(website.id);
    setEditedName(website.name);
    setEditedDomain(website.domain);
    setEditedPhone(website.phone);
  };

  const handleSaveClick = async (websiteId: string) => {
    try {
      const res = await fetch(`/api/client/${websiteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editedName,
          domain: editedDomain,
          phone: editedPhone,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update website");
      }

      setWebsites((prev) =>
        prev.map((site) =>
          site.id === websiteId
            ? {
                ...site,
                name: editedName,
                domain: editedDomain,
                phone: editedPhone,
              }
            : site
        )
      );
      setEditingWebsiteId(null);
      toast.success("Website updated successfully!");
    } catch (error: any) {
      console.error("Error updating website:", error);
      toast.error(error.message || "Failed to update website.");
    }
  };

  const handleCancelClick = () => {
    setEditingWebsiteId(null);
  };

  return (
    <div className="px-4 py-8 md:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-0">
            Your Registered Sites
          </h1>
          <Button onClick={handleNewSiteClick} className="rounded-md shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Site
          </Button>
        </div>

        {websites.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No websites registered yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => (
              <motion.div
                key={website.id}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
                className="overflow-hidden"
              >
                <Card className="shadow-md rounded-lg border-0">
                  <CardHeader className="px-4 py-3">
                    <CardTitle className="text-lg font-medium leading-tight">
                      {website.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {editingWebsiteId === website.id ? (
                      <div className="space-y-3">
                        <div>
                          <Label
                            htmlFor={`name-${website.id}`}
                            className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300"
                          >
                            Business Name
                          </Label>
                          <Input
                            id={`name-${website.id}`}
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor={`domain-${website.id}`}
                            className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300"
                          >
                            Domain
                          </Label>
                          <Input
                            id={`domain-${website.id}`}
                            value={editedDomain}
                            onChange={(e) => setEditedDomain(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor={`phone-${website.id}`}
                            className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300"
                          >
                            Phone
                          </Label>
                          <Input
                            id={`phone-${website.id}`}
                            value={editedPhone}
                            onChange={(e) => setEditedPhone(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            Domain:
                          </span>{" "}
                          {website.domain}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            Phone:
                          </span>{" "}
                          {website.phone}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="px-4 py-3 flex justify-end">
                    {editingWebsiteId === website.id ? (
                      <div className="space-x-2">
                        <Button
                          onClick={() => handleSaveClick(website.id)}
                          className="rounded-md shadow-sm"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelClick}
                          variant="outline"
                          className="rounded-md shadow-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleEditClick(website)}
                        className="rounded-md shadow-sm"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}