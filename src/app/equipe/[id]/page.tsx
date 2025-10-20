import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, Phone, Linkedin, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  return teamData.map((member) => ({
    id: member.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params; // Résoudre la Promise
  const member = teamData.find((m) => m.id === resolvedParams.id) as TeamMember | undefined;

  if (!member) {
    return {
      title: 'Membre non trouvé | Ihambaobab',
    };
  }

  return {
    title: `${member.name} - ${member.role} | Ihambaobab`,
    description: member.description,
    keywords: [member.name, member.role, member.department, 'Ihambaobab', 'équipe', 'Niger'],
    openGraph: {
      title: `${member.name} | Ihambaobab`,
      description: `${member.role} - ${member.description.substring(0, 160)}`,
      type: 'profile',
      images: [member.image],
    },
  };
}

export default async function TeamMemberPage({ params }: PageProps) {
  const resolvedParams = await params;
  const member = teamData.find((m) => m.id === resolvedParams.id) as TeamMember | undefined;

  if (!member) {
    notFound();
  }

  return (
    <>
    <header role="banner">
          <HomeHeader />
        </header>
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <Link href="/equipe">
          <Button variant="ghost" className="mb-8 hover:bg-slate-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'équipe
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-slate-200 shadow-lg">
              <CardContent className="p-0">
                <div className="relative h-96 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden rounded-t-lg">
                  <Image
                    src={member.image}
                    alt={`${member.name} - ${member.role}`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                      {member.name}
                    </h1>
                    <Badge className="mb-4">{member.department}</Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                        <Mail className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-0.5">Email</p>
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {member.email}
                        </p>
                      </div>
                    </a>

                    <a
                      href={`tel:${member.phone}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                        <Phone className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 mb-0.5">Téléphone</p>
                        <p className="text-sm font-medium text-slate-900">
                          {member.phone}
                        </p>
                      </div>
                    </a>

                    <a
                      href={`https://${member.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                        <Linkedin className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-0.5">LinkedIn</p>
                        <p className="text-sm font-medium text-slate-900 truncate">
                          Voir le profil
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card className="border-slate-200 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">
                      Fonction
                    </h2>
                    <p className="text-xl font-semibold text-slate-900">
                      {member.role}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
                    À propos
                  </h2>
                  <p className="text-base leading-relaxed text-slate-700">
                    {member.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-lg bg-gradient-to-br from-slate-50 to-white">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Contribution à Ihambaobab
                </h2>
                <p className="text-slate-700 leading-relaxed mb-6">
                  En tant que {member.role.toLowerCase()}, {member.name.split(' ')[0]} joue un rôle essentiel
                  dans le développement et la croissance d'Ihambaobab. Son expertise et son engagement
                  contribuent quotidiennement à la réalisation de notre vision commune.
                </p>
                <div className="flex gap-3">
                  <Link href="/equipe">
                    <Button variant="outline">
                      Découvrir l'équipe complète
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
