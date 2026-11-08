/**
 * /api/cars
 * GET    → trả về danh sách xe
 * POST   → tạo xe mới (body: Car object)
 * PUT    → cập nhật xe (body: Car object có id)
 * DELETE → xóa xe (body: { id })  — cũng xóa toàn bộ log của xe đó
 */

import { getJson, setJson, redis, handleOptions, json, readBody, CORS } from './_redis.js';

const CARS_KEY = 'ev:cars';

export default async function handler(req, res) {
    if (handleOptions(req, res)) return;

    try {
        switch (req.method) {
            case 'GET': {
                const cars = (await getJson(CARS_KEY)) ?? [];
                return json(res, 200, cars);
            }

            case 'POST': {
                const car = await readBody(req);
                if (!car.id || !car.name) return json(res, 400, { error: 'Missing id or name' });

                const cars = (await getJson(CARS_KEY)) ?? [];
                const exists = cars.findIndex((c) => c.id === car.id);
                if (exists >= 0) cars[exists] = car;
                else cars.push(car);

                await setJson(CARS_KEY, cars);
                return json(res, 200, car);
            }

            case 'PUT': {
                const car = await readBody(req);
                if (!car.id) return json(res, 400, { error: 'Missing id' });

                const cars = (await getJson(CARS_KEY)) ?? [];
                const idx = cars.findIndex((c) => c.id === car.id);
                if (idx < 0) return json(res, 404, { error: 'Car not found' });

                cars[idx] = car;
                await setJson(CARS_KEY, cars);
                return json(res, 200, car);
            }

            case 'DELETE': {
                const { id } = await readBody(req);
                if (!id) return json(res, 400, { error: 'Missing id' });

                const cars = (await getJson(CARS_KEY)) ?? [];
                const filtered = cars.filter((c) => c.id !== id);
                await setJson(CARS_KEY, filtered);

                // Xóa log của xe này luôn
                await redis('DEL', `ev:logs:${id}`);

                return json(res, 200, { ok: true });
            }

            default:
                return json(res, 405, { error: 'Method not allowed' });
        }
    } catch (err) {
        console.error('[/api/cars]', err);
        return json(res, 500, { error: err.message });
    }
}
