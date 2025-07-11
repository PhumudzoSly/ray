import LoadingSpinner from "@workspace/ui/components/loading-spinner";

const loading = () => {
  return (
    <div className="flex justify-center items-center h-40">
      <LoadingSpinner className="h-8 w-8 text-primary" />
    </div>
  );
};

export default loading;
