# Cloud-native Process Control Demo - Simulation

Simulation portion of process control demonstration running on a kubernetes cluster.

- This brew process simulation includes a tank with a temperature sensor and heater.
- The simulation communicates via MQTT topics with the control and visualization components.
- The simulation, MQTT broker, control and visualization components are deployed as containers.

![Alt text](system.png?raw=true "UI")
