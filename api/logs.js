/**
 * /api/logs?carId=xxx
 * GET    → trả về log của xe (query: carId)
 * POST   → tạo / upsert log (body: ChargeLog object)
 * PUT    → cập nhật log (body: ChargeLog object có id)
 * DELETE → xóa log (body: { carId, id })
 */

import { getJson, setJson, handleOptions, json, readBody } from './_redis.js';

const logsKey = (carId) => `ev:logs:${carId}`;

export default async function handler(req, res) {
    if (handleOptions(req, res)) return;

    try {
        switch (req.method) {
            case 'GET': {
                const carId = req.query?.carId ?? new URL(req.url, 'http://x').searchParams.get('carId');
                if (!carId) return json(res, 400, { error: 'Missing carId' });

                const logs = (await getJson(logsKey(carId))) ?? [];
                return json(res, 200, logs);
            }

            case 'POST': {
                const log = await readBody(req);
                if (!log.id || !log.carId) return json(res, 400, { error: 'Missing id or carId' });

                const logs = (await getJson(logsKey(log.carId))) ?? [];
                const exists = logs.findIndex((l) => l.id === log.id);
                if (exists >= 0) logs[exists] = log;
                else logs.push(log);

                await setJson(logsKey(log.carId), logs);
                return json(res, 200, log);
            }

            case 'PUT': {
                const log = await readBody(req);
                if (!log.id || !log.carId) return json(res, 400, { error: 'Missing id or carId' });

                const logs = (await getJson(logsKey(log.carId))) ?? [];
                const idx = logs.findIndex((l) => l.id === log.id);
                if (idx < 0) return json(res, 404, { error: 'Log not found' });

                logs[idx] = log;
                await setJson(logsKey(log.carId), logs);
                return json(res, 200, log);
            }

            case 'DELETE': {
                const { carId, id } = await readBody(req);
                if (!carId || !id) return json(res, 400, { error: 'Missing carId or id' });

                const logs = (await getJson(logsKey(carId))) ?? [];
                const filtered = logs.filter((l) => l.id !== id);
                await setJson(logsKey(carId), filtered);

                return json(res, 200, { ok: true });
            }

            default:
                return json(res, 405, { error: 'Method not allowed' });
        }
    } catch (err) {
        console.error('[/api/logs]', err);
        return json(res, 500, { error: err.message });
    }
}
