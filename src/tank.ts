import * as mqtt from "mqtt";
import { log } from "winston";
import * as config from "./config";

const qos0: mqtt.QoS = 0;
const qos0NoRetainOpts = { qos: qos0, retained: false };
const clientId = "simulation_" + Math.random().toString(16).substr(2, 8);

/**
 * TBrew kettle simulation based on simple physical mnodel.
 * Includes temperature sensor and heater.
 * All communications pubsub via msg broker.
 */
export default class Tank {
    heat: number = 0;  // 1W: 0.00095 BTU/s --> 0.000113F for 1gal in 1s
    temp: number;
    ambient: number = 70; // ambient temp of environment
    loss: number = -0.00001; // temp per sec
    update: number = 1000;  // ms

    constructor(readonly name: string, readonly level: number, temp: number) {
        this.temp = temp;
    }

    simulate() {
        let client: mqtt.Client;
        config.env();
        config.logger();
        try {
            client = config.comms(clientId);
            client.on("connect", () => {
                log("info", "simulation %s connected", clientId);
                client.subscribe(this.name + "/heat", qos0NoRetainOpts);
            });
            client.on("message", (topic: string, message: string) => {
                if (this.name + "/heat" === topic) {
                    this.heat = parseFloat(message);
                }
            });
            client.on("reconnect", () => {
                log("info", "MQTT reconnected: %s", process.env.MQTT_URI);
            });
            client.on("close", () => {
                client.unsubscribe(process.env.TOPIC);
                log("error", "MQTT connection closed: %s", process.env.MQTT_URI);
            });
            client.on("error", () => {
                client.unsubscribe(process.env.TOPIC);
                log("error", "MQTT connection error: %s", process.env.MQTT_URI);
            });
            setInterval(() => {
                if (this.level > 0) {
                    // energy loss
                    const delta = this.temp - this.ambient;
                    if (delta > 0) {
                        this.temp += delta * this.loss;
                    }
                    // energy gain
                    if (this.heat !== 0 && this.level > 0) {
                        this.temp += (this.heat * 0.000113 / this.level);
                    }
                }
                client.publish(this.name + "/temp", this.temp.toString(), qos0NoRetainOpts);
            }, this.update);
        } catch (err) {
            log("error", "Shutting down: %s", err);
            if (client) {
                client.unsubscribe(this.name + "/heat");
            }
            process.exit(1);
        }
    }
}

const tank = new Tank("tank", 100, 100);
tank.simulate();
