"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Download } from "lucide-react"

export default function NGOReports() {
  // Mock reports data
  const reports = [
    {
      id: 1,
      title: "Q2 2023 Financial Report",
      description: "Detailed breakdown of donations and expenditures",
      status: "Verified",
      date: "June 30, 2023",
      type: "Financial",
      fileUrl: "/reports/Q2_2023_Financial_Report.pdf",
    },
    {
      id: 2,
      title: "Annual Impact Assessment",
      description: "Comprehensive analysis of program outcomes and beneficiary feedback",
      status: "Verified",
      date: "December 15, 2022",
      type: "Impact",
      fileUrl: "/reports/Annual_Impact_Assessment_2022.pdf",
    },
    {
      id: 3,
      title: "Rural Education Initiative Results",
      description: "Metrics and testimonials from our flagship program",
      status: "Pending",
      date: "August 10, 2023",
      type: "Program",
      fileUrl: "",
    },
  ]
  
  // Function to handle report download
  const handleDownload = (report) => {
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = report.fileUrl;
    link.download = report.title.replace(/\s+/g, '_') + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Impact Reports</h1>
        <Button onClick={() => {
          alert("Upload new report functionality triggered");
          // In a real app, this would open a file picker dialog
          // const input = document.createElement('input');
          // input.type = 'file';
          // input.onchange = (e) => { /* Handle file upload */ };
          // input.click();
        }}>
          <Upload className="mr-2 h-4 w-4" />
          Upload New Report
        </Button>
      </div>
      
      <div className="grid gap-6">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </div>
              <Badge className={report.status === "Verified" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
                {report.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Date</div>
                  <div className="text-md font-medium">{report.date}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Type</div>
                  <div className="text-md font-medium">{report.type}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className="text-md font-medium">{report.status}</div>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                {report.status === "Verified" ? (
                  <Button variant="outline" onClick={() => handleDownload(report)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => alert(`Editing ${report.title}`)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}