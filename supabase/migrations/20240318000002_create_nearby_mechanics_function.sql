-- Função para calcular distância entre dois pontos (em km)
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 float,
  lon1 float,
  lat2 float,
  lon2 float
)
RETURNS float
LANGUAGE plpgsql
AS $$
DECLARE
  R float := 6371; -- Raio da Terra em km
  dlat float;
  dlon float;
  a float;
  c float;
BEGIN
  -- Converter graus para radianos
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  -- Fórmula de Haversine
  a := (sin(dlat/2))^2 + cos(radians(lat1)) * cos(radians(lat2)) * (sin(dlon/2))^2;
  c := 2 * asin(sqrt(a));
  
  RETURN R * c;
END;
$$;

-- Função para buscar mecânicos próximos
CREATE OR REPLACE FUNCTION public.get_nearby_mechanics(
  user_latitude float,
  user_longitude float,
  radius_km float DEFAULT 10
)
RETURNS SETOF public.mechanic_stats
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ms.*
  FROM public.mechanic_stats ms
  WHERE 
    ms.latitude IS NOT NULL 
    AND ms.longitude IS NOT NULL
    AND ms.available = true
    AND calculate_distance(
      user_latitude,
      user_longitude,
      ms.latitude,
      ms.longitude
    ) <= radius_km
  ORDER BY 
    calculate_distance(
      user_latitude,
      user_longitude,
      ms.latitude,
      ms.longitude
    ) ASC;
END;
$$; 