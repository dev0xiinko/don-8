"use client"

import React from "react"
import { Line, Bar, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from "chart.js"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// Sample data for donation trends
const donationTrendData = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      label: "Donations ($)",
      data: [
        12500, 15000, 10000, 22000, 18000, 25000, 20000, 26000, 22000, 30000,
        28000, 35000,
      ],
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgba(59, 130, 246, 0.5)",
      tension: 0.3,
    },
  ],
}

// Sample data for donor growth
const donorGrowthData = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      label: "New Donors",
      data: [50, 75, 60, 120, 80, 100, 90, 130, 110, 150, 140, 170],
      borderColor: "rgb(34, 197, 94)",
      backgroundColor: "rgba(34, 197, 94, 0.5)",
      tension: 0.3,
    },
  ],
}

// Sample data for campaign performance
const campaignPerformanceData = {
  labels: [
    "Education",
    "Healthcare",
    "Disaster Relief",
    "Environment",
    "Poverty",
    "Animal Welfare",
  ],
  datasets: [
    {
      label: "Amount Raised ($)",
      data: [25000, 35000, 45000, 20000, 30000, 15000],
      backgroundColor: [
        "rgba(255, 99, 132, 0.6)",
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 206, 86, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(153, 102, 255, 0.6)",
        "rgba(255, 159, 64, 0.6)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
}

// Sample data for donation sources
const donationSourcesData = {
  labels: ["Individual", "Corporate", "Foundation", "Events", "Other"],
  datasets: [
    {
      label: "Donation Sources",
      data: [65, 15, 10, 8, 2],
      backgroundColor: [
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 99, 132, 0.6)",
        "rgba(255, 206, 86, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(153, 102, 255, 0.6)",
      ],
      borderColor: [
        "rgba(54, 162, 235, 1)",
        "rgba(255, 99, 132, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
      ],
      borderWidth: 1,
    },
  ],
}

// Chart options
const lineOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}

const barOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}

const pieOptions: ChartOptions<"pie"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
    },
  },
}

// Chart components
export function DonationTrendChart() {
  return (
    <div className="h-full w-full">
      <Line data={donationTrendData} options={lineOptions} />
    </div>
  )
}

export function DonorGrowthChart() {
  return (
    <div className="h-full w-full">
      <Line data={donorGrowthData} options={lineOptions} />
    </div>
  )
}

export function CampaignPerformanceChart() {
  return (
    <div className="h-full w-full">
      <Bar data={campaignPerformanceData} options={barOptions} />
    </div>
  )
}

export function DonationSourcesChart() {
  return (
    <div className="h-full w-full">
      <Pie data={donationSourcesData} options={pieOptions} />
    </div>
  )
}

export function DonationByCampaignChart() {
  return (
    <div className="h-full w-full">
      <Bar data={campaignPerformanceData} options={barOptions} />
    </div>
  )
}

export function DonorDemographicsChart() {
  const data = {
    labels: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
    datasets: [
      {
        label: "Donors by Age Group",
        data: [15, 25, 20, 18, 12, 10],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="h-full w-full">
      <Pie data={data} options={pieOptions} />
    </div>
  )
}

export function AnonymousVsNonAnonymousDonorsChart() {
  const data = {
    labels: ["Anonymous (35%)", "Non-Anonymous (65%)"],
    datasets: [
      {
        label: "Donor Anonymity",
        data: [35, 65],
        backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(75, 192, 192, 0.6)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(75, 192, 192, 1)"],
        borderWidth: 1,
      },
    ],
  }

  const customPieOptions: ChartOptions<"pie"> = {
    ...pieOptions,
    plugins: {
      ...pieOptions.plugins,
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"pie">) {
            const label = context.label || ""
            const value = (context.raw as number) || 0
            return `${label}: ${value}%`
          },
        },
      },
    },
  }

  return (
    <div className="h-full w-full">
      <h3 className="text-center font-medium mb-2">
        Anonymous vs. Non-Anonymous Donations
      </h3>
      <Pie data={data} options={customPieOptions} />
    </div>
  )
}

export function DonorRetentionChart() {
  const data = {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [
      {
        label: "New Donors",
        data: [120, 150, 180, 210],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Returning Donors",
        data: [80, 100, 130, 160],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="h-full w-full">
      <Bar data={data} options={barOptions} />
    </div>
  )
}

export function CampaignTimelineChart() {
  const data = {
    labels: [
      "Week 1",
      "Week 2",
      "Week 3",
      "Week 4",
      "Week 5",
      "Week 6",
      "Week 7",
      "Week 8",
    ],
    datasets: [
      {
        label: "Campaign Progress (%)",
        data: [10, 25, 40, 55, 70, 80, 90, 100],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.3,
      },
    ],
  }

  return (
    <div className="h-full w-full">
      <Line data={data} options={lineOptions} />
    </div>
  )
}

export function CampaignCategoriesChart() {
  const data = {
    labels: ["Education", "Healthcare", "Disaster Relief", "Environment", "Poverty"],
    datasets: [
      {
        label: "Number of Campaigns",
        data: [12, 19, 8, 15, 10],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="h-full w-full">
      <Pie data={data} options={pieOptions} />
    </div>
  )
}
