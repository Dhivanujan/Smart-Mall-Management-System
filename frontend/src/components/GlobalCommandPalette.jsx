import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "@/services/api/client";
import { useAuth } from "@/app/providers/AuthProvider";
import { ADMIN_NAV, CUSTOMER_NAV, SUPER_ADMIN_NAV } from "@/constants/navigation";

const OPEN_EVENT_NAME = "smartmall:open-command-palette";

const COMMON_COMMANDS = [
  { id: "home", label: "Home", path: "/", icon: "🏠", section: "Pages" },
  { id: "mall", label: "Mall Directory", path: "/mall", icon: "🏪", section: "Pages" },
];

const dedupeByPath = (commands) => {
  const seen = new Set();
  return commands.filter((command) => {
    if (!command.path || seen.has(command.path)) {
      return false;
    }
    seen.add(command.path);
    return true;
  });
};

export const GlobalCommandPalette = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [stores, setStores] = useState([]);
  const [offers, setOffers] = useState([]);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const inputRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  const openPalette = () => {
    previouslyFocusedRef.current = document.activeElement;
    setIsOpen(true);
  };

  const closePalette = () => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(0);
    if (previouslyFocusedRef.current instanceof HTMLElement) {
      previouslyFocusedRef.current.focus();
    }
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const isCommandK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isCommandK) {
        return;
      }
      event.preventDefault();
      if (isOpen) {
        closePalette();
      } else {
        openPalette();
      }
    };

    const onOpenEvent = () => openPalette();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT_NAME, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT_NAME, onOpenEvent);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    const onOpenKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePalette();
      }
    };

    window.addEventListener("keydown", onOpenKeyDown);
    return () => window.removeEventListener("keydown", onOpenKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || hasLoadedData) {
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const [storesRes, offersRes] = await Promise.all([
          apiClient.get("/api/v1/stores/"),
          apiClient.get("/api/v1/offers/active"),
        ]);

        if (cancelled) {
          return;
        }

        setStores(storesRes.data.stores ?? []);
        setOffers(offersRes.data.offers ?? []);
        setHasLoadedData(true);
      } catch {
        if (!cancelled) {
          setHasLoadedData(true);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, hasLoadedData]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      closePalette();
    }
  }, [location.pathname]);

  const pageCommands = useMemo(() => {
    const base = [...COMMON_COMMANDS];

    if (!user) {
      base.push(
        { id: "login", label: "Sign In", path: "/login", icon: "🔐", section: "Pages" },
        { id: "register", label: "Register", path: "/register", icon: "📝", section: "Pages" }
      );
      return dedupeByPath(base);
    }

    const roleCommands = [];
    if (["customer", "admin", "super_admin"].includes(user.role)) {
      roleCommands.push(...CUSTOMER_NAV.map((item) => ({
        id: `customer-${item.to}`,
        label: item.label,
        path: item.to,
        icon: item.icon,
        section: "Customer",
      })));
    }
    if (["admin", "super_admin"].includes(user.role)) {
      roleCommands.push(...ADMIN_NAV.map((item) => ({
        id: `admin-${item.to}`,
        label: item.label,
        path: item.to,
        icon: item.icon,
        section: "Admin",
      })));
    }
    if (user.role === "super_admin") {
      roleCommands.push(...SUPER_ADMIN_NAV.map((item) => ({
        id: `super-${item.to}`,
        label: item.label,
        path: item.to,
        icon: item.icon,
        section: "Super Admin",
      })));
    }

    return dedupeByPath([...base, ...roleCommands]);
  }, [user]);

  const storeCommands = useMemo(
    () =>
      stores.map((store) => ({
        id: `store-${store.id}`,
        label: store.name,
        subtitle: `${store.category} • ${store.status}`,
        section: "Stores",
        icon: "🏬",
        action: () => navigate(`/mall/stores/${store.id}`),
      })),
    [stores, navigate]
  );

  const offerCommands = useMemo(
    () =>
      offers.map((offer) => ({
        id: `offer-${offer.id}`,
        label: `${offer.title} (${offer.discount_percent}% OFF)`,
        subtitle: `Store #${offer.store_id}`,
        section: "Offers",
        icon: "🏷️",
        action: () => navigate("/offers"),
      })),
    [offers, navigate]
  );

  const allCommands = useMemo(() => {
    const pages = pageCommands.map((command) => ({
      ...command,
      action: () => navigate(command.path),
    }));
    return [...pages, ...storeCommands, ...offerCommands];
  }, [pageCommands, storeCommands, offerCommands, navigate]);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return allCommands.slice(0, 30);
    }
    return allCommands
      .filter((command) => {
        const haystack = [command.label, command.subtitle, command.section].join(" ").toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 30);
  }, [allCommands, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const onInputKeyDown = (event) => {
    if (!filteredCommands.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredCommands.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      filteredCommands[Math.min(activeIndex, filteredCommands.length - 1)].action();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="command-palette-overlay" role="dialog" aria-modal="true" aria-label="Global search and commands">
      <div className="command-palette-shell" onClick={(event) => event.stopPropagation()}>
        <div className="command-palette-header">
          <span className="command-palette-search-icon">🔎</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            className="command-palette-input"
            placeholder="Search pages, stores, offers..."
            aria-label="Search commands"
          />
          <button className="btn btn-ghost btn-sm" onClick={closePalette}>Esc</button>
        </div>

        <div className="command-palette-body">
          {!filteredCommands.length ? (
            <div className="command-palette-empty">No matches found.</div>
          ) : (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                className={`command-palette-item ${index === activeIndex ? "active" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => command.action()}
              >
                <span className="command-palette-item-icon">{command.icon ?? "•"}</span>
                <span className="command-palette-item-main">
                  <span className="command-palette-item-label">{command.label}</span>
                  <span className="command-palette-item-subtitle">{command.subtitle ?? command.section}</span>
                </span>
                <span className="command-palette-item-section">{command.section}</span>
              </button>
            ))
          )}
        </div>

        <div className="command-palette-footer">
          <span>↑↓ navigate</span>
          <span>Enter open</span>
          <span>Esc close</span>
          <span>Ctrl/Cmd+K toggle</span>
        </div>
      </div>
      <button className="command-palette-backdrop-dismiss" onClick={closePalette} aria-label="Close command palette" />
    </div>
  );
};
