/**
 * EV Storage — API client cho Vercel Serverless + Upstash Redis
 *
 * Interface giống hệt phiên bản localStorage cũ:
 *   getCars()           → Promise<Car[]>
 *   saveCar(car)        → Promise<Car>
 *   deleteCar(carId)    → Promise<void>
 *   getLogs(carId)      → Promise<ChargeLog[]>
 *   saveLog(log)        → Promise<ChargeLog>
 *   deleteLog(carId, id)→ Promise<void>
 *
 * Các hàm tính toán (calcLog, calcCarStats) giữ nguyên — pure functions.
 */

// Khi chạy local (npm run dev) Vite proxy /api → localhost:3000 nếu cần,
// nhưng với Vercel dev (`vercel dev`) thì /api đã tự có.
// Trong production Vercel, /api/* route đến serverless functions.
const BASE = '/api';

async function apiFetch(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    return res.json();
}

// ---------- Cars ----------

export async function getCars() {
    return apiFetch('/cars');
}

export async function saveCar(car) {
    return apiFetch('/cars', {
        method: 'POST',
        body: JSON.stringify(car),
    });
}

export async function deleteCar(carId) {
    await apiFetch('/cars', {
        method: 'DELETE',
        body: JSON.stringify({ id: carId }),
    });
}

// ---------- Logs ----------

export async function getLogs(carId) {
    return apiFetch(`/logs?carId=${encodeURIComponent(carId)}`);
}

export async function saveLog(log) {
    return apiFetch('/logs', {
        method: 'POST',
        body: JSON.stringify(log),
    });
}

export async function deleteLog(carId, logId) {
    await apiFetch('/logs', {
        method: 'DELETE',
        body: JSON.stringify({ carId, id: logId }),
    });
}

// ---------- Pure calculation helpers (không đổi) ----------

/**
 * Tính toán cho 1 log:
 *   energyNeeded (Wh) = batteryCapacity × (endSoc - startSoc) / 100
 *   durationHours     = (endTime - startTime) in hours
 *   actualPower (W)   = energyNeeded / durationHours
 *   efficiency (%)    = actualPower / chargerPower × 100
 *   gridEnergy (Wh)   = energyNeeded / (efficiency/100)
 *   cost (đ)          = gridEnergy/1000 × electricityCost
 *   chargingKm        = energyNeeded / (consumptionPer100km/100) km
 *   chargingSpeedKmH  = chargingKm / durationHours km/h
 */
export function calcLog(log, car) {
    const socDelta = log.endSoc - log.startSoc;
    if (socDelta <= 0) return null;

    const energyNeeded = (car.batteryCapacity * socDelta) / 100;
    const start = new Date(log.startTime);
    const end = new Date(log.endTime);
    const durationMs = end - start;
    if (durationMs <= 0) return null;
    const durationHours = durationMs / 3_600_000;
    const durationMinutes = durationMs / 60_000;

    const actualPower = energyNeeded / durationHours;
    const efficiency = log.chargerPower > 0 ? (actualPower / log.chargerPower) * 100 : 0;
    const gridEnergy = efficiency > 0 ? energyNeeded / (efficiency / 100) : energyNeeded;
    const cost = log.electricityCost > 0 ? (gridEnergy / 1000) * log.electricityCost : null;

    const chargingKm =
        car.consumptionPer100km > 0
            ? (energyNeeded / car.consumptionPer100km) * 100
            : null;
    const chargingSpeedKmH =
        chargingKm != null ? chargingKm / durationHours : null;

    return {
        energyNeeded: Math.round(energyNeeded),
        gridEnergy: Math.round(gridEnergy),
        durationHours,
        durationMinutes,
        actualPower: Math.round(actualPower),
        efficiency: +efficiency.toFixed(1),
        cost: cost != null ? Math.round(cost) : null,
        chargingKm: chargingKm != null ? +chargingKm.toFixed(1) : null,
        chargingSpeedKmH: chargingSpeedKmH != null ? +chargingSpeedKmH.toFixed(1) : null,
    };
}

/**
 * Tổng hợp hiệu suất từ tất cả log của 1 xe
 */
export function calcCarStats(logs, car) {
    const computed = logs.map((l) => calcLog(l, car)).filter(Boolean);
    if (computed.length === 0) return null;

    const avgEfficiency =
        computed.reduce((s, c) => s + c.efficiency, 0) / computed.length;
    const totalGridEnergy = computed.reduce((s, c) => s + c.gridEnergy, 0);
    const totalCost = computed.every((c) => c.cost != null)
        ? computed.reduce((s, c) => s + c.cost, 0)
        : null;
    const totalKm = computed.every((c) => c.chargingKm != null)
        ? computed.reduce((s, c) => s + c.chargingKm, 0)
        : null;

    return {
        sessionCount: computed.length,
        avgEfficiency: +avgEfficiency.toFixed(1),
        totalGridEnergy: Math.round(totalGridEnergy),
        totalCost: totalCost != null ? Math.round(totalCost) : null,
        totalKm: totalKm != null ? +totalKm.toFixed(1) : null,
    };
}
