"use client";
import NotionEditor from "@/components/editor/editor";
import React from "react";

const EditorPage = () => {
  return (
    <div className="h-screen w-screen px-20 py-10 mx-auto max-w-7xl    ">
      <NotionEditor initialContent="" showToolbar={false} />
    </div>
  );
};

export default EditorPage;
