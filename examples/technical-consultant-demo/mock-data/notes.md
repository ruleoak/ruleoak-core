# Service Review Notes

Known pattern: when checkout-service database pool utilization exceeds 90%, request latency and timeout errors can rise even if CPU and memory are not saturated.

Safe review steps:

1. Confirm whether external payment latency is normal.
2. Compare service CPU/memory with database pool pressure.
3. Avoid automatic production change.
4. Ask for approval before restart, capacity change, or customer notification.
