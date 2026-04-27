"use client";

import React, { useMemo, useState } from "react";

interface CountryFlagProps {
  iso: string;
  emoji?: string;
  countryName?: string;
  className?: string;
}

const CountryFlag: React.FC<CountryFlagProps> = ({
  iso,
  emoji,
  countryName,
  className = "h-4 w-6",
}) => {
  const [hasImageError, setHasImageError] = useState(false);

  const src = useMemo(() => {
    return `https://flagcdn.com/w40/${String(iso || "").toLowerCase()}.png`;
  }, [iso]);

  if (hasImageError) {
    return <span>{emoji || "🏳️"}</span>;
  }

  return (
    <img
      src={src}
      alt={countryName ? `Drapeau ${countryName}` : `Drapeau ${iso}`}
      className={className}
      loading="lazy"
      onError={() => setHasImageError(true)}
    />
  );
};

export default CountryFlag;