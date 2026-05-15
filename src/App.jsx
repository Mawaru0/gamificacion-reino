import React, { useEffect, useMemo, useState } from "react";
import "./index.css";

import fondoReino from "./assets/content.png";

import panelPrincipal from "./assets/gamificacion_assets_placeholder/frames/panel-principal.png";
import panelPequeno from "./assets/gamificacion_assets_placeholder/frames/panel-pequeno.png";
import tarjetaMision from "./assets/gamificacion_assets_placeholder/frames/tarjeta-mision.png";
import tabActiva from "./assets/gamificacion_assets_placeholder/frames/tab-activa.png";
import tabInactiva from "./assets/gamificacion_assets_placeholder/frames/tab-inactiva.png";
import frameVerdeFondo from "./assets/gamificacion_assets_placeholder/frames/frame-verde-fondo.png";

import iconPerfil from "./assets/gamificacion_assets_placeholder/icons/icon-perfil.png";
import iconMisiones from "./assets/gamificacion_assets_placeholder/icons/icon-misiones.png";
import iconTienda from "./assets/gamificacion_assets_placeholder/icons/icon-tienda.png";
import monedaIcon from "./assets/gamificacion_assets_placeholder/icons/moneda.png";

import candadoIcon from "./assets/gamificacion_assets_placeholder/icons/candado.png";

import brillo from "./assets/gamificacion_assets_placeholder/decorations/brillo.png";
import separador from "./assets/gamificacion_assets_placeholder/decorations/separador.png";
import banderin from "./assets/gamificacion_assets_placeholder/decorations/banderin.png";
import esquina from "./assets/gamificacion_assets_placeholder/decorations/esquina-decorativa.png";
import escudoVerde from "./assets/gamificacion_assets_placeholder/decorations/escudo-verde.png";
import hojasVerdes from "./assets/gamificacion_assets_placeholder/decorations/hojas-verdes.png";
import ramitaIzquierda from "./assets/gamificacion_assets_placeholder/decorations/ramita-izquierda.png";
import ramitaDerecha from "./assets/gamificacion_assets_placeholder/decorations/ramita-derecha.png";
import verticalDivider from "./assets/gamificacion_assets_placeholder/decorations/vertical_divider_sin_fondo.png";

import comprasIcon from "./assets/gamificacion_assets_placeholder/teams/compras_sin_fondo.png";
import tesoreriaIcon from "./assets/gamificacion_assets_placeholder/teams/tesoreria_sin_fondo.png";
import contabilidadIcon from "./assets/gamificacion_assets_placeholder/teams/contabilidad_sin_fondo.png";
import almacenIcon from "./assets/gamificacion_assets_placeholder/teams/almacen_sin_fondo.png";
import produccionIcon from "./assets/gamificacion_assets_placeholder/teams/produccion_sin_fondo.png";
import calidadIcon from "./assets/gamificacion_assets_placeholder/teams/calidad_sin_fondo.png";
import tominSentado from "./assets/tomin-sentado.png";

import badgeSinRango from "./assets/gamificacion_assets_placeholder/icons/badge-sin-rango.png";
import badgeBronce from "./assets/gamificacion_assets_placeholder/icons/badge-bronce.png";
import badgePlata from "./assets/gamificacion_assets_placeholder/icons/badge-plata.png";
import badgeOro from "./assets/gamificacion_assets_placeholder/icons/badge-oro.png";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1E6ZBrQnl_A6_vXqs3ZTjX2QbV6FTL77W9A1To-s_1sNdoPtkB6asZvYyDZIBfJjRcePp9Ce2-MHs/pub?gid=767321033&single=true&output=csv";

const ACCESS_CODE = "738406";

const avatarMap = {
  "Equipo 1": comprasIcon,
  "Equipo 2": tesoreriaIcon,
  "Equipo 3": contabilidadIcon,
  "Equipo 4": almacenIcon,
  "Equipo 5": produccionIcon,
  "Equipo 6": calidadIcon,
  "Equipo 7": calidadIcon,
};

