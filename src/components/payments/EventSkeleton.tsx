import { Card, CardBody, Skeleton } from "@heroui/react";

const EventSkeleton = () => {
  return (
    <Card className="w-full">
      <CardBody className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="w-1/3 h-4 rounded" />
              <Skeleton className="w-20 h-4 rounded" />
            </div>
            <Skeleton className="w-2/3 h-4 rounded" />
            <Skeleton className="w-full h-8 rounded" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default EventSkeleton;
