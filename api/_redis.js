/**
 * Minimal Upstash Redis REST client — không cần package ngoài.
 * Dùng chung cho tất cả Vercel API functions.
 */

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Gọi lệnh Redis qua REST API.
 * @param  {...(string|number)} args  — ví dụ: redis('GET', 'key'), redis('HSET', 'key', 'field', 'value')
 * @returns {Promise<any>}  result từ Upstash
 */
export async function redis(...args) {
    const res = await fetch(`${REDIS_URL}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${REDIS_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upstash error ${res.status}: ${text}`);
    }

    const { result, error } = await res.json();
    if (error) throw new Error(`Redis error: ${error}`);
    return result;
}

/** Lấy JSON object từ key, trả về null nếu không có */
export async function getJson(key) {
    const val = await redis('GET', key);
    if (val === null) return null;
    return typeof val === 'string' ? JSON.parse(val) : val;
}

/** Lưu JSON object vào key */
export async function setJson(key, value) {
    return redis('SET', key, JSON.stringify(value));
}

/** Helper CORS headers — cho phép FE gọi API */
export const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

/** Preflight handler */
export function handleOptions(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, CORS);
        res.end();
        return true;
    }
    return false;
}

/** JSON response helper */
export function json(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json', ...CORS });
    res.end(JSON.stringify(data));
}

/** Đọc request body thành object */
export function readBody(req) {
    return new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', (chunk) => (raw += chunk));
        req.on('end', () => {
            try { resolve(raw ? JSON.parse(raw) : {}); }
            catch (e) { reject(e); }
        });
        req.on('error', reject);
    });
}
