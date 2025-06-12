"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatDate } from "@/lib/utils"
import { getReportedContent, handleReport } from "@/app/actions/admin"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import type { ReportedContent } from "@/types/admin"

export function ContentModeration() {
  const [reports, setReports] = useState<ReportedContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending")
  const { toast } = useToast()

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true)
      const data = await getReportedContent(activeTab)
      setReports(data)
      setIsLoading(false)
    }

    fetchReports()
  }, [activeTab])

  const handleApproveReport = async (reportId: string) => {
    const result = await handleReport(reportId, "approve")

    if (result.error) {
      toast({
        title: "Грешка",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успех",
        description: "Докладът беше одобрен и съдържанието беше скрито",
      })

      // Обновяване на локалния списък с доклади
      setReports(reports.filter((report) => report.id !== reportId))
    }
  }

  const handleDismissReport = async (reportId: string) => {
    const result = await handleReport(reportId, "dismiss")

    if (result.error) {
      toast({
        title: "Грешка",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успех",
        description: "Докладът беше отхвърлен",
      })

      // Обновяване на локалния списък с доклади
      setReports(reports.filter((report) => report.id !== reportId))
    }
  }

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case "spam":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Спам
          </Badge>
        )
      case "harassment":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Тормоз
          </Badge>
        )
      case "inappropriate":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            Неподходящо съдържание
          </Badge>
        )
      case "misinformation":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Дезинформация
          </Badge>
        )
      default:
        return <Badge variant="outline">{reason}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Модерация на съдържание</CardTitle>
        <CardDescription>Преглед и обработка на докладвано съдържание</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" onValueChange={(value) => setActiveTab(value as "pending" | "all")}>
          <TabsList className="mb-6 grid w-full grid-cols-1 sm:grid-cols-2 h-auto">
            <TabsTrigger value="pending" className="text-xs sm:text-sm py-2">
              <span className="hidden xs:inline">Pending ({isLoading ? "..." : reports.length})</span>
              <span className="xs:hidden">Pending ({isLoading ? "..." : reports.length})</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm py-2">
              <span className="hidden xs:inline">All Reports</span>
              <span className="xs:hidden">All</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : reports.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Няма чакащи доклади</AlertTitle>
                <AlertDescription>Всички доклади са обработени. Проверете по-късно за нови.</AlertDescription>
              </Alert>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {reports.map((report) => (
                  <AccordionItem key={report.id} value={report.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span>
                            {report.content_type === "post" ? "Пост" : "Коментар"}:{" "}
                            {report.content_type === "post" && report.content?.title
                              ? report.content.title.substring(0, 50) + (report.content.title.length > 50 ? "..." : "")
                              : report.content?.content.substring(0, 50) +
                                (report.content?.content.length > 50 ? "..." : "")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                          {getReasonBadge(report.reason)}
                          <span className="text-sm text-muted-foreground">{formatDate(report.created_at)}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-4 bg-muted/50 rounded-md">
                        <div className="flex items-start gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                report.reporter?.avatar_url ||
                                `/placeholder.svg?height=32&width=32&query=${report.reporter?.username}`
                              }
                              alt={report.reporter?.username}
                            />
                            <AvatarFallback>{report.reporter?.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">Докладвано от: {report.reporter?.username}</div>
                            <div className="text-sm text-muted-foreground">{formatDate(report.created_at)}</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-1">Причина:</h4>
                          <p>{report.reason}</p>
                          {report.details && <p className="mt-2 text-sm text-muted-foreground">{report.details}</p>}
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-1">Докладвано съдържание:</h4>
                          <div className="p-4 bg-background rounded-md border">
                            <div className="flex items-start gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={
                                    report.content?.author?.avatar_url ||
                                    `/placeholder.svg?height=24&width=24&query=${report.content?.author?.username}`
                                  }
                                  alt={report.content?.author?.username}
                                />
                                <AvatarFallback>
                                  {report.content?.author?.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm font-medium">{report.content?.author?.username}</div>
                            </div>

                            {report.content_type === "post" && report.content?.title && (
                              <h3 className="text-base font-medium mb-2">{report.content.title}</h3>
                            )}

                            <p className="text-sm whitespace-pre-wrap">{report.content?.content}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => handleDismissReport(report.id)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Отхвърли
                          </Button>
                          <Button variant="destructive" onClick={() => handleApproveReport(report.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Одобри и скрий
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>

          <TabsContent value="all">
            {/* Подобно на горното, но показва всички доклади */}
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : reports.length === 0 ? (
              <Alert>
                <AlertTitle>Няма доклади</AlertTitle>
                <AlertDescription>Няма намерени доклади за съдържание.</AlertDescription>
              </Alert>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {reports.map((report) => (
                  <AccordionItem key={report.id} value={report.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span>
                            {report.content_type === "post" ? "Пост" : "Коментар"}:{" "}
                            {report.content_type === "post" && report.content?.title
                              ? report.content.title.substring(0, 50) + (report.content.title.length > 50 ? "..." : "")
                              : report.content?.content.substring(0, 50) +
                                (report.content?.content.length > 50 ? "..." : "")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                          {getReasonBadge(report.reason)}
                          <Badge
                            variant={
                              report.status === "pending"
                                ? "outline"
                                : report.status === "resolved"
                                  ? "success"
                                  : "secondary"
                            }
                          >
                            {report.status === "pending"
                              ? "Чакащ"
                              : report.status === "resolved"
                                ? "Одобрен"
                                : "Отхвърлен"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{formatDate(report.created_at)}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-4 bg-muted/50 rounded-md">
                        {/* Съдържание на доклада, подобно на горното */}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
