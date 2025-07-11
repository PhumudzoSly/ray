"use client";
import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Bot, Notebook, Text } from "lucide-react";

const JournalSidebar = () => {
  return (
    <div className="w-full">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="account" className="flex gap-3 items-center">
            <Bot className="h-4 w-4" size={18} /> AI
          </TabsTrigger>
          <TabsTrigger value="password" className="flex gap-3 items-center">
            <Text className="h-4 w-4" size={18} /> Summary
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex gap-3 items-center">
            <Notebook className="h-4 w-4" size={18} /> Notes
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex gap-3 items-center">
            <Notebook className="h-4 w-4" size={18} /> Key points
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
};

export default JournalSidebar;
