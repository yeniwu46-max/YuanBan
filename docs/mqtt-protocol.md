# MQTT 协议（初版）

## Topic 约定

```text
yuanbanban/{elder_id}/vitals      # 心率、呼吸等体征
yuanbanban/{elder_id}/event       # sos | fall | stillness
yuanbanban/{elder_id}/device      # online | offline | low_battery
```

## Payload 示例

### SOS 事件

```json
{
  "type": "sos",
  "device_id": "d3",
  "location": "卧室",
  "ts": "2026-05-24T09:18:00+00:00"
}
```

### 体征

```json
{
  "heart_rate": 84,
  "breath_rate": 19
}
```

### 设备离线

```json
{
  "type": "offline",
  "device_id": "d1"
}
```

## 模拟器 CLI

```bash
cd services/device-simulator
pip install -r requirements.txt
python simulator.py sos --elder elder-001
python simulator.py fall --elder elder-001
python simulator.py vitals --heart-rate 84 --breath-rate 19
python simulator.py offline --device d1
python simulator.py low_battery --device d3 --battery 23
```

## HTTP 触发（开发用）

```bash
curl -X POST http://localhost:8000/api/v1/simulator/trigger \
  -H "Content-Type: application/json" \
  -d '{"event_type":"sos","elder_id":"elder-001","device_id":"d3","location":"卧室"}'
```
