export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Si l'image est déjà de Cloudinary, utiliser leurs transformations
  if (src.includes('res.cloudinary.com')) {
    const params = [`w_${width}`, `q_${quality || 75}`, 'f_auto'];
    
    // Insérer les paramètres de transformation dans l'URL Cloudinary
    const uploadIndex = src.indexOf('/upload/') + 8;
    return `${src.slice(0, uploadIndex)}${params.join(',')}/${src.slice(uploadIndex)}`;
  }
  
  // Pour les images locales, utiliser l'optimisation Next.js par défaut
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: (quality || 75).toString(),
  });
  
  return `/_next/image?${params.toString()}`;
}
