import { ArrowRight, Calendar, MessageSquare, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,168,168,0.2),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(245,166,35,0.16),_transparent_20%),linear-gradient(180deg,_#f4f8fb_0%,_#fbfcfe_55%,_#eef6f2_100%)]">
      <nav className="border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10233F_0%,#0EA8A8_100%)] shadow-lg">
              <span className="text-xl font-bold text-white">C</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#10233F]">ClubConnect</h2>
              <p className="text-xs text-slate-500">Plateforme clubs et vie associative</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Se connecter</Link>
            </Button>
            <Button className="bg-[#0EA8A8] hover:bg-[#0c8e8e]" asChild>
              <Link to="/signup">S'inscrire</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
        <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm text-[#10233F] shadow-sm">
              <Sparkles className="h-4 w-4 text-[#0EA8A8]" />
              Pensé pour les clubs de la Faculté des Sciences de Tunis
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-tight text-[#10233F] lg:text-6xl">
              Une plateforme vivante pour organiser, animer et faire grandir vos clubs.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Gérez les adhésions, la communication et le suivi des activités dans une expérience plus moderne, plus lisible et mieux adaptée aux clubs de la Faculté des Sciences de Tunis.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="rounded-2xl bg-[linear-gradient(135deg,#10233F_0%,#0EA8A8_100%)] px-7 hover:opacity-95" asChild>
                <Link to="/signup">
                  Commencer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-2xl border-slate-300 bg-white/70 px-7" asChild>
                <Link to="/login">Se connecter</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 hidden h-28 w-28 rounded-full bg-[#0EA8A8]/15 blur-2xl lg:block" />
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_28px_90px_rgba(15,23,42,0.14)] backdrop-blur">
              <div className="rounded-[1.5rem] bg-[linear-gradient(160deg,#10233F_0%,#15365d_45%,#0EA8A8_100%)] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Espace coordination</p>
                    <p className="mt-1 text-2xl font-semibold">Clubs de la FST</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 px-3 py-2 text-sm">Faculté des Sciences de Tunis</div>
                </div>
                <p className="mt-6 max-w-xl text-sm leading-7 text-white/80">
                  Une plateforme unifiée pour les clubs de la FST, avec un accès centralisé aux profils, aux activités et aux espaces de communication.
                </p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Users, title: "Clubs", text: "Gestion des membres, staffs et présidents." },
                  { icon: Calendar, title: "Événements", text: "Demandes, approbations et suivi terrain." },
                  { icon: MessageSquare, title: "Communication", text: "Forums et canaux pour mobiliser les jeunes." },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0EA8A8]/10 text-[#0EA8A8]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-[#10233F]">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: "Gestion club par club",
              text: "Structure claire des rôles, validation des membres et meilleur suivi de chaque équipe.",
            },
            {
              icon: Calendar,
              title: "Événements plus fluides",
              text: "Demandes, calendrier et ressources dans un tableau de bord plus lisible pour les jeunes organisateurs.",
            },
            {
              icon: ShieldCheck,
              title: "Administration plus fiable",
              text: "Connexion, session et navigation admin harmonisées avec le vrai compte authentifié.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[1.75rem] border border-white/70 bg-white/75 p-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0EA8A8]/12 text-[#0EA8A8]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#10233F]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
            </div>
          ))}
        </section>

        <div className="mt-16 rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#10233F_0%,#0EA8A8_100%)] p-8 text-center text-white shadow-[0_24px_70px_rgba(16,35,63,0.24)]">
          <h2 className="text-3xl font-bold">Un hub plus motivé pour la vie associative.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/80">
            Conçu pour les clubs de la Faculté des Sciences de Tunis, avec une interface plus simple et plus adaptée au cadre facultaire.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button size="lg" className="rounded-2xl bg-white text-[#10233F] hover:bg-slate-100" asChild>
              <Link to="/signup">Créer un compte</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-2xl border-white/40 bg-transparent text-white hover:bg-white/10" asChild>
              <Link to="/login">Se connecter</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}