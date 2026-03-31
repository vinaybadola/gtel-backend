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

const getHeader = (key) => {
    const headers = HEADER_CONFIG[key] || HEADER_CONFIG.general;
    return headers.join(",");
};

export const processGeoFeedWrite = async (data) => {
    try {
        const documents = Array.isArray(data) ? data : [data];

        console.log(`Processing ${documents.length} GeoFeed document(s)`);

        for (const doc of documents) {
            const {
                ip,
                countryCode,
                regionCode,
                city,
                postalCode,
                categories = []
            } = doc;

            console.log(`Processing IP: ${ip}, Categories: ${categories.length}`);

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
            console.log(`Added to general buffer for IP: ${ip}`);

            // category-specific buffers
            categoryNames.forEach(cat => {
                if (cat === "general") return;
                if (!buffers[cat]) buffers[cat] = [];
                buffers[cat].push(payload);
                console.log(`Added to ${cat} buffer for IP: ${ip}`);
            });
        }

        console.log(`Total items in general buffer: ${buffers.general.length}`);

    } catch (err) {
        console.error("GeoFeed async processing error:", err);
    }
};

setInterval(() => {
    Object.keys(buffers).forEach((key) => {
        const items = buffers[key];

        if (!items.length) return;

        buffers[key] = [];

        const fileName =
            key === "general"
                ? "geofeed.csv"
                : `${key}-geofeed.csv`;

        const remotePath = `${geoFeedServerPath}/${fileName}`;

        const rows = items.map(buildRow);
        const data = rows.join("\n");

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