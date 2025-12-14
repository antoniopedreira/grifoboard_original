import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PCPBreakdownCard from "./PCPBreakdownCard";
import { PCPBreakdown } from "@/types";

interface BreakdownWithFilterProps {
  pcpData: PCPBreakdown | null;
  className?: string;
}

const BreakdownWithFilter: React.FC<BreakdownWithFilterProps> = ({ pcpData, className }) => {
  const [filterBy, setFilterBy] = useState<"sector" | "discipline">("sector");

  const getTitle = () => {
    return filterBy === "sector" ? "Detalhamento por Setor" : "Detalhamento por Disciplina";
  };

  const getData = () => {
    if (!pcpData) return {};
    return filterBy === "sector" ? pcpData.bySector : pcpData.byDiscipline;
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-primary font-heading">{getTitle()}</CardTitle>
        <Select value={filterBy} onValueChange={(value: "sector" | "discipline") => setFilterBy(value)}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sector">Por Setor</SelectItem>
            <SelectItem value="discipline">Por Disciplina</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <PCPBreakdownCard title="" data={getData()} />
      </CardContent>
    </Card>
  );
};

export default React.memo(BreakdownWithFilter);
