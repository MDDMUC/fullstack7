'use client'

import React from 'react'
import Link from 'next/link'
import { RequireAuth } from '@/components/RequireAuth'

type ChatItem = {
  title: string
  subtitle: string
  img: string
  unread?: boolean
  tallCrop?: 'tall1' | 'tall2'
}

const CHAT_ITEMS: ChatItem[] = [
  {
    title: 'Climbing Trip Kochel 12.07...',
    subtitle: 'Hey, I was thinking we could...',
    img: 'http://localhost:3845/assets/386eadfd98ef4d488341a568caf6d0927c27a413.png',
    unread: true,
  },
  {
    title: 'PETZL Rope Demo',
    subtitle: 'Hey, I was thinking we could...',
    img: 'http://localhost:3845/assets/e77d367964c4498d605be651145ba7bf039e3be8.png',
  },
  {
    title: 'Beginner Lead Class',
    subtitle: 'Hey, I was thinking we could...',
    img: 'http://localhost:3845/assets/3bb4efb27db8984b86255e27c681d482f01670ba.png',
    unread: true,
  },
  {
    title: 'The Beta Crushers',
    subtitle: 'Hey, I was thinking we could...',
    img: 'http://localhost:3845/assets/cb1da9d904fd8f4e017321c6477475c3badf69a5.png',
  },
  {
    title: 'Boulderwelt West Hangout',
    subtitle: 'Hey, I was thinking we could...',
    img: 'http://localhost:3845/assets/d0a218e1753a7486a51679b4dcf8b6ae3e143d81.png',
  },
  {
    title: 'DAV Thalkirchen News',
    subtitle: 'Hey, I was thinking we could...',
    img: 'http://localhost:3845/assets/9a6aa8e2b43aa4d4afdf2208aa5c2941bf1a824e.png',
  },
  {
    title: 'Kochel 27.12.2025',
    subtitle: 'Hey, I was thinking we could...',
    img: 'http://localhost:3845/assets/224f22123c8ba607357d3a79b26aa7ff1ef913f7.png',
    unread: true,
    tallCrop: 'tall1',
  },
  {
    title: 'Einstein Garage Sale',
    subtitle: 'Hey, I was thinking we could...',
    img: 'http://localhost:3845/assets/d8aa859637e53dba8d4cd8e1f019e802c8c919da.png',
    tallCrop: 'tall2',
  },
]

export default function ChatsScreen() {
  return (
    <RequireAuth>
      <div className="chats-screen" data-name="/ chats">
        <div className="chats-content">
          {/* Top Navigation - Filters: gym, event, personal */}
          <div className="chats-topnav">
            {['gym', 'event', 'personal'].map(label => (
              <div className="chats-filter-pill" key={label}>
                <div className="chats-filter-pill-inner">
                  <span className="chats-filter-text">{label}</span>
                  <div className="chats-filter-chevron">
                    <img src="/icons/Color.svg" alt="" className="chats-chevron-img" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat List Card */}
          <div className="chats-card">
            {CHAT_ITEMS.map((chat, idx) => (
              <React.Fragment key={chat.title + idx}>
                <div className="chats-preview">
                  <div className="chats-preview-cont">
                    <div className="chats-avatar-wrapper">
                      <div className="chats-avatar-bg" />
                      <img
                        src={chat.img}
                        alt=""
                        className={
                          chat.tallCrop === 'tall1'
                            ? 'chats-avatar-img-tall-1'
                            : chat.tallCrop === 'tall2'
                              ? 'chats-avatar-img-tall-2'
                              : 'chats-avatar-img'
                        }
                      />
                    </div>
                    <div className="chats-text">
                      <p className="chats-title">{chat.title}</p>
                      <p className="chats-subtitle">{chat.subtitle}</p>
                    </div>
                    {chat.unread && (
                      <div className="chats-unread-badge">
                        <img src="/icons/unread-badge.svg" alt="" className="chats-badge-img" />
                      </div>
                    )}
                  </div>
                </div>
                {idx < CHAT_ITEMS.length - 1 && (
                  <div className="chats-divider">
                    <img src="/icons/divider-line.svg" alt="" className="chats-divider-img" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Bottom Navbar - unified with home */}
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
              <Link href="/events" className="home-bottom-item">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="announcement-01">
                    <div className="home-nav-icon-inner-announcement">
                      <img src="/icons/announcement-01.svg" alt="" className="home-nav-icon-img" />
                    </div>
                  </div>
                </div>
                <span className="home-bottom-label">events</span>
              </Link>
              <Link href="/chats" className="home-bottom-item home-bottom-active home-bottom-item-chat">
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