const teamNameMap = {
  "Equipo 1": "Compras",
  "Equipo 2": "Tesorería",
  "Equipo 3": "Contabilidad",
  "Equipo 4": "Almacén",
  "Equipo 5": "Producción",
  "Equipo 6": "Calidad",
  "Equipo 7": "TI",
};

function getTeamDisplayName(equipo) {
  return teamNameMap[equipo] || equipo;
}

const shop = [
  {
    id: 1,
    nombre: "Pista del Consejo",
    precio: 80,
    descripcion: "Permite pedir una pista breve durante una misión.",
    icon: brillo,
  },
  {
    id: 2,
    nombre: "Doble recompensa",
    precio: 180,
    descripcion: "Duplica la reputación de una misión secundaria.",
    icon: monedaIcon,
  },
  {
    id: 3,
    nombre: "Salto de casilla",
    precio: 120,
    descripcion: "Avanza una posición extra en el tablero narrativo.",
    icon: banderin,
  },
  {
    id: 4,
    nombre: "Caja misteriosa",
    precio: 150,
    descripcion: "Recompensa sorpresa definida por moderadores.",
    icon: candadoIcon,
  },
];

const tabs = [
  { id: "perfil", label: "Perfil", icon: iconPerfil },
  { id: "misiones", label: "Misiones", icon: iconMisiones },
  { id: "tienda", label: "Tienda", icon: iconTienda },
];

const missionProgressWeights = {
  m1: 0.35,
  m2: 0.35,
  m3: 0.3,
};

function getCsvUrl() {
  return SHEET_CSV_URL;
}

function makeTeamId(equipo = "") {
  return String(equipo).toLowerCase().trim().replace(/\s+/g, "-");
}

