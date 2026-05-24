"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A multiple bar chart showing rental status history"

const monthNamesMap: Record<string, string> = {
  january: "Januari",
  february: "Februari",
  march: "Maret",
  april: "April",
  may: "Mei",
  june: "Juni",
  july: "Juli",
  august: "Agustus",
  september: "September",
  october: "Oktober",
  november: "November",
  december: "Desember",
}

const chartConfig = {
  active: {
    label: "Aktif",
    color: "hsl(217.2 91.2% 59.8%)", // Vibrant Royal Blue
  },
  returned: {
    label: "Selesai",
    color: "hsl(142.1 76.2% 36.3%)", // Vibrant Emerald Green
  },
  overdue: {
    label: "Terlambat",
    color: "hsl(0 84.2% 60.2%)", // Vibrant Red
  },
} satisfies ChartConfig

interface ChartBarMultipleProps {
  pieData?: Array<{
    month: string
    active: number
    returned: number
    overdue: number
    total: number
  }>
}

export function ChartBarMultiple({ pieData = [] }: ChartBarMultipleProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Histori Status Penyewa</CardTitle>
        <CardDescription>Visualisasi jumlah penyewa selama 6 bulan terakhir</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
          <BarChart accessibilityLayer data={pieData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => monthNamesMap[value]?.slice(0, 3) || value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="active" fill="var(--color-active)" radius={4} />
            <Bar dataKey="returned" fill="var(--color-returned)" radius={4} />
            <Bar dataKey="overdue" fill="var(--color-overdue)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 pt-4 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Akumulasi status penyewaan bulanan <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Menampilkan tren data penyewa untuk 6 bulan terakhir
        </div>
      </CardFooter>
    </Card>
  )
}
