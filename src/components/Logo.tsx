import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  onClick?: () => void;
}

export const Logo = ({ className = "", width = 120, height = 120, alt = "A&G Imports Logo", onClick }: LogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string>("https://bhhifpcihjpjfmhgxlmz.supabase.co/storage/v1/object/public/product-images/logo/Captura%20de%20tela%202025-08-17%20194111-Photoroom.png");
  const [storeName, setStoreName] = useState<string>("A&G Imports");
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('key, value')
          .in('key', ['logo_url', 'store_name'])
          .eq('is_active', true);

        if (error) {
          console.warn('Tabela store_settings não encontrada, usando valores padrão');
        } else if (data && data.length > 0) {
          const logoSetting = data.find(item => item.key === 'logo_url');
          const nameSetting = data.find(item => item.key === 'store_name');
          
          if (logoSetting?.value) {
            setLogoUrl(logoSetting.value);
          }
          
          if (nameSetting?.value) {
            setStoreName(nameSetting.value);
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar configurações, usando padrão:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, []);

  if (loading) {
    return (
      <div 
        className={`animate-pulse bg-gray-200 rounded ${className}`}
        style={{ width, height }}
      />
    );
  }

  if (imageError) {
    // Fallback para texto apenas quando há erro no carregamento
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-black font-bold rounded-lg ${className}`}
        style={{ width, height }}
        onClick={onClick}
      >
        <span className="text-lg">{storeName}</span>
      </div>
    );
  }

  console.log('Logo component render:', { logoUrl, imageError, loading });

  return (
    <img
      src={logoUrl}
      alt={alt}
      width={width}
      height={height}
      className={`object-contain ${className}`}
      onClick={onClick}
      onLoad={() => {
        console.log('Logo carregada com sucesso:', logoUrl);
      }}
      onError={(e) => {
        console.error('Erro ao carregar imagem da logo:', e, 'URL:', logoUrl);
        setImageError(true);
      }}
    />
  );
};