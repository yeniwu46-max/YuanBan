#!/usr/bin/env python3
"""MQTT device simulator for Yuanbanban."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone

import paho.mqtt.client as mqtt

DEFAULT_HOST = "localhost"
DEFAULT_PORT = 1883
DEFAULT_PREFIX = "yuanbanban"


def publish(host: str, port: int, prefix: str, elder_id: str, channel: str, payload: dict) -> None:
    topic = f"{prefix}/{elder_id}/{channel}"
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.connect(host, port, 60)
    client.publish(topic, json.dumps(payload), qos=1)
    client.disconnect()
    print(f"Published to {topic}: {payload}")


def cmd_sos(args: argparse.Namespace) -> None:
    publish(
        args.host,
        args.port,
        args.prefix,
        args.elder,
        "event",
        {
            "type": "sos",
            "device_id": args.device,
            "location": args.location,
            "ts": datetime.now(timezone.utc).isoformat(),
        },
    )


def cmd_fall(args: argparse.Namespace) -> None:
    publish(
        args.host,
        args.port,
        args.prefix,
        args.elder,
        "event",
        {
            "type": "fall",
            "device_id": args.device,
            "location": args.location,
            "ts": datetime.now(timezone.utc).isoformat(),
        },
    )


def cmd_vitals(args: argparse.Namespace) -> None:
    publish(
        args.host,
        args.port,
        args.prefix,
        args.elder,
        "vitals",
        {"heart_rate": args.heart_rate, "breath_rate": args.breath_rate},
    )


def cmd_offline(args: argparse.Namespace) -> None:
    publish(
        args.host,
        args.port,
        args.prefix,
        args.elder,
        "device",
        {"type": "offline", "device_id": args.device},
    )


def cmd_low_battery(args: argparse.Namespace) -> None:
    publish(
        args.host,
        args.port,
        args.prefix,
        args.elder,
        "device",
        {"type": "low_battery", "device_id": args.device, "battery": args.battery},
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Yuanbanban device simulator")
    parser.add_argument("--host", default=DEFAULT_HOST)
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--prefix", default=DEFAULT_PREFIX)
    parser.add_argument("--elder", default="elder-001")
    parser.add_argument("--device", default="d3")
    parser.add_argument("--location", default="卧室")

    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("sos").set_defaults(func=cmd_sos)
    sub.add_parser("fall").set_defaults(func=cmd_fall)
    sub.add_parser("offline").set_defaults(func=cmd_offline)

    vitals = sub.add_parser("vitals")
    vitals.add_argument("--heart-rate", type=int, default=84)
    vitals.add_argument("--breath-rate", type=int, default=19)
    vitals.set_defaults(func=cmd_vitals)

    low = sub.add_parser("low_battery")
    low.add_argument("--battery", type=int, default=23)
    low.set_defaults(func=cmd_low_battery)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
