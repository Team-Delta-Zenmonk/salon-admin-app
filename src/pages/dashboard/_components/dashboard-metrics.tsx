import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MetricStat {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
}

interface DashboardMetricsProps {
  stats: MetricStat[];
}


export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ stats }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const primaryStats = stats.slice(0, 3);

  return (
    <>
      <div className="sm:hidden">
        <Card className="border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex w-full items-center justify-between gap-2 p-3.5 text-left cursor-pointer"
          >
            <div className="flex items-center gap-1.5 flex-wrap min-w-0 text-xs">
              <span className="font-bold text-foreground whitespace-nowrap">Overview:</span>
              {primaryStats.map((stat) => (
                <React.Fragment key={stat.title}>
                  <span className="whitespace-nowrap">
                    <span className="text-muted-foreground">{stat.title.split(" ")[0]}: </span>
                    <span className={cn("font-bold", stat.color)}>{stat.value}</span>
                  </span>
                </React.Fragment>
              ))}
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </button>

          <div
            className={cn(
              "grid transition-all duration-200 ease-in-out",
              isExpanded
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="border-t border-border px-3.5 pb-3.5 pt-3 grid grid-cols-2 gap-y-2.5 gap-x-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.title} className="flex items-start gap-2 min-w-0">
                      <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", stat.color)} />
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground leading-tight">{stat.title}</p>
                        <p className="text-sm font-bold text-foreground leading-tight">{stat.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className={`border ${stat.bg}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardDescription className="text-xs font-semibold text-muted-foreground">
                  {stat.title}
                </CardDescription>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-black text-foreground">{stat.value}</div>
                <p className="mt-1 text-[11px] text-muted-foreground font-medium">
                  {stat.subtext}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};
