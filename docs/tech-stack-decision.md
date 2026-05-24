# 鼋伴伴技术栈选型

## 最终推荐

“鼋伴伴”建议采用：

- 前端：uni-app + Vue 3 + TypeScript
- 移动端形态：微信小程序优先，同时输出 H5；后续需要 App 时再打包 App
- 管理网页端：同一套 uni-app H5 先支撑，试点后再拆独立 Vue 3 管理后台
- 后端：FastAPI + Python
- 数据库：PostgreSQL
- 缓存与告警状态：Redis
- 设备通信：MQTT，开发期用 EMQX 本地 Broker
- 实时前端通知：WebSocket 或 Server-Sent Events
- 硬件端：ESP32-S3 + Arduino/ESP-IDF，先用 MQTT 上报模拟数据，再接毫米波雷达
- 算法服务：Python 独立服务，先用规则/模拟接口占位，后续接跌倒检测和情绪识别模型
- 部署：Docker Compose，本地和演示服务器保持同一套启动方式

## 为什么这样选

### 1. 前端选 uni-app，而不是纯 Vue H5、Flutter 或 React Native

项目明确移动端优先，且申报书多次强调微信小程序作为轻量入口。uni-app 能覆盖 H5、App、微信小程序等端，Vue 3 的常用响应式能力也覆盖 H5、App、微信小程序，适合大创项目快速做出可演示产品。

不优先选 Flutter/React Native 的原因：

- 微信小程序不是它们的天然主场，后续需要额外适配。
- 老人端和子女端更需要轻量入口，小程序比安装 App 更符合使用场景。
- 大创团队通常前端协作和 UI 调整频繁，Vue/uni-app 学习成本更低。

不优先选 Taro 的原因：

- Taro 也很强，适合 React/Vue 多端开发。
- 但项目核心不是复杂前端工程能力，而是尽快完成适老化页面、告警闭环和硬件联调。
- 若团队已有 React 基础，可改用 Taro + React；否则 uni-app 更稳。

### 2. 后端选 FastAPI，而不是 Spring Boot 或 NestJS

项目后续要接情绪识别、跌倒检测、生命体征异常检测等 Python 算法。FastAPI 能直接承接 Python 算法接口，减少跨语言胶水代码，同时自带接口文档能力，方便前后端和算法同学联调。

不优先选 Spring Boot 的原因：

- 稳定但偏重，大创 MVP 阶段开发成本高。
- 和 Python 算法团队联调会多一层服务边界。

不优先选 NestJS 的原因：

- 如果团队全栈 TypeScript 很强，NestJS 可以选。
- 但本项目算法侧明显更偏 Python，FastAPI 更顺。

### 3. 设备通信选 MQTT

养老设备会持续上报心率、呼吸、活动状态、跌倒事件、设备在线状态。MQTT 是典型 IoT 场景的轻量发布/订阅协议，适合低带宽、低功耗设备和实时事件上报。EMQX 文档也把 MQTT 描述为 IoT 中常用的轻量 pub/sub 协议，并支持不同 QoS 等级。

开发期建议：

- 本地 EMQX Broker。
- 设备模拟器先发 MQTT 消息。
- 后端订阅设备主题，生成告警和健康数据。
- 后续 ESP32-S3 使用 MQTT 客户端库替换模拟器。

### 4. 数据库选 PostgreSQL + Redis

PostgreSQL 用来存用户、老人档案、设备、传感记录、告警事件、健康报告、积分流水、社区服务单等核心数据。它适合关系清晰、需要事务可靠性的业务系统。

Redis 用来处理：

- 告警去重。
- 设备在线状态。
- 短期实时数据缓存。
- 通知限流。
- WebSocket/SSE 推送状态。

### 5. 算法不要一开始做重

第一版应先做“规则算法 + 模拟数据”：

- 心率异常：阈值 + 持续时间。
- 呼吸异常：阈值 + 滑动窗口。
- 跌倒事件：设备模拟器直接上报 `fall_detected`。
- 情绪识别：先用心情按钮和关键词规则。

等产品闭环稳定后，再把规则替换成真实模型接口：

- 跌倒检测：毫米波雷达数据 -> 算法服务 -> 事件置信度。
- 情绪识别：语音/文本 -> 情绪标签 -> 原因分析 -> 小鼋回应策略。

## 推荐架构

```text
老人端/子女端 uni-app
        |
        | HTTPS / WebSocket
        v
FastAPI 后端 API
        |
        | ORM / Cache
        v
PostgreSQL + Redis
        ^
        |
        | MQTT subscribe
        |
EMQX MQTT Broker
        ^
        |
ESP32-S3 设备 / 设备模拟器

算法服务 Python
        ^
        |
FastAPI 通过内部 HTTP 调用
```

## 第一阶段工程结构

```text
yuanbanban/
  apps/
    mobile/          # uni-app 老人端 + 子女端 + H5
    admin/           # 可选，后期独立社区后台
  services/
    api/             # FastAPI 主后端
    algorithm/       # Python 算法服务，占位接口先行
    device-simulator/# MQTT 设备模拟器
  firmware/
    esp32-s3/        # 硬件代码
  infra/
    docker-compose.yml
    emqx/
    postgres/
  docs/
```

## MVP 开发顺序

1. 搭 `FastAPI + PostgreSQL + Redis + EMQX`。
2. 写设备模拟器，通过 MQTT 上报心率、呼吸、跌倒、SOS、离线。
3. 写后端订阅 MQTT，生成告警事件和健康记录。
4. 做 uni-app 老人端首页、SOS、健康摘要、小鼋心情记录。
5. 做子女端告警列表、老人状态、健康报告、远程提醒。
6. 做社区网页端告警处理。
7. 加 WebSocket/SSE，让告警实时推送到前端。
8. 接真实 ESP32-S3 和毫米波雷达。

## 什么时候换技术栈

只有以下情况才建议改选：

- 团队已有很强 React 基础：前端可换 Taro + React。
- 学校或比赛要求必须原生 App：可后期补 Flutter 壳，但不建议第一版这么做。
- 后端成员全是 Java：可换 Spring Boot，但算法服务仍保留 Python。
- 不做微信小程序，只做网页：可直接 Vue 3 + Vite + PWA。

当前项目最合适的默认方案仍是：uni-app + Vue 3 + TypeScript + FastAPI + PostgreSQL + Redis + MQTT/EMQX。

