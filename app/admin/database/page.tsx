"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DatabaseAdminPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleAddEditedColumns = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      // Изпълняваме първата версия на API ендпойнта
      const response = await fetch("/api/database")
      const data = await response.json()
      
      setResult(data)
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Columns added successfully to database",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add columns",
          variant: "destructive",
        })
        
        // Ако първият метод не сработи, опитваме втория
        try {
          const alternativeResponse = await fetch("/api/database/execute")
          const alternativeData = await alternativeResponse.json()
          
          if (alternativeData.success) {
            setResult({
              ...alternativeData,
              alternative_method: true
            })
            
            toast({
              title: "Success",
              description: "Columns added successfully using alternative method",
            })
          }
        } catch (alternativeError) {
          console.error("Alternative method failed:", alternativeError)
        }
      }
    } catch (error) {
      console.error("Error adding columns:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Management</h1>
        <p className="text-muted-foreground">Manage database schema and migrations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add is_edited Columns</CardTitle>
          <CardDescription>
            Add is_edited columns to posts and comments tables to track edited content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This operation will add the following columns if they don't already exist:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><code>is_edited</code> (boolean) to <code>posts</code> table</li>
            <li><code>is_edited</code> (boolean) to <code>comments</code> table</li>
          </ul>
          <p>These columns are needed for tracking when posts and comments have been edited.</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          <Button onClick={handleAddEditedColumns} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding columns...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Add Columns
              </>
            )}
          </Button>
          
          {result && (
            <div className="w-full mt-4 p-4 border rounded-md bg-muted/20">
              <div className="flex items-center mb-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className="font-medium">
                  {result.success ? "Operation successful" : "Operation failed"}
                </span>
              </div>
              <pre className="text-xs mt-2 p-2 bg-muted rounded-md overflow-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 