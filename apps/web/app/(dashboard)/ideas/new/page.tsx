"use client";
import React from "react";
import NewIdeaForm from "./new-idea";
import PageHeader from "@/components/shared/page-header";

const NewIdeaPage = () => {
  return (
    <div className="container">
      <PageHeader title="New idea" />
      <NewIdeaForm />
    </div>
  );
};

export default NewIdeaPage;
