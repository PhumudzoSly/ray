import { Separator } from "@workspace/ui/components/separator";

const ValidationReport = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return (
    <div>
      <div className="p-4">
        <h1 className="text-lg font-bold">Validation Report</h1>
        <p className="text-muted-foreground text-sm">
          Deep researched report of your idea
        </p>
      </div>
      <Separator />
      <div></div>
    </div>
  );
};

export default ValidationReport;
