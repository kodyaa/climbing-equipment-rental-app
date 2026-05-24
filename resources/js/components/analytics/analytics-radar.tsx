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
    label: "Items Rented",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function AnalyticsRadar({ radarData }: AnalyticsRadarProps) {
  // Find the highest rented category for the footer trend insights
  const maxRented = React.useMemo(() => {
    if (!radarData || radarData.length === 0) return null
    return [...radarData].sort((a, b) => b.rentals - a.rentals)[0]
  }, [radarData])

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Popularity by Category</CardTitle>
        <CardDescription>
          Showing total equipment items rented per category
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
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
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {maxRented && maxRented.rentals > 0 ? (
          <div className="flex items-center gap-2 leading-none font-medium">
            {maxRented.category} is the most popular ({maxRented.rentals} rented){" "}
            <TrendingUp className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex items-center gap-2 leading-none font-medium">
            No equipment rented yet <TrendingUp className="h-4 w-4" />
          </div>
        )}
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          Live statistics from active database records
        </div>
      </CardFooter>
    </Card>
  )
}
