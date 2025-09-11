"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Calendar, ArrowRight, Bell } from "lucide-react"
import type { Route, RouteSchedule } from "@/lib/route-data"

interface RouteScheduleProps {
  route: Route
}

export function RouteScheduleComponent({ route }: RouteScheduleProps) {
  const [selectedDirection, setSelectedDirection] = useState<"forward" | "backward">("forward")

  const generateTimeSlots = (schedule: RouteSchedule) => {
    const slots = []
    const start = new Date(`2024-01-01 ${schedule.departureTime}`)
    const end = new Date(`2024-01-01 ${route.operatingHours.end}`)

    const current = new Date(start)
    while (current <= end) {
      slots.push(
        current.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      )
      current.setMinutes(current.getMinutes() + schedule.frequency)
    }

    return slots
  }

  const getCurrentTimeSlot = (timeSlots: string[]) => {
    const now = new Date()
    const currentTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

    return timeSlots.findIndex((slot) => slot > currentTime)
  }

  const forwardSchedule = route.schedules.find((s) => s.direction === "forward")
  const backwardSchedule = route.schedules.find((s) => s.direction === "backward")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Schedule & Timings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedDirection} onValueChange={(value) => setSelectedDirection(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="forward" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Forward
            </TabsTrigger>
            <TabsTrigger value="backward" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Return
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forward" className="space-y-4">
            {forwardSchedule ? (
              <ScheduleContent
                schedule={forwardSchedule}
                route={route}
                generateTimeSlots={generateTimeSlots}
                getCurrentTimeSlot={getCurrentTimeSlot}
              />
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No forward schedule available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="backward" className="space-y-4">
            {backwardSchedule ? (
              <ScheduleContent
                schedule={backwardSchedule}
                route={route}
                generateTimeSlots={generateTimeSlots}
                getCurrentTimeSlot={getCurrentTimeSlot}
              />
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No return schedule available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function ScheduleContent({
  schedule,
  route,
  generateTimeSlots,
  getCurrentTimeSlot,
}: {
  schedule: RouteSchedule
  route: Route
  generateTimeSlots: (schedule: RouteSchedule) => string[]
  getCurrentTimeSlot: (timeSlots: string[]) => number
}) {
  const timeSlots = generateTimeSlots(schedule)
  const currentSlotIndex = getCurrentTimeSlot(timeSlots)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">First Bus:</span>
          <div className="font-medium">{schedule.departureTime}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Last Bus:</span>
          <div className="font-medium">{route.operatingHours.end}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Frequency:</span>
          <div className="font-medium">Every {schedule.frequency} minutes</div>
        </div>
        <div>
          <span className="text-muted-foreground">Duration:</span>
          <div className="font-medium">{route.estimatedDuration} minutes</div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Operating Days
        </h4>
        <div className="flex flex-wrap gap-2">
          {schedule.operatingDays.map((day) => (
            <Badge key={day} variant="outline" className="text-xs capitalize">
              {day}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Today's Departures</h4>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
          {timeSlots.map((time, index) => (
            <div
              key={index}
              className={`p-2 text-center text-xs rounded border ${
                index === currentSlotIndex
                  ? "bg-primary text-primary-foreground border-primary"
                  : index < currentSlotIndex
                    ? "bg-muted text-muted-foreground border-muted"
                    : "bg-background border-border hover:bg-muted/50"
              }`}
            >
              {time}
            </div>
          ))}
        </div>

        {currentSlotIndex >= 0 && currentSlotIndex < timeSlots.length && (
          <div className="mt-3 p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Next Departure</p>
                <p className="text-lg font-bold text-primary">{timeSlots[currentSlotIndex]}</p>
              </div>
              <Button size="sm">
                <Bell className="h-4 w-4 mr-1" />
                Set Alert
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
