'use client'

import React from 'react'
import Link from 'next/link'
import { RequireAuth } from '@/components/RequireAuth'

const EVENT_TILES = [
  {
    title: 'PETZL Rope Demo',
    subtitle: 'DAV Thalkirchen',
    location: 'Munich',
    attendees: '27 people are going',
    img: 'http://localhost:3845/assets/e77d367964c4498d605be651145ba7bf039e3be8.png',
  },
  {
    title: 'Beginner Lead Class',
    subtitle: 'DAV Thalkirchen',
    location: 'Munich',
    attendees: '27 people are going',
    img: 'http://localhost:3845/assets/3bb4efb27db8984b86255e27c681d482f01670ba.png',
  },
  {
    title: 'PETZL Rope Demo',
    subtitle: 'DAV Thalkirchen',
    location: 'Munich',
    attendees: '27 people are going',
    img: 'http://localhost:3845/assets/e77d367964c4498d605be651145ba7bf039e3be8.png',
  },
  {
    title: 'Beginner Lead Class',
    subtitle: 'DAV Thalkirchen',
    location: 'Munich',
    attendees: '27 people are going',
    img: 'http://localhost:3845/assets/3bb4efb27db8984b86255e27c681d482f01670ba.png',
  },
]

const FILTER_LABELS = ['city', 'type', 'time']

export default function EventsScreen() {
  return (
    <RequireAuth>
      <div className="events-screen" data-name="/ events">
        <div className="events-content">
          <div className="events-card">
            <div className="events-createbar" data-name="create-event-mobile" data-node-id="636:2102">
              <div className="events-createbar-left">
                <div className="events-createbar-plus" data-name="plus" data-node-id="636:2101">
                  <div className="events-createbar-plus-inner" data-name="plus" data-node-id="636:2099">
                    <div className="events-createbar-icon" data-name="Icon" data-node-id="I636:2099;633:7054">
                      <div className="events-createbar-stroke">
                        <img src="/icons/plus.svg" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="events-createbar-center" data-name="name" data-node-id="636:2092">
                <p className="events-createbar-text">create event</p>
              </div>
              <div className="events-createbar-right" data-name="Auto Layout Horizontal" data-node-id="636:2094">
                <div className="events-createbar-ghost">
                  <div className="events-createbar-ghost-inner">
                    <div className="events-createbar-ghost-frame">
                      <div className="events-createbar-ghost-img">
                        <img src="/icons/dots.svg" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {EVENT_TILES.map((tile, idx) => (
              <Link key={`${tile.title}-${idx}`} href="/events/detail" className="events-tile">
                <div className="events-tile-img">
                  <img src={tile.img} alt="" className="events-tile-img-el" />
                </div>
                <div className="events-tile-overlay" />
                <div className="events-tile-text">
                  <p className="events-tile-title">{tile.title}</p>
                  <p className="events-tile-subtitle">{tile.subtitle}</p>
                  <div className="events-tile-info">
                    <p className="events-tile-loc">{tile.location}</p>
                    <p className="events-tile-att">{tile.attendees}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="home-bottom-nav">
            <div className="home-bottom-row">
              <Link href="/profile" className="home-bottom-item">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="face-content">
                    <div className="home-nav-icon-inner-face">
                      <img src="/icons/face-content.svg" alt="" className="home-nav-icon-img" />
                    </div>
                  </div>
                </div>
                <span className="home-bottom-label">profile</span>
              </Link>
              <Link href="/events" className="home-bottom-item home-bottom-active">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="announcement-01">
                    <div className="home-nav-icon-inner-announcement">
                      <img src="/icons/announcement-01.svg" alt="" className="home-nav-icon-img" />
                    </div>
                  </div>
                </div>
                <span className="home-bottom-label">events</span>
              </Link>
              <Link href="/chats" className="home-bottom-item home-bottom-item-chat">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="message-chat-square">
                    <div className="home-nav-icon-inner-message">
                      <img src="/icons/message-chat-square.svg" alt="" className="home-nav-icon-img" />
                    </div>
                  </div>
                  <div className="home-bottom-dot" />
                </div>
                <span className="home-bottom-label">chats</span>
              </Link>
              <Link href="/home" className="home-bottom-item">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="flash">
                    <div className="home-nav-icon-inner-flash" data-name="Icon">
                      <div className="home-nav-icon-inner-flash-2">
                        <img src="/icons/flash.svg" alt="" className="home-nav-icon-img" />
                      </div>
                    </div>
                  </div>
                </div>
                <span className="home-bottom-label">dab</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
