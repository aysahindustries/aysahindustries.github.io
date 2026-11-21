import { useEffect, useState } from 'react'
import { useApp } from '../context'
import { api } from '../lib/api'
import { PageHead } from './About'

const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

export default function Team() {
  const { t, loc } = useApp()
  const [team, setTeam] = useState([])
  useEffect(() => {
    api.list('team', { orderBy: 'sort', asc: true }).then(setTeam)
  }, [])
  return (
    <>
      <PageHead eyebrow="OUR PEOPLE" title={t('meet_team')} lead={t('team_lead')} />
      <section className="section">
        <div className="wrap grid g3">
          {team.map((m) => (
            <article className="card team" key={m.id}>
              {m.photo_url ? (
                <div className="team-photo" style={{ backgroundImage: `url("${m.photo_url}")` }} />
              ) : (
                <div className="team-photo ph"><span>{initials(m.name)}</span></div>
              )}
              <div className="pad">
                <h3>{m.name}</h3>
                <div className="kicker">{loc(m, 'role')}</div>
                <p className="muted small">{loc(m, 'bio')}</p>
                <div className="team-contacts small">
                  {m.email && <a href={`mailto:${m.email}`}>✉️ {m.email}</a>}
                  {m.phone && <a href={`tel:${m.phone.replace(/\s/g, '')}`}>📞 {m.phone}</a>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
