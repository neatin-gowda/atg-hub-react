import { useEffect, useRef, useState } from 'react';

const SLIDES = [
  { tag: 'Technology', title: 'Microsoft 365 Copilot — Now Available for All', sub: 'Every employee now has access across Word, Excel, PowerPoint, Outlook & Teams.', img: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop' },
  { tag: 'Preview', title: 'M365 Cowork is Now in Preview', sub: 'AI-powered collaboration workspace inside Teams. Early access open.', img: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop' },
  { tag: 'AI News', title: 'Latest AI: GPT-5 & Enterprise Trends', sub: 'OpenAI benchmarks, Copilot Studio updates, enterprise AI insights.', img: 'https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop' },
  { tag: 'Wellbeing', title: 'Wellness Week Starts Monday', sub: 'Guided mindfulness, fitness challenges, and mental health workshops.', img: 'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop' },
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
