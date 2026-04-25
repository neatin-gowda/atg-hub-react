import { useEffect, useRef, useState } from 'react';

const SLIDES = [
  { tag: 'Technology', title: 'Microsoft 365 Copilot — Now Available for All', sub: 'Every employee now has access across Word, Excel, PowerPoint, Outlook & Teams.', img: '/assets/images/hero/carousel-1-copilot.jpg' },
  { tag: 'Preview', title: 'M365 Cowork is Now in Preview', sub: 'AI-powered collaboration workspace inside Teams. Early access open.', img: '/assets/images/hero/carousel-2-cowork.jpg' },
  { tag: 'AI News', title: 'Latest AI: GPT-5 & Enterprise Trends', sub: 'OpenAI benchmarks, Copilot Studio updates, enterprise AI insights.', img: '/assets/images/hero/carousel-3-ai-news.jpg' },
  { tag: 'Wellbeing', title: 'Wellness Week Starts Monday', sub: 'Guided mindfulness, fitness challenges, and mental health workshops.', img: '/assets/images/hero/carousel-4-wellness.jpg' },
  { tag: 'HR Support', title: 'MyHR Voice Agent — Now Live', sub: 'Call the HR helpline to get instant support for leaves, policies, and more.', img: '/assets/images/hero/carousel-5-hr-agent.jpg'}
];

export default function Carousel() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const getSlideWidth = () => {
      const slide = track.querySelector('.carousel-slide');
      return slide ? slide.offsetWidth + 14 : 300;
    };

    const onScroll = () => {
      const idx = Math.round(track.scrollLeft / getSlideWidth());
      if (idx >= 0 && idx < SLIDES.length) setActive(idx);
    };
    track.addEventListener('scroll', onScroll, { passive: true });

    timerRef.current = setInterval(() => {
      setActive(prev => {
        const next = (prev + 1) % SLIDES.length;
        track.scrollTo({ left: next * getSlideWidth(), behavior: 'smooth' });
        return next;
      });
    }, 5000);

    return () => {
      track.removeEventListener('scroll', onScroll);
      clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="carousel">
      <div className="carousel-track" ref={trackRef}>
        {SLIDES.map((s, i) => (
          <div className="carousel-slide" key={i}>
            <img src={s.img} alt="" loading="lazy" />
            <div className="carousel-overlay" />
            <div className="carousel-content">
              <span className="carousel-tag">{s.tag}</span>
              <h3>{s.title}</h3>
              <p>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="carousel-dots">
        {SLIDES.map((_, i) => (
          <div key={i} className={`dot ${i === active ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  );
}
