"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type {
  PieSectorShapeProps,
} from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive pie chart showing renters by status"

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
  renters: {
    label: "Jumlah Penyewa",
  },
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

interface ChartPieInteractiveProps {
  pieData?: Array<{
    month: string
    active: number
    returned: number
    overdue: number
    total: number
  }>
}

export function ChartPieInteractive({ pieData = [] }: ChartPieInteractiveProps) {
  const id = "pie-interactive"
  const [activeMonth, setActiveMonth] = React.useState("")
  const [activeSliceIndex, setActiveSliceIndex] = React.useState(0)

  React.useEffect(() => {
    if (pieData.length > 0 && !activeMonth) {
      setActiveMonth(pieData[pieData.length - 1].month)
    }
  }, [pieData, activeMonth])

  const activeMonthRecord = React.useMemo(() => {
    return pieData.find((item) => item.month === activeMonth)
  }, [pieData, activeMonth])

  const activeData = React.useMemo(() => {
    if (!activeMonthRecord) return []
    return [
      { status: "active", count: activeMonthRecord.active, fill: "var(--color-active)" },
      { status: "returned", count: activeMonthRecord.returned, fill: "var(--color-returned)" },
      { status: "overdue", count: activeMonthRecord.overdue, fill: "var(--color-overdue)" },
    ]
  }, [activeMonthRecord])

  const months = React.useMemo(() => pieData.map((item) => item.month), [pieData])

  const renderPieShape = React.useCallback(
    ({ index, outerRadius = 0, ...props }: PieSectorShapeProps) => {
      if (index === activeSliceIndex) {
        return (
          <g>
            <Sector {...props} outerRadius={outerRadius + 10} />
            <Sector
              {...props}
              outerRadius={outerRadius + 25}
              innerRadius={outerRadius + 12}
            />
          </g>
        )
      }

      return <Sector {...props} outerRadius={outerRadius} />
    },
    [activeSliceIndex]
  )

  const handlePieEnter = React.useCallback(
    (_: any, index: number) => {
      setActiveSliceIndex(index)
    },
    [setActiveSliceIndex]
  )

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Status Penyewa</CardTitle>
          <CardDescription>Pembagian penyewa aktif, selesai, dan terlambat</CardDescription>
        </div>
        <Select value={activeMonth} onValueChange={(val) => {
          setActiveMonth(val)
          setActiveSliceIndex(0) // reset active slice index
        }}>
          <SelectTrigger
            className="ml-auto h-7 w-36.5 rounded-lg pl-2.5"
            aria-label="Pilih bulan"
          >
            <SelectValue placeholder="Pilih Bulan" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {months.map((key) => {
              const displayLabel = monthNamesMap[key] || key
              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    {displayLabel}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-75"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={activeData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
              shape={renderPieShape}
              onMouseEnter={handlePieEnter}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const totalRenters = activeMonthRecord ? activeMonthRecord.total : 0
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalRenters.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Penyewa
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
