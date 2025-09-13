"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

const cities = [
  { id: "pune", name: "Pune", state: "Maharashtra" },
  { id: "indore", name: "Indore", state: "Madhya Pradesh" },
  { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh" },
  { id: "coimbatore", name: "Coimbatore", state: "Tamil Nadu" },
  { id: "kochi", name: "Kochi", state: "Kerala" },
  { id: "nagpur", name: "Nagpur", state: "Maharashtra" },
]

export function CitySelector() {
  const [selectedCity, setSelectedCity] = useState<string>("")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Select Your City
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger>
            <SelectValue placeholder="Choose your city to get started" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}, {city.state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCity && (
          <div className="flex gap-2">
            <Button className="flex-1">View Routes</Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Live Tracking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
