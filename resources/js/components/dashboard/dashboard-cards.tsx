"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/format"

interface StatItem {
  value: number
  growth: number
  trend: "up" | "down"
  label: string
}

interface DashboardCardsProps {
  stats: {
    total_revenue: StatItem
    total_customers: StatItem
    active_rentals: StatItem
    items_rented: StatItem
  }
}

export function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Total Revenue */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats.total_revenue.value)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.total_revenue.trend === "up" ? (
                <TrendingUpIcon className="mr-1 size-3 text-emerald-500" />
              ) : (
                <TrendingDownIcon className="mr-1 size-3 text-rose-500" />
              )}
              {stats.total_revenue.label}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.total_revenue.trend === "up" ? (
              <>
                Trending up this month{" "}
                <TrendingUpIcon className="size-4 text-emerald-500" />
              </>
            ) : (
              <>
                Trending down this month{" "}
                <TrendingDownIcon className="size-4 text-rose-500" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Revenue compared to last month
          </div>
        </CardFooter>
      </Card>

      {/* Total Customers */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(stats.total_customers.value) || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.total_customers.trend === "up" ? (
                <TrendingUpIcon className="mr-1 size-3 text-emerald-500" />
              ) : (
                <TrendingDownIcon className="mr-1 size-3 text-rose-500" />
              )}
              {stats.total_customers.label}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.total_customers.trend === "up" ? (
              <>
                New signups growing{" "}
                <TrendingUpIcon className="size-4 text-emerald-500" />
              </>
            ) : (
              <>
                New signups slowing{" "}
                <TrendingDownIcon className="size-4 text-rose-500" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Customers acquisition trend
          </div>
        </CardFooter>
      </Card>

      {/* Active Rentals */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Rentals</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(stats.active_rentals.value) || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.active_rentals.trend === "up" ? (
                <TrendingUpIcon className="mr-1 size-3 text-emerald-500" />
              ) : (
                <TrendingDownIcon className="mr-1 size-3 text-rose-500" />
              )}
              {stats.active_rentals.label}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.active_rentals.trend === "up" ? (
              <>
                Strong rental activity{" "}
                <TrendingUpIcon className="size-4 text-emerald-500" />
              </>
            ) : (
              <>
                Lower rental activity{" "}
                <TrendingDownIcon className="size-4 text-rose-500" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Current active rentals in progress
          </div>
        </CardFooter>
      </Card>

      {/* Items Rented */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Items Rented</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(stats.items_rented.value) || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.items_rented.trend === "up" ? (
                <TrendingUpIcon className="mr-1 size-3 text-emerald-500" />
              ) : (
                <TrendingDownIcon className="mr-1 size-3 text-rose-500" />
              )}
              {stats.items_rented.label}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.items_rented.trend === "up" ? (
              <>
                Steady inventory flow{" "}
                <TrendingUpIcon className="size-4 text-emerald-500" />
              </>
            ) : (
              <>
                Slower inventory turnover{" "}
                <TrendingDownIcon className="size-4 text-rose-500" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            All-time quantity of items rented
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
