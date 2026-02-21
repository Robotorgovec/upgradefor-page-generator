"use client";

import Link from "next/link";

type SidebarProps = {
  onClose: () => void;
  isSidebarOpen: boolean;
};

export default function Sidebar({ onClose, isSidebarOpen }: SidebarProps) {
  return (
    <aside className={`sidebar ${isSidebarOpen ? "" : "collapsed"}`} aria-label="Основная навигация">
      <div className="sidebar-inner">
        <div className="sidebar-section">
          <p className="sidebar-section-title">Навигация</p>
          <Link className="sidebar-link" href="/" onClick={onClose}>
            Главная
          </Link>
          <Link className="sidebar-link" href="/catalog" onClick={onClose}>
            Каталог
          </Link>
          <Link className="sidebar-link" href="/account" onClick={onClose}>
            Аккаунт
          </Link>
        </div>
        <div className="sidebar-section">
          <p className="sidebar-section-title">Сервисы</p>
          <Link className="sidebar-link" href="/messages" onClick={onClose}>
            Сообщения
          </Link>
          <Link className="sidebar-link" href="/assistant" onClick={onClose}>
            ИИ-ассистент
          </Link>
        </div>
        <div className="sidebar-section">
          <p className="sidebar-section-title">WikiMarket</p>
          <Link className="sidebar-link" href="/wikimarket/categories" onClick={onClose}>
            Категории
          </Link>
          <Link className="sidebar-link" href="/wikimarket/domains/fio-rus" onClick={onClose}>
            Домены
          </Link>
        </div>
      </div>
    </aside>
  );
}
