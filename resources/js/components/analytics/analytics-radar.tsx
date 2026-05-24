"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

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

export const description = "A radar chart with dots"

interface RadarDataItem {
  category: string
  rentals: number
}

interface AnalyticsRadarProps {
  radarData: RadarDataItem[]
}

const chartConfig = {
  rentals: {
    label: "Peralatan Disewa",
    color: "hsl(262.1 83.3% 57.8%)", // Vibrant Violet/Indigo
  },
} satisfies ChartConfig

export function AnalyticsRadar({ radarData }: AnalyticsRadarProps) {
  // Find the highest rented category for the footer trend insights
  const maxRented = React.useMemo(() => {
    if (!radarData || radarData.length === 0) return null
    return [...radarData].sort((a, b) => b.rentals - a.rentals)[0]
  }, [radarData])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center">
        <CardTitle>Popularitas Kategori</CardTitle>
        <CardDescription>
          Jumlah peralatan yang disewa per kategori produk
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-62.5"
        >
          <RadarChart data={radarData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="category" />
            <PolarGrid />
            <Radar
              dataKey="rentals"
              fill="var(--color-rentals)"
              fillOpacity={0.3}
              stroke="var(--color-rentals)"
              strokeWidth={2}
              dot={{
                r: 4,
                fillOpacity: 1,
                stroke: "var(--color-rentals)",
                strokeWidth: 2,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-4 text-sm">
        {maxRented && maxRented.rentals > 0 ? (
          <div className="flex items-center gap-2 leading-none font-medium">
            Kategori {maxRented.category} paling populer ({maxRented.rentals} disewa){" "}
            <TrendingUp className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex items-center gap-2 leading-none font-medium">
            Belum ada peralatan yang disewa <TrendingUp className="h-4 w-4" />
          </div>
        )}
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          Statistik langsung dari database aktif
        </div>
      </CardFooter>
    </Card>
  )
}
