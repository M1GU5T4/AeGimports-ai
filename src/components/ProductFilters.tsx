import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface League {
  id: string;
  name: string;
  country: string;
}

interface Nationality {
  id: string;
  name: string;
}

interface Size {
  id: string;
  name: string;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: {
    league?: string;
    nationality?: string;
    size?: string;
    specialEdition?: boolean;
    season?: string;
  }) => void;
}

export const ProductFilters = ({ onFiltersChange }: ProductFiltersProps) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [selectedNationality, setSelectedNationality] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [specialEditionOnly, setSpecialEditionOnly] = useState(false);

  useEffect(() => {
    loadFiltersData();
  }, []);

  useEffect(() => {
    onFiltersChange({
      league: selectedLeague === "all" ? undefined : selectedLeague,
      nationality: selectedNationality === "all" ? undefined : selectedNationality,
      size: selectedSize === "all" ? undefined : selectedSize,
      specialEdition: specialEditionOnly || undefined,
      season: selectedSeason === "all" ? undefined : selectedSeason,
    });
  }, [selectedLeague, selectedNationality, selectedSize, specialEditionOnly, selectedSeason, onFiltersChange]);

  const loadFiltersData = async () => {
    try {
      const [leaguesResponse, nationalitiesResponse, sizesResponse] = await Promise.all([
        supabase.from("leagues").select("*").order("name"),
        supabase.from("nationalities").select("*").order("name"),
        supabase.from("sizes").select("*").order("sort_order"),
      ]);

      if (leaguesResponse.data) setLeagues(leaguesResponse.data);
      if (nationalitiesResponse.data) setNationalities(nationalitiesResponse.data);
      if (sizesResponse.data) setSizes(sizesResponse.data);
    } catch (error) {
      console.error("Error loading filter data:", error);
    }
  };

  const clearFilters = () => {
    setSelectedLeague("all");
    setSelectedNationality("all");
    setSelectedSize("all");
    setSelectedSeason("all");
    setSpecialEditionOnly(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Liga</Label>
          <Select value={selectedLeague} onValueChange={setSelectedLeague}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as ligas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ligas</SelectItem>
              {leagues.map((league) => (
                <SelectItem key={league.id} value={league.id}>
                  {league.name} ({league.country})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Nacionalidade</Label>
          <Select value={selectedNationality} onValueChange={setSelectedNationality}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as nacionalidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as nacionalidades</SelectItem>
              {nationalities.map((nationality) => (
                <SelectItem key={nationality.id} value={nationality.id}>
                  {nationality.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tamanho</Label>
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tamanhos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tamanhos</SelectItem>
              {sizes.map((size) => (
                <SelectItem key={size.id} value={size.id}>
                  {size.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Temporada</Label>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as temporadas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as temporadas</SelectItem>
              <SelectItem value="2024/25">2024/25</SelectItem>
              <SelectItem value="2023/24">2023/24</SelectItem>
              <SelectItem value="2022/23">2022/23</SelectItem>
              <SelectItem value="2021/22">2021/22</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="special-edition"
            checked={specialEditionOnly}
            onCheckedChange={(checked) => setSpecialEditionOnly(checked as boolean)}
          />
          <Label htmlFor="special-edition" className="text-sm">
            Apenas edições especiais
          </Label>
        </div>

        <button
          onClick={clearFilters}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Limpar filtros
        </button>
      </CardContent>
    </Card>
  );
};