import React from 'react';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { TALENT_PROFILE } from '../data/seedData';
import { MediaFrame } from '../components/common/MediaFrame';

export const ProfileView: React.FC = () => {
  const { products, campaigns, metrics, setActiveSection } = useCommerce();

  const photos = [
    {
      src: TALENT_PROFILE.primaryPortrait,
      title: 'Singapore IRL Tour — Portrait Frame 01',
      credit: TALENT_PROFILE.primaryPortraitCredit,
    },
    {
      src: TALENT_PROFILE.secondaryPortrait,
      title: 'Singapore IRL Tour — Appearance Frame 03',
      credit: TALENT_PROFILE.secondaryPortraitCredit,
    },
    {
      src: TALENT_PROFILE.arenaPhoto,
      title: 'Live Stadium / Arena Appearance (RR25)',
      credit: TALENT_PROFILE.arenaPhotoCredit,
    },
    {
      src: TALENT_PROFILE.archivalPhoto,
      title: 'Early Creator Appearance (Nov 2021)',
      credit: TALENT_PROFILE.archivalPhotoCredit,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Talent Header Card */}
      <section className="bg-white border border-zinc-200 rounded-md p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-4">
            <MediaFrame
              src={TALENT_PROFILE.primaryPortrait}
              alt="Darren Watkins Jr. (iShowSpeed)"
              aspectClass="aspect-[3/4]"
              imgClassName="object-cover object-top"
              caption={TALENT_PROFILE.primaryPortraitCredit}
              className="rounded"
            />
          </div>
          <div className="lg:col-span-8 flex flex-col justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mb-2">
                <span className="font-medium text-[#BC1F2F]">Single-Talent Workspace Focus</span>
                <span aria-hidden="true">·</span>
                <span>{TALENT_PROFILE.representation}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                {TALENT_PROFILE.stageName}
              </h1>
              <p className="text-sm font-medium text-zinc-600 mt-1">
                Legal Name: {TALENT_PROFILE.legalName}
              </p>
              <p className="text-sm text-zinc-600 mt-4 leading-relaxed max-w-3xl">
                {TALENT_PROFILE.summary}
              </p>

              {/* Public Domain Autograph Specimen & Operational Context */}
              <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-[11px] font-medium text-zinc-500 mb-1.5">
                    Talent Signature Reference (Public Domain)
                  </p>
                  <div className="bg-zinc-50 border border-zinc-200 rounded px-4 py-2 inline-flex items-center">
                    <img
                      src={TALENT_PROFILE.signatureSvg}
                      alt="iShowSpeed signature specimen"
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                </div>
                <div className="text-xs text-zinc-500 space-y-1">
                  <p>
                    <strong className="text-zinc-700 font-medium">Operational Layer:</strong>{' '}
                    {TALENT_PROFILE.operatingPartner}
                  </p>
                  <p>
                    <strong className="text-zinc-700 font-medium">Proposed Programme Scope:</strong>{' '}
                    {products.length} UK wholesale SKUs · {campaigns.length} Amazon UK campaigns
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
              <div>
                <p className="text-xs text-zinc-500">Proposed UK SKUs</p>
                <p className="font-mono-tabular text-xl font-semibold text-zinc-900 mt-0.5">
                  {metrics.activeProductConcepts}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Amazon UK Wholesale Model</p>
                <p className="font-mono-tabular text-xl font-semibold text-zinc-900 mt-0.5">
                  £{metrics.demonstrationRevenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Illustrative Royalty Model</p>
                <p className="font-mono-tabular text-xl font-semibold text-[#BC1F2F] mt-0.5">
                  £{metrics.estimatedTalentRoyalties.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Pillars */}
      <section className="bg-white border border-zinc-200 rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Proposed Commercial & Merchandise Pillars
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Strategic product territories structured for CAA & Mercenta evaluation
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveSection('concepts')}
            className="text-xs font-medium text-[#BC1F2F] hover:underline inline-flex items-center gap-1"
          >
            <span>Explore Product Concepts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {TALENT_PROFILE.creativePillars.map((pillar, idx) => (
            <div key={pillar.title} className="border-t border-zinc-200 pt-4">
              <p className="font-mono-tabular text-xs text-[#BC1F2F] font-medium mb-1">
                0{idx + 1}.
              </p>
              <h3 className="text-sm font-semibold text-zinc-900">{pillar.title}</h3>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Talent Photography Gallery */}
      <section className="bg-white border border-zinc-200 rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Licensed Reference Photography (Wikimedia Commons)
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Genuine photographs of Darren Watkins Jr. with Creative Commons attribution; commercial print clearances required prior to any live production
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveSection('assets')}
            className="text-xs font-medium text-[#BC1F2F] hover:underline inline-flex items-center gap-1"
          >
            <span>Open Asset Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.src} className="border border-zinc-200 rounded overflow-hidden">
              <MediaFrame
                src={photo.src}
                alt={photo.title}
                aspectClass="aspect-[3/4]"
                imgClassName="object-cover object-top"
              />
              <div className="p-3 bg-white">
                <p className="text-xs font-medium text-zinc-900">{photo.title}</p>
                <p className="text-[11px] text-zinc-500 mt-1">{photo.credit}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Proof-of-Concept Guardrails */}
      <section className="bg-zinc-50 border border-zinc-200 rounded-md p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#BC1F2F] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Demonstration Scope & Commercial Honesty Guardrails
            </h2>
            <ul className="mt-2 space-y-1.5 text-xs text-zinc-600 list-disc pl-4">
              {TALENT_PROFILE.guardrails.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
