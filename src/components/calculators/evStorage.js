/**
 * LocalStorage helpers cho EV Charge Tracker
 * Schema:
 *   ev_cars: Car[]
 *   Car { id, name, batteryCapacity (Wh), consumptionPer100km (Wh/100km), createdAt }
 *   ev_logs_{carId}: ChargeLog[]
 *   ChargeLog { id, carId, startSoc, endSoc, chargerPower (W), startTime (ISO), endTime (ISO),
 *               electricityCost (đ/kWh, optional), createdAt }
 */

const CARS_KEY = 'ev_cars';
const logsKey = (carId) => `ev_logs_${carId}`;

// ---------- Cars ----------

export function getCars() {
    try {
        return JSON.parse(localStorage.getItem(CARS_KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveCar(car) {
    const cars = getCars();
    const idx = cars.findIndex((c) => c.id === car.id);
    if (idx >= 0) cars[idx] = car;
    else cars.push(car);
    localStorage.setItem(CARS_KEY, JSON.stringify(cars));
}

export function deleteCar(carId) {
    const cars = getCars().filter((c) => c.id !== carId);
    localStorage.setItem(CARS_KEY, JSON.stringify(cars));
    localStorage.removeItem(logsKey(carId));
}

// ---------- Logs ----------

export function getLogs(carId) {
    try {
        return JSON.parse(localStorage.getItem(logsKey(carId)) || '[]');
    } catch {
        return [];
    }
}

export function saveLog(log) {
    const logs = getLogs(log.carId);
    const idx = logs.findIndex((l) => l.id === log.id);
    if (idx >= 0) logs[idx] = log;
    else logs.push(log);
    localStorage.setItem(logsKey(log.carId), JSON.stringify(logs));
}

export function deleteLog(carId, logId) {
    const logs = getLogs(carId).filter((l) => l.id !== logId);
    localStorage.setItem(logsKey(carId), JSON.stringify(logs));
}

// ---------- Calculations ----------

/**
 * Tính toán cho 1 log:
 *   energyNeeded (Wh) = batteryCapacity × (endSoc - startSoc) / 100
 *   durationHours     = (endTime - startTime) in hours
 *   actualPower (W)   = energyNeeded / durationHours  (công suất đầu ra thực tế)
 *   efficiency (%)    = actualPower / chargerPower × 100
 *   gridEnergy (Wh)   = energyNeeded / (efficiency/100)
 *   cost (đ)          = gridEnergy/1000 × electricityCost
 *   chargingKm        = energyNeeded / (consumptionPer100km/100)  km
 *   chargingSpeedKmH  = chargingKm / durationHours  km/h
 */
export function calcLog(log, car) {
    const socDelta = log.endSoc - log.startSoc;
    if (socDelta <= 0) return null;

    const energyNeeded = (car.batteryCapacity * socDelta) / 100; // Wh vào pin
    const start = new Date(log.startTime);
    const end = new Date(log.endTime);
    const durationMs = end - start;
    if (durationMs <= 0) return null;
    const durationHours = durationMs / 3_600_000;
    const durationMinutes = durationMs / 60_000;

    const actualPower = energyNeeded / durationHours; // W thực tế ra pin
    const efficiency = log.chargerPower > 0 ? (actualPower / log.chargerPower) * 100 : 0;
    const gridEnergy = efficiency > 0 ? energyNeeded / (efficiency / 100) : energyNeeded; // Wh lưới
    const cost =
        log.electricityCost > 0 ? (gridEnergy / 1000) * log.electricityCost : null;

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
 * Tổng hợp hiệu suất thực tế từ tất cả log:
 *   avgEfficiency = mean(efficiency của mỗi log có data hợp lệ)
 *   totalEnergy   = tổng gridEnergy (Wh)
 *   totalCost     = tổng cost
 *   sessionCount  = số lần sạc hợp lệ
 */
export function calcCarStats(logs, car) {
    const computed = logs
        .map((l) => calcLog(l, car))
        .filter(Boolean);

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
