import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Filter, 
  X, 
  Search, 
  Star, 
  Calendar, 
  Globe, 
  Trophy,
  Sparkles,
  RotateCcw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface League {
  id: string;
  name: string;
  country: string;
}

interface Nationality {
  id: string;
  name: string;
}

interface ModernProductFiltersProps {
  onFiltersChange: (filters: {
    league?: string;
    nationality?: string;
    specialEdition?: boolean;
    season?: string;
    priceRange?: [number, number];
    searchTerm?: string;
  }) => void;
}

export const ModernProductFilters = ({ onFiltersChange }: ModernProductFiltersProps) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedNationality, setSelectedNationality] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [specialEditionOnly, setSpecialEditionOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const seasons = ["2024", "2023", "2022", "2021", "2020"];

  useEffect(() => {
    loadFiltersData();
  }, []);

  useEffect(() => {
    const filters: {
      league?: string;
      nationality?: string;
      season?: string;
      specialEdition?: boolean;
      priceRange?: [number, number];
      searchTerm?: string;
    } = {};
    if (selectedLeague) filters.league = selectedLeague;
    if (selectedNationality) filters.nationality = selectedNationality;
    if (selectedSeason) filters.season = selectedSeason;
    if (specialEditionOnly) filters.specialEdition = true;
    if (priceRange[0] > 0 || priceRange[1] < 1000) filters.priceRange = priceRange;
    if (searchTerm) filters.searchTerm = searchTerm;
    
    onFiltersChange(filters);
  }, [selectedLeague, selectedNationality, selectedSeason, specialEditionOnly, priceRange, searchTerm, onFiltersChange]);

  const loadFiltersData = async () => {
    try {
      const [leaguesResponse, nationalitiesResponse] = await Promise.all([
        supabase.from("leagues").select("*").order("name"),
        supabase.from("nationalities").select("*").order("name")
      ]);

      if (leaguesResponse.data) setLeagues(leaguesResponse.data);
      if (nationalitiesResponse.data) setNationalities(nationalitiesResponse.data);
    } catch (error) {
      console.error("Error loading filters data:", error);
    }
  };

  const clearAllFilters = () => {
    setSelectedLeague(null);
    setSelectedNationality(null);
    setSelectedSeason(null);
    setSpecialEditionOnly(false);
    setPriceRange([0, 1000]);
    setSearchTerm("");
  };

  const hasActiveFilters = selectedLeague || selectedNationality || selectedSeason || 
    specialEditionOnly || priceRange[0] > 0 || priceRange[1] < 1000 || searchTerm;

  const FilterChip = ({ 
    label, 
    isActive, 
    onClick, 
    onRemove, 
    icon: Icon,
    variant = "default" 
  }: {
    label: string;
    isActive: boolean;
    onClick: () => void;
    onRemove?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: "default" | "special";
  }) => (
    <Badge
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-105 px-3 py-2 text-sm font-medium",
        "border-2 hover:shadow-lg",
        isActive
          ? variant === "special"
            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-yellow-400 shadow-lg animate-pulse"
            : "bg-primary text-primary-foreground border-primary shadow-lg"
          : "bg-background hover:bg-accent border-border hover:border-primary/50"
      )}
      onClick={onClick}
    >
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {label}
      {isActive && onRemove && (
        <X 
          className="w-3 h-3 ml-1 hover:scale-125 transition-transform" 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        />
      )}
    </Badge>
  );

  return (
    <Card className="sticky top-2 sm:top-4 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border border-primary/20 shadow-xl">
      <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6 py-3 sm:py-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="hidden sm:inline">Filtros</span>
            <span className="sm:hidden">Filtrar</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 animate-bounce text-xs">
                {[selectedLeague, selectedNationality, selectedSeason, specialEditionOnly, searchTerm].filter(Boolean).length}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-destructive transition-colors px-2 sm:px-3"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="xl:hidden px-2 sm:px-3"
            >
              <Filter className={cn("w-3 h-3 sm:w-4 sm:h-4 transition-transform", isExpanded && "rotate-180")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn(
        "space-y-4 sm:space-y-6 transition-all duration-300 px-3 sm:px-6 pb-3 sm:pb-6",
        !isExpanded && "xl:block hidden"
      )}>
        {/* Search */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <Search className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            Buscar
          </Label>
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
            <Input
              placeholder="Nome, time, descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 border border-border focus:border-primary transition-colors text-sm"
            />
          </div>
        </div>

        {/* Special Edition Toggle */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Edição Especial
          </Label>
          <div className="flex items-center justify-between p-3 rounded-lg border-2 border-border hover:border-primary/50 transition-colors">
            <span className="text-sm">Apenas edições especiais</span>
            <Switch
              checked={specialEditionOnly}
              onCheckedChange={setSpecialEditionOnly}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-400 data-[state=checked]:to-orange-500"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <span>💰</span>
            Faixa de Preço
          </Label>
          <div className="space-y-3">
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>R$ {priceRange[0]}</span>
              <span>R$ {priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Leagues */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Trophy className="w-4 h-4 text-primary" />
            Ligas
          </Label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {leagues.map((league) => (
              <FilterChip
                key={league.id}
                label={`${league.name} (${league.country})`}
                isActive={selectedLeague === league.id}
                onClick={() => setSelectedLeague(selectedLeague === league.id ? null : league.id)}
                onRemove={() => setSelectedLeague(null)}
                icon={Trophy}
              />
            ))}
          </div>
        </div>

        {/* Nationalities */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Globe className="w-4 h-4 text-primary" />
            Nacionalidades
          </Label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {nationalities.map((nationality) => (
              <FilterChip
                key={nationality.id}
                label={nationality.name}
                isActive={selectedNationality === nationality.id}
                onClick={() => setSelectedNationality(selectedNationality === nationality.id ? null : nationality.id)}
                onRemove={() => setSelectedNationality(null)}
                icon={Globe}
              />
            ))}
          </div>
        </div>

        {/* Seasons */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="w-4 h-4 text-primary" />
            Temporadas
          </Label>
          <div className="flex flex-wrap gap-2">
            {seasons.map((season) => (
              <FilterChip
                key={season}
                label={season}
                isActive={selectedSeason === season}
                onClick={() => setSelectedSeason(selectedSeason === season ? null : season)}
                onRemove={() => setSelectedSeason(null)}
                icon={Calendar}
              />
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Filtros Ativos</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-destructive hover:text-destructive/80"
              >
                Limpar Todos
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedLeague && (
                <FilterChip
                  label={leagues.find(l => l.id === selectedLeague)?.name || "Liga"}
                  isActive={true}
                  onClick={() => {}}
                  onRemove={() => setSelectedLeague(null)}
                />
              )}
              
              {selectedNationality && (
                <FilterChip
                  label={nationalities.find(n => n.id === selectedNationality)?.name || "País"}
                  isActive={true}
                  onClick={() => {}}
                  onRemove={() => setSelectedNationality(null)}
                />
              )}
              
              {selectedSeason && (
                <FilterChip
                  label={selectedSeason}
                  isActive={true}
                  onClick={() => {}}
                  onRemove={() => setSelectedSeason(null)}
                />
              )}
              
              {specialEditionOnly && (
                <FilterChip
                  label="Edição Especial"
                  isActive={true}
                  onClick={() => {}}
                  onRemove={() => setSpecialEditionOnly(false)}
                  variant="special"
                  icon={Sparkles}
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};