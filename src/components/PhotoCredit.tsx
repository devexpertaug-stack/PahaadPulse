/** Attribution required by the CC BY 3.0 licence of the background photo. */
export default function PhotoCredit({ className = '' }: { className?: string }) {
  const link =
    'underline decoration-white/20 underline-offset-2 hover:text-white/70';
  return (
    <p className={`text-center text-[11px] text-white/40 ${className}`}>
      Background photo: Calathea orbifolia by{' '}
      <a
        className={link}
        href="https://commons.wikimedia.org/wiki/File:Starr-110215-1133_Calathea_orbifolia-leaves-KiHana_Nursery_Kihei-Maui_(25075687535).jpg"
        target="_blank"
        rel="noreferrer"
      >
        Forest &amp; Kim Starr
      </a>{' '}
      ·{' '}
      <a className={link} href="https://creativecommons.org/licenses/by/3.0/us/" target="_blank" rel="noreferrer">
        CC BY 3.0
      </a>
    </p>
  );
}
