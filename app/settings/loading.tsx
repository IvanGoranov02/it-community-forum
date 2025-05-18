import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SettingsLoading() {
  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-5 w-[400px] mt-2" />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-[200px]" />
            <Skeleton className="h-5 w-[300px] mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-[150px]" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-[170px]" />
                <Skeleton className="h-4 w-[270px]" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-[160px]" />
                <Skeleton className="h-4 w-[260px]" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Skeleton className="h-10 w-[150px]" />
        </div>
      </div>
    </div>
  )
}
