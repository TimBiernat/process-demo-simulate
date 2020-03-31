import * as dotenv from "dotenv";
import * as mqtt from "mqtt";
import * as winston from "winston";
import { format, log } from "winston";

export async function env() {
    dotenv.config({ path: "config.env" });
}

export function comms(clientId: string): mqtt.Client {
    const connectOptions = { clean: false, clientId };
    return mqtt.connect(process.env.MQTT_URI, connectOptions);
}

export async function logger() {
    let level = process.env.LOG_LEVEL;
    if (level === undefined) {
        level = "info";
    }
    winston.configure({
        transports: [
            new winston.transports.Console({
                format: format.combine(
                    format.timestamp(),
                    format.colorize(),
                    format.splat(),
                    format.simple(),
                    format.printf((msg) => `${msg.timestamp} ${msg.level}: ${msg.message}`),
                ),
                level: (level),
            })],
    });
    log("info", "logger configured: %s", level);
}
