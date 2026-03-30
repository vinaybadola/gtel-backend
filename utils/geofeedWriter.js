import { spawn } from "child_process";
import { geoFeedServer, geoFeedServerPath } from "../config/env.config.js";
import categoryModel from "../src/models/category.model.js";
import { HEADER_CONFIG } from "../config/geofeed.config.js";

const buffers = {
    general: [],
};

// helper for CSV-safe values
const safe = (val) => `"${String(val || "").replace(/"/g, '""')}"`;

const buildRow = (data) => [
    safe(data.ip),
    safe(data.countryCode),
    safe(data.regionCode),
    safe(data.city),
    safe(data.postalCode)
].join(",");

// get header dynamically
const getHeader = (key) => {
    const headers = HEADER_CONFIG[key] || HEADER_CONFIG.general;
    return headers.join(",");
};

// push row to buffer
export const processGeoFeedWrite = async (data) => {
    try {
        const {
            ip,
            countryCode,
            regionCode,
            city,
            postalCode,
            categories = []
        } = data;

        let categoryDocs = [];

        if (categories.length > 0) {
            categoryDocs = await categoryModel.find({
                _id: { $in: categories }
            }).select("name").lean();
        }

        const categoryNames = categoryDocs.map(c => c.name.toLowerCase());

        const payload = { ip, countryCode, regionCode, city, postalCode };

        // always write to general
        buffers.general.push(payload);

        // category-specific buffers
        categoryNames.forEach(cat => {
            if (cat === "general") return;
            if (!buffers[cat]) buffers[cat] = [];
            buffers[cat].push(payload);
        });

    } catch (err) {
        console.error("GeoFeed async processing error:", err);
    }
};

// flush buffer every 5 sec
setInterval(() => {
    Object.keys(buffers).forEach((key) => {
        const items = buffers[key];

        if (!items.length) return;

        buffers[key] = []; // reset early

        const fileName =
            key === "general"
                ? "test-geofeed.csv"
                : `${key}-geofeed.csv`;

        const remotePath = `${geoFeedServerPath}/${fileName}`;

        // build rows (same structure everywhere)
        const rows = items.map(buildRow);
        const data = rows.join("\n");

        // escape for SSH
        const safeData = data.replace(/"/g, '\\"');

        const header = getHeader(key);

        console.log("Writing to:", remotePath);

        const command = `
            if [ ! -s "${remotePath}" ]; then
                echo "${header}" > "${remotePath}";
            fi;
            printf "%b\\n" "${safeData}" >> "${remotePath}"
        `;

        const ssh = spawn("ssh", [
            "-o", "StrictHostKeyChecking=no",
            geoFeedServer,
            command
        ]);

        ssh.stderr.on("data", (data) => {
            console.error("SSH STDERR:", data.toString());
        });

        ssh.on("error", (err) => {
            console.error("SSH error:", err);
        });

        ssh.on("close", (code) => {
            if (code !== 0) {
                console.error(`SSH exited with code ${code}`);

                // retry (put data back)
                buffers[key].unshift(...items);
            }
        });

        ssh.on("exit", (code, signal) => {
            console.log("SSH EXIT:", code, signal);
        });

    });
}, 5000);