function normalizeKey(key = "") {
  return String(key)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

function normalizeText(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeTipo(tipo = "") {
  return normalizeText(tipo).replace(/\s+/g, "_");
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return 0;

  const cleanValue = String(value)
    .trim()
    .replace("%", "")
    .replace(",", ".");

  return Number(cleanValue) || 0;
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (current || row.length) {
        row.push(current);
        rows.push(row);
        row = [];
        current = "";
      }

      if (char === "\r" && nextChar === "\n") i++;
    } else {
      current += char;
    }
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  const headers = rows[0].map((header) => normalizeKey(header));

  return rows.slice(1).map((row) => {
    const item = {};

    headers.forEach((header, index) => {
      item[header] = row[index]?.trim() ?? "";
    });

    return item;
  });
}

async function fetchSheetRows() {
  const response = await fetch(getCsvUrl());

  if (!response.ok) {
    throw new Error("No se pudo leer el Google Sheet");
  }

  const text = await response.text();
  return parseCsv(text);
}

function normalizeEstado(estado) {
  const value = normalizeText(estado);

  if (value === "completada" || value === "cumplida") return "Completada";
  return "En progreso";
}

function isTruthy(value) {
  const normalized = normalizeText(value);

  return ["1", "si", "true", "completada", "cumplida"].includes(normalized);
}

function isMetaRow(tipo) {
  return ["meta_final", "meta_principal", "meta"].includes(normalizeTipo(tipo));
}

function isMissionRow(tipo) {
  return ["mision", "misiones"].includes(normalizeTipo(tipo));
}

function getMissionReward(row) {
  const reputationValue = row.reputacion || row.monedas || row.moneda;

  if (reputationValue !== undefined && reputationValue !== "") {
    return normalizeNumber(reputationValue);
  }

  const peso = normalizeNumber(row.peso);

  return Math.round(peso * 100);
}

function getCompletionRatio(row) {
  const completed = normalizeNumber(row.sesiones_cumplidas);
  const total = normalizeNumber(row.sesiones_totales);

  if (total > 0) return Math.min(completed / total, 1);

  return 0;
}

function getMissionKey(row) {
  return normalizeText(row.elemento_id).replace(/\s+/g, "");
}

function isProgressMissionRow(row) {
  const missionKey = getMissionKey(row);

  return isMissionRow(row.tipo) && ["m1", "m2", "m3"].includes(missionKey);
}

function getMissionProgressWeight(row) {
  const missionKey = getMissionKey(row);

  return missionProgressWeights[missionKey] ?? 0;
}

function getRowProgress(row) {
  if (!isProgressMissionRow(row)) return 0;

  const ratio = getCompletionRatio(row);
  const weight = getMissionProgressWeight(row);

  return ratio * weight;
}

function getMissionStatus(row) {
  if (row.estado) return normalizeEstado(row.estado);

  const completed = normalizeNumber(row.sesiones_cumplidas);
  const total = normalizeNumber(row.sesiones_totales);

  if (total > 0 && completed >= total) return "Completada";

  return "En progreso";
}

function getRankByProgress(progress) {
  const value = Number(progress) || 0;

  if (value >= 70) {
    return {
      nombre: "Oro",
      icon: badgeOro,
      premio: "Premios oro",
    };
  }

  if (value >= 50) {
    return {
      nombre: "Plata",
      icon: badgePlata,
      premio: "Premios plata",
    };
  }

  if (value >= 20) {
    return {
      nombre: "Bronce",
      icon: badgeBronce,
      premio: "Premios bronce",
    };
  }

  return {
    nombre: "Sin rango",
    icon: badgeSinRango,
    premio: "No canjea todavía",
  };
}

function isPrizeRow(tipo) {
  return ["premio", "premios", "recompensa", "recompensas"].includes(
    normalizeTipo(tipo)
  );
}

function buildPrizesFromRows(rows) {
  const prizes = rows
    .filter((row) => isPrizeRow(row.tipo))
    .map((row, index) => ({
      id: index + 1,
      teamId: row.equipo ? makeTeamId(row.equipo) : "",
      rango: row.rango_premio || row.rango || "Bronce",
      titulo: row.elemento || row.premio || row.titulo || "Cofre misterioso",
      descripcion:
        row.descripcion || "Descúbrelo mientras sigues progresando.",
    }));

  if (prizes.length > 0) return prizes;

  return [
    {
      id: 1,
      teamId: "",
      rango: "Bronce",
      titulo: "Cofre misterioso",
      descripcion: "Descúbrelo mientras sigues progresando.",
    },
    {
      id: 2,
      teamId: "",
      rango: "Bronce",
      titulo: "Cofre misterioso",
      descripcion: "Descúbrelo mientras sigues progresando.",
    },
    {
      id: 3,
      teamId: "",
      rango: "Bronce",
      titulo: "Cofre misterioso",
      descripcion: "Descúbrelo mientras sigues progresando.",
    },
    {
      id: 4,
      teamId: "",
      rango: "Plata",
      titulo: "Cofre misterioso",
      descripcion: "Descúbrelo mientras sigues progresando.",
    },
    {
      id: 5,
      teamId: "",
      rango: "Plata",
      titulo: "Cofre misterioso",
      descripcion: "Descúbrelo mientras sigues progresando.",
    },
    {
      id: 6,
      teamId: "",
      rango: "Oro",
      titulo: "Cofre misterioso",
      descripcion: "Descúbrelo mientras sigues progresando.",
    },
    {
      id: 7,
      teamId: "",
      rango: "Oro",
      titulo: "Cofre misterioso",
      descripcion: "Descúbrelo mientras sigues progresando.",
    },
  ];
}

function buildTeamsFromRows(rows) {
  const teamMap = {};

  rows.forEach((row) => {
    const equipo = row.equipo;

    if (!equipo) return;

    const teamId = makeTeamId(equipo);

    if (!teamMap[teamId]) {
  teamMap[teamId] = {
  id: teamId,
  nombre: getTeamDisplayName(equipo),
  metaPrincipal: "",
  metaFinal: "",
  metaDescripcion: "",
  metaEstado: "En progreso",
  reputacion: 0,
  rango: row.rango || "Rango",
  progreso: 0,
  sesionesAsistidas: normalizeNumber(row.sesiones_asistidas),
  avatar: avatarMap[equipo] ?? comprasIcon,
};
}

if (row.sesiones_asistidas) {
  teamMap[teamId].sesionesAsistidas = normalizeNumber(row.sesiones_asistidas);
}
   

    if (isMetaRow(row.tipo)) {
  teamMap[teamId].metaPrincipal = row.elemento || row.mision || "";
  teamMap[teamId].metaFinal = row.elemento || row.mision || "";
  teamMap[teamId].metaDescripcion = row.descripcion || "";
  teamMap[teamId].metaEstado = getMissionStatus(row);
}

    // Fórmula de reputación actual / progreso:
    // M1 × 0.35 + M2 × 0.35 + M3 × 0.30
    // La meta principal ya no suma en esta fórmula.
    teamMap[teamId].progreso += getRowProgress(row);

    // Reputación para tienda. Solo considera misiones, no meta principal.
    if (isMissionRow(row.tipo) && getMissionStatus(row) === "Completada") {
      teamMap[teamId].reputacion += getMissionReward(row);
    }
  });

  return Object.values(teamMap).map((team) => ({
    ...team,
    progreso: Math.round(Math.min(team.progreso * 100, 100)),
    reputacion: Math.round(team.reputacion),
  }));
}

function buildMissionsFromRows(rows) {
  return rows
    .filter((row) => {
      const title = row.elemento || row.mision;
      return row.equipo && isMissionRow(row.tipo) && title;
    })
    .map((row, index) => ({
      id: index + 1,
      teamId: makeTeamId(row.equipo),
      titulo: row.elemento || row.mision,
      responsable: getTeamDisplayName(row.equipo),
      descripcion: row.descripcion || "",
      recompensa: {
        reputacion: Math.round(getMissionReward(row)),
      },
      estado: getMissionStatus(row),
      categoria: row.elemento_id || row.categoria || `Misión ${index + 1}`,
      sesionesCumplidas: normalizeNumber(row.sesiones_cumplidas),
      sesionesTotales: normalizeNumber(row.sesiones_totales),
    }));
}

function getCompletedCount(teamMissions) {
  return teamMissions.filter(
    (mission) => mission.estado.toLowerCase() === "completada"
  ).length;
}

function getInProgressCount(teamMissions) {
  return teamMissions.filter(
    (mission) => mission.estado.toLowerCase() === "en progreso"
  ).length;
}

function getSessionProgressPercent(mission) {
  const completed = normalizeNumber(mission?.sesionesCumplidas);
  const total = normalizeNumber(mission?.sesionesTotales);

  if (total <= 0) return null;

  return Math.round(Math.min(completed / total, 1) * 100);
}

export default function App() {
  const [teams, setTeams] = useState([]);
  const [missions, setMissions] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [activeTab, setActiveTab] = useState("perfil");
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInterface, setShowInterface] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(true);
  const [accessCode, setAccessCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [accessUnlocked, setAccessUnlocked] = useState(false);

  useEffect(() => {
    async function loadSheetData() {
      try {
        setLoading(true);
        setError("");

        const rows = await fetchSheetRows();

        const loadedTeams = buildTeamsFromRows(rows);
        const loadedMissions = buildMissionsFromRows(rows);
        const loadedPrizes = buildPrizesFromRows(rows);

        setTeams(loadedTeams);
        setMissions(loadedMissions);
        setPrizes(loadedPrizes);

        const firstTeam = loadedTeams[0];

        setSelectedTeamId(firstTeam?.id ?? "");
        setSelectedMissionId(firstTeam ? `meta-${firstTeam.id}` : null);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos del Google Sheets.");
      } finally {
        setLoading(false);
      }
    }

    loadSheetData();
  }, []);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) ?? teams[0],
    [teams, selectedTeamId]
  );

  const teamMissions = useMemo(
    () => missions.filter((mission) => mission.teamId === selectedTeam?.id),
    [missions, selectedTeam?.id]
  );

  const missionEntries = useMemo(() => {
    if (!selectedTeam) return [];

    const metaEntry = {
      id: `meta-${selectedTeam.id}`,
      tipo: "metaPrincipal",
      titulo: selectedTeam.metaFinal || "Meta principal",
      responsable: selectedTeam.nombre,
      descripcion:
        selectedTeam.metaDescripcion ||
        "Descripción de la misión principal no registrada.",
      recompensa: {
        reputacion: 0,
      },
      estado: selectedTeam.metaEstado || "En progreso",
    };

    const missionItems = teamMissions.slice(0, 3).map((mission) => ({
      ...mission,
      id: `mission-${mission.id}`,
      tipo: "mision",
    }));

    return [metaEntry, ...missionItems];
  }, [selectedTeam, teamMissions]);

  const selectedMission =
    missionEntries.find((mission) => mission.id === selectedMissionId) ??
    missionEntries[0];

  function handleTeamChange(event) {
    const nextTeamId = event.target.value;

    setSelectedTeamId(nextTeamId);
    setSelectedMissionId(`meta-${nextTeamId}`);
  }

  function openAccessModal() {
    if (accessUnlocked) {
      setShowInterface(true);
      return;
    }

    setAccessCode("");
    setAccessError("");
    setShowCodeModal(true);
  }

  function closeInterface() {
    setShowInterface(false);
    setShowCodeModal(false);
    setAccessUnlocked(true);
  }

  function handleAccessSubmit(event) {
    event.preventDefault();

    if (accessCode.trim() === ACCESS_CODE) {
      setAccessError("");
      setAccessUnlocked(true);
      setShowCodeModal(false);
      setShowInterface(true);
      return;
    }

    setAccessError("Código incorrecto. Inténtalo otra vez.");
  }

  if (!showInterface) {
    return (
      <main className="app">
        <div className="background">
          <img src={fondoReino} alt="" className="backgroundImg" />
        </div>

        <div className="backgroundTint" />

        <button
          className="tominStartButton"
          onClick={openAccessModal}
          aria-label="Abrir sistema de misiones"
        >
          <img src={tominSentado} alt="Tomin sentado" />
        </button>

        {showCodeModal && !accessUnlocked && (
          <div className="accessBubbleLayer">
            <form className="accessBubble" onSubmit={handleAccessSubmit}>
              <h2>¡Hola!</h2>
              <p>
                Bienvenido a la interfaz de progreso. Ingresa el código secreto
                para ver el avance de tu equipo.
              </p>

              <label className="accessCodeBox">
                Código de acceso
                <input
                  type="text"
                  value={accessCode}
                  onChange={(event) => setAccessCode(event.target.value)}
                  placeholder="Ingresa el código"
                  autoFocus
                />
              </label>

              {accessError && <span className="accessError">{accessError}</span>}

              <button type="submit" className="accessButton">
                Entrar
              </button>
            </form>
          </div>
        )}

        {!showCodeModal && accessUnlocked && (
          <div className="accessBubbleLayer">
            <div className="accessBubble reopenBubble">
              <p>Haz clic en Tomin para volver a abrir la interfaz.</p>
            </div>
          </div>
        )}
      </main>
    );
  }

  if (loading) {
    return (
      <main className="app">
        <div className="background">
          <img src={fondoReino} alt="" className="backgroundImg" />
        </div>

        <div className="backgroundTint" />

        <section className="page">
          <header className="topBar assetPanelSmall">
            <img src={esquina} className="corner cornerLeft" alt="" />
            <img src={esquina} className="corner cornerRight" alt="" />

            <div>
              <div className="eyebrow">
                <img src={banderin} alt="" />
                Consejo del Reino
              </div>
              <h1>Cargando misiones...</h1>
            </div>
          </header>
        </section>
      </main>
    );
  }

  if (error || !selectedTeam) {
    return (
      <main className="app">
        <div className="background">
          <img src={fondoReino} alt="" className="backgroundImg" />
        </div>

        <div className="backgroundTint" />

        <section className="page">
          <header className="topBar assetPanelSmall">
            <img src={esquina} className="corner cornerLeft" alt="" />
            <img src={esquina} className="corner cornerRight" alt="" />

            <div>
              <div className="eyebrow">
                <img src={banderin} alt="" />
                Consejo del Reino
              </div>
              <h1>{error || "No hay equipos registrados."}</h1>
            </div>
          </header>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <div className="background">
        <img src={fondoReino} alt="" className="backgroundImg" />
      </div>

      <div className="backgroundTint" />

      <button
        type="button"
        className="interfaceCloseButton"
        onClick={closeInterface}
        aria-label="Cerrar interfaz"
      >
        ×
      </button>

      <section className="page">
        <header className="topBar assetPanelSmall">
          <img src={esquina} className="corner cornerLeft" alt="" />
          <img src={esquina} className="corner cornerRight" alt="" />

          <div>
            <div className="eyebrow">
              <img src={banderin} alt="" />
              Consejo del Reino
            </div>
            <h1>Sistema de misiones</h1>
          </div>

          <label className="teamSelectBox">
            Selecciona equipo
            <select value={selectedTeamId} onChange={handleTeamChange}>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.nombre}
                </option>
              ))}
            </select>
          </label>
        </header>

        <div className="mainWindowWrap">
          <img src={frameVerdeFondo} className="greenFrameAsset" alt="" />
          <img src={escudoVerde} className="greenFrameShield" alt="" />
          <img
            src={hojasVerdes}
            className="greenFrameLeaves greenFrameLeavesTop"
            alt=""
          />
          <img
            src={hojasVerdes}
            className="greenFrameLeaves greenFrameLeavesBottom"
            alt=""
          />

          <div className="innerPanelWrap">
            <img src={panelPrincipal} className="mainWindowAsset" alt="" />

            <div className="mainWindowContent">
              <nav className="tabs">
                {tabs.map((tab) => {
                  const active = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={active ? "tab active" : "tab"}
                      style={{
                        backgroundImage: `url(${
                          active ? tabActiva : tabInactiva
                        })`,
                      }}
                    >
                      <img src={tab.icon} alt="" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="contentPanel">
                {activeTab === "perfil" && (
                  <Perfil team={selectedTeam} missions={teamMissions} />
                )}

                {activeTab === "misiones" && (
                  <Misiones
                    team={selectedTeam}
                    missions={missionEntries}
                    selectedMission={selectedMission}
                    selectedMissionId={selectedMissionId}
                    setSelectedMissionId={setSelectedMissionId}
                  />
                )}

                {activeTab === "tienda" && (
                  <Tienda team={selectedTeam} prizes={prizes} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Perfil({ team, missions }) {
  const completed = getCompletedCount(missions);
  const inProgress = getInProgressCount(missions);
  const [showRankPopup, setShowRankPopup] = useState(false);
  const rank = getRankByProgress(team.progreso);

  return (
    <div className="profileGrid">
      <AssetCard className="profileCard">
        <h2>{team.nombre}</h2>

        <img src={team.avatar} className="teamAvatar" alt="" />

        <div className="mainGoalBlock">
          <h4>Meta principal</h4>
          <p>{team.metaPrincipal || "Meta principal no registrada."}</p>
        </div>

        <div className="profileStatsRow singleBadgeRow">
          <button
            type="button"
            className="rankButton"
            onClick={() => setShowRankPopup(true)}
            aria-label="Ver detalle de rango"
          >
            <ProfileBadge
              icon={rank.icon}
              title="Rango"
              value=""
              className="rankBadge"
            />
          </button>
        </div>
      </AssetCard>

      <img src={verticalDivider} className="verticalDivider" alt="" />

      <AssetCard className="infoCard">
        <h3>Progreso del reino</h3>
        <img src={separador} className="separator" alt="" />

        <div className="progressLabel">
          <span>Reputación actual</span>
          <span>{team.progreso}%</span>
        </div>

        <div className="progressBar">
          <div style={{ width: `${team.progreso}%` }} />
        </div>

        <div className="miniGrid profileMiniGridTwo">
  <SmallCard label="Retos por sesión" value={missions.length} />
  <SmallCard label="Sesiones asistidas" value={team.sesionesAsistidas || 0} />
</div>

        <p className="note">
          El avance se actualiza según los retos registrados por el equipo.
        </p>
      </AssetCard>

      {showRankPopup && (
        <div className="popupOverlay" onClick={() => setShowRankPopup(false)}>
          <div className="rankPopup" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="popupClose"
              onClick={() => setShowRankPopup(false)}
              aria-label="Cerrar popup"
            >
              ×
            </button>

            <img src={rank.icon} className="rankPopupIcon" alt="" />

            <h3>Rango del equipo</h3>
            <p>
              El rango se asigna según la reputación actual del equipo y define qué
              premios puede desbloquear en la tienda.
            </p>

            <div className="rankPopupStatus">
              <span>Rango actual</span>
              <strong>{rank.nombre}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Misiones({
  team,
  missions,
  selectedMission,
  selectedMissionId,
  setSelectedMissionId,
}) {
  if (!selectedMission) {
    return (
      <p className="emptyText">Este equipo aún no tiene misiones asignadas.</p>
    );
  }

  const metaMission = missions[0];
  const regularMissions = missions.slice(1, 4);
  const isMetaSelected = selectedMission?.tipo === "metaPrincipal";
  const missionProgressPercent = getSessionProgressPercent(selectedMission);

  return (
    <div className="missionsGrid">
      <AssetCard className="missionList">
        <div className="missionListHeader">
          <img
            src={ramitaIzquierda}
            className="missionBranch missionBranchLeft"
            alt=""
          />
          <h3>Misiones</h3>
          <img
            src={ramitaDerecha}
            className="missionBranch missionBranchRight"
            alt=""
          />
        </div>

        <div className="missionSections">
          <div className="missionSectionBlock">
            <p className="missionSectionLabel">Meta principal</p>

            {metaMission && (
              <button
                key={metaMission.id}
                onClick={() => setSelectedMissionId(metaMission.id)}
                className={
                  selectedMissionId === metaMission.id
                    ? "missionItem selected"
                    : "missionItem"
                }
                style={{ backgroundImage: `url(${tarjetaMision})` }}
              >
                <strong>{metaMission.titulo}</strong>
                <span>{metaMission.responsable}</span>
                <small>{metaMission.estado}</small>
              </button>
            )}
          </div>

          <div className="missionSectionBlock">
            <p className="missionSectionLabel">Retos</p>

            <div className="missionCards">
              {regularMissions.map((mission) => (
                <button
                  key={mission.id}
                  onClick={() => setSelectedMissionId(mission.id)}
                  className={
                    selectedMissionId === mission.id
                      ? "missionItem selected"
                      : "missionItem"
                  }
                  style={{ backgroundImage: `url(${tarjetaMision})` }}
                >
                  <strong>{mission.titulo}</strong>
                  <span>
                    {mission.responsable}
                    {mission.sesionesTotales
                      ? ` · ${mission.sesionesCumplidas}/${mission.sesionesTotales}`
                      : ""}
                  </span>
                  <small>{mission.estado}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      </AssetCard>

      <img src={verticalDivider} className="verticalDivider" alt="" />

      <AssetCard className="missionDetail">
        <div
          className="missionDetailBody"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            minHeight: "100%",
            paddingTop: "0.7rem",
            paddingBottom: "1.75rem",
            gap: "1rem",
          }}
        >
          <h2>{selectedMission.titulo}</h2>

          <img
            src={separador}
            className="separator missionInfoSeparator"
            alt=""
          />

          <p>{selectedMission.descripcion}</p>

          {missionProgressPercent !== null && (
            <>
              <div className="progressLabel missionProgressLabel">
                <span>Progreso de la misión</span>
                <span>
                  {selectedMission.sesionesCumplidas}/{selectedMission.sesionesTotales} · {missionProgressPercent}%
                </span>
              </div>

              <div className="progressBar missionProgressBar">
                <div style={{ width: `${missionProgressPercent}%` }} />
              </div>
            </>
          )}

          {isMetaSelected ? (
            <>
              <h4>Estado de la misión principal</h4>
              <div className="goals">
                <div className="goal">
                  <img src={candadoIcon} alt="" />
                  <span>{selectedMission.estado}</span>
                </div>
              </div>

              <p className="note" style={{ marginTop: "0.25rem" }}>
                Completa la misión principal para desbloquear la tienda y
                canjear premios.
              </p>
            </>
          ) : (
            <p className="note" style={{ marginTop: "0.75rem" }}>
              El avance se actualiza según el cumplimiento registrado en cada
              sesión.
            </p>
          )}
        </div>
      </AssetCard>
    </div>
  );
}

function Tienda({ team, prizes }) {
  const [activeShopRank, setActiveShopRank] = useState("Bronce");
  const teamRank = getRankByProgress(team.progreso);
  const metaUnlocked = normalizeText(team.metaEstado) === "completada";

  const rankOrder = ["Bronce", "Plata", "Oro"];

  const requiredProgressByRank = {
    Bronce: 20,
    Plata: 50,
    Oro: 70,
  };

  const canAccessRank = (rank) => {
    if (!metaUnlocked) return false;

    const requiredProgress = requiredProgressByRank[rank] ?? 20;
    return team.progreso >= requiredProgress;
  };

  const activeRankRequired = requiredProgressByRank[activeShopRank] ?? 20;
  const activeRankUnlocked = canAccessRank(activeShopRank);

  const visiblePrizes = prizes.filter((prize) => {
    const belongsToTeam = prize.teamId === team.id;
    const isGenericPrize = !prize.teamId;
    const sameRank =
      normalizeText(prize.rango) === normalizeText(activeShopRank);

    return sameRank && (belongsToTeam || isGenericPrize);
  });

  return (
    <div className="shopPanel">
      <div className="shopHeader">
        <div className="shopTitleBlock">
          <h2>Tienda de premios</h2>
          <p>Desbloquea premios según el rango alcanzado por tu equipo.</p>
        </div>

        <div className="moneyPill">
          <img src={teamRank.icon} alt="" />
          {teamRank.nombre}
        </div>
      </div>

      <div className="shopRankTabs">
        {rankOrder.map((rank) => {
          const unlocked = canAccessRank(rank);

          return (
            <button
              key={rank}
              type="button"
              className={
                activeShopRank === rank ? "shopRankTab active" : "shopRankTab"
              }
              onClick={() => setActiveShopRank(rank)}
            >
              {rank}
              {!unlocked && <span>Bloqueado</span>}
            </button>
          );
        })}
      </div>

      <div className="shopGrid">
        {visiblePrizes.map((item) => {
          const unlocked = canAccessRank(item.rango);

          return (
            <AssetCard key={item.id} className="shopCard">
              <img
                src={candadoIcon}
                className="shopIcon"
                alt=""
              />

              <div className="shopText">
                <h3>{item.titulo}</h3>
                <p>{item.descripcion}</p>

                <div className="shopBottom">
                  <span>{unlocked ? "Desbloqueado" : "Bloqueado"}</span>
                  <button disabled={!unlocked}>
                    {unlocked ? "Canjear" : "Bloqueado"}
                  </button>
                </div>
              </div>
            </AssetCard>
          );
        })}
      </div>

      {!metaUnlocked && (
        <p className="note shopNote">
          Completa la misión principal para desbloquear la tienda y poder
          canjear premios.
        </p>
      )}

      {metaUnlocked && !activeRankUnlocked && (
        <p className="note shopNote">
          Alcanza al menos {activeRankRequired}% de reputación para desbloquear
          los premios {activeShopRank.toLowerCase()}.
        </p>
      )}
    </div>
  );
}

function AssetCard({ children, className = "" }) {
  return (
    <div className={`assetCard ${className}`}>
      <img src={panelPequeno} className="assetCardBg" alt="" />
      <div className="assetCardContent">{children}</div>
    </div>
  );
}

function ProfileBadge({ icon, title, value, className = "" }) {
  return (
    <div className={`profileBadge ${className}`}>
      <span className="profileBadgeTitle">{title}</span>
      <img src={icon} alt="" />
      {value !== "" && <strong>{value}</strong>}
    </div>
  );
}

function Stat({ icon, label, value, className = "" }) {
  return (
    <div className={`stat ${className}`}>
      <img src={icon} alt="" />
      {value !== "" && <strong>{value}</strong>}
      <span>{label}</span>
    </div>
  );
}

function SmallCard({ label, value }) {
  return (
    <div className="smallCard">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Reward({ icon, label, value }) {
  return (
    <div className="reward">
      <img src={icon} alt="" />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}