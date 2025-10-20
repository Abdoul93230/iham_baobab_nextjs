import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, Linkedin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Metadata } from 'next';
import teamData from '@/datas/team.json';
import HomeHeader from '@/components/home/HomeHeader';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  linkedin: string;
  description: string;
  image: string;
  department: string;
}

export const metadata: Metadata = {
  title: 'Notre Équipe | Ihambaobab',
  description: 'Découvrez l\'équipe fondatrice d\'Ihambaobab : des professionnels passionnés dédiés à l\'innovation et au développement de solutions numériques en Afrique.',
  keywords: ['Ihambaobab', 'équipe', 'fondateurs', 'Niger', 'technologie', 'innovation', 'startup africaine'],
  openGraph: {
    title: 'Notre Équipe Fondatrice | Ihambaobab',
    description: 'Rencontrez les talents qui donnent vie à Ihambaobab',
    type: 'website',
  },
};

export default function EquipePage() {
  const team: TeamMember[] = teamData;

  return (
    <>
    <header role="banner">
          <HomeHeader />
        </header>
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Notre Équipe Fondatrice
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Découvrez les talents qui donnent vie à Ihambaobab
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {team.map((member) => (
            <Link key={member.id} href={`/equipe/${member.id}`}>
              <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer h-full border-slate-200 hover:border-slate-300 overflow-hidden">
                <div className="relative h-80 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={`${member.name} - ${member.role}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur">
                      {member.department}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-slate-600 mb-4 min-h-[3rem]">
                    {member.role}
                  </p>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{member.phone}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                      Voir le profil complet →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